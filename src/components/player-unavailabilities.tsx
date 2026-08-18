import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { HeartPulse, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteUnavailability,
  saveUnavailability,
  unavailabilitiesQueryOptions,
} from "@/lib/unavailabilities.functions";
import {
  UNAVAILABILITY_TYPES,
  UNAVAILABILITY_VARIANTS,
  UnavailabilityType,
  isUnavailableOn,
  todayISO,
} from "@/lib/team";

type Row = {
  id: string;
  player_id: string;
  type: string;
  reason: string | null;
  start_date: string;
  end_date: string | null;
  notes: string | null;
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const emptyForm = {
  id: null as string | null,
  type: "Infortunio" as string,
  reason: "",
  start_date: todayISO(),
  end_date: "",
  notes: "",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PlayerUnavailabilities({ playerId }: { playerId: string }) {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(unavailabilitiesQueryOptions());
  const rows = ((data ?? []) as unknown as Row[]).filter(
    (r) => r.player_id === playerId
  );

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["unavailabilities"] });

  const save = useMutation({
    mutationFn: saveUnavailability,
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setForm(emptyForm);
      toast.success("Periodo salvato");
    },
    onError: (e: Error) => toast.error(e.message || "Errore nel salvataggio"),
  });

  const remove = useMutation({
    mutationFn: deleteUnavailability,
    onSuccess: () => {
      invalidate();
      toast.success("Periodo eliminato");
    },
    onError: (e: Error) => toast.error(e.message || "Errore"),
  });

  const today = todayISO();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HeartPulse className="h-5 w-5" />
          Infortuni e sospensioni
        </CardTitle>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setForm(emptyForm);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Aggiungi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Modifica periodo" : "Nuovo periodo"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <select
                  className={selectClass}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {UNAVAILABILITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Motivo</Label>
                <Input
                  value={form.reason}
                  placeholder="Es. stiramento, squalifica 1 giornata"
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Inizio</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Rientro previsto</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Note</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={!form.start_date || save.isPending}
                onClick={() =>
                  save.mutate({
                    data: {
                      id: form.id,
                      player_id: playerId,
                      type: form.type as UnavailabilityType,
                      reason: form.reason,
                      start_date: form.start_date,
                      end_date: form.end_date,
                      notes: form.notes,
                    },
                  })
                }
              >
                Salva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nessun infortunio o sospensione registrato.
          </p>
        ) : (
          rows.map((r) => {
            const active = isUnavailableOn(r, today);
            return (
              <div
                key={r.id}
                className="flex items-start justify-between gap-3 rounded-md border p-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        UNAVAILABILITY_VARIANTS[r.type as UnavailabilityType] ??
                        "outline"
                      }
                    >
                      {r.type}
                    </Badge>
                    {active ? (
                      <Badge variant="destructive">In corso</Badge>
                    ) : (
                      <Badge variant="outline">Concluso</Badge>
                    )}
                    {r.reason ? (
                      <span className="text-sm font-medium">{r.reason}</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fmt(r.start_date)} →{" "}
                    {r.end_date ? fmt(r.end_date) : "da definire"}
                  </div>
                  {r.notes ? (
                    <p className="text-sm whitespace-pre-wrap">{r.notes}</p>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setForm({
                        id: r.id,
                        type: r.type,
                        reason: r.reason ?? "",
                        start_date: r.start_date,
                        end_date: r.end_date ?? "",
                        notes: r.notes ?? "",
                      });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove.mutate({ data: { id: r.id } })}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}