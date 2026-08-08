import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Mail, MapPin, Pencil, Phone, Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteOpponent,
  opponentsQueryOptions,
  saveOpponent,
} from "@/lib/opponents.functions";
import { matchesQueryOptions } from "@/lib/matches.functions";

export const Route = createFileRoute("/opponents")({
  head: () => ({
    meta: [
      { title: "Rubrica avversari — Team Manager" },
      {
        name: "description",
        content:
          "Archivio delle squadre avversarie: contatti, campo di gioco, modulo abituale, punti di forza e note tattiche.",
      },
      { property: "og:title", content: "Rubrica avversari — Team Manager" },
      {
        property: "og:description",
        content:
          "Contatti, campo, modulo e note tattiche di ogni squadra avversaria, con lo storico dei precedenti.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(opponentsQueryOptions()),
      context.queryClient.ensureQueryData(matchesQueryOptions()),
    ]),
  component: OpponentsPage,
});

type FormState = {
  id?: string | null;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  venue: string;
  colors: string;
  usual_formation: string;
  strengths: string;
  weaknesses: string;
  notes: string;
};

const emptyForm: FormState = {
  id: null,
  name: "",
  contact_name: "",
  phone: "",
  email: "",
  venue: "",
  colors: "",
  usual_formation: "",
  strengths: "",
  weaknesses: "",
  notes: "",
};

function OpponentsPage() {
  const queryClient = useQueryClient();
  const { data: opponents } = useSuspenseQuery(opponentsQueryOptions());
  const { data: matches } = useSuspenseQuery(matchesQueryOptions());

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: (values: FormState) =>
      saveOpponent({
        data: {
          id: values.id || null,
          name: values.name.trim(),
          contact_name: values.contact_name || null,
          phone: values.phone || null,
          email: values.email || null,
          venue: values.venue || null,
          colors: values.colors || null,
          usual_formation: values.usual_formation || null,
          strengths: values.strengths || null,
          weaknesses: values.weaknesses || null,
          notes: values.notes || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opponents"] });
      setOpen(false);
      setForm(emptyForm);
      toast.success("Avversario salvato");
    },
    onError: () => toast.error("Errore durante il salvataggio"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOpponent({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opponents"] });
      setToDelete(null);
      toast.success("Avversario eliminato");
    },
    onError: () => toast.error("Errore durante l'eliminazione"),
  });

  const recordByName = useMemo(() => {
    const map = new Map<
      string,
      { played: number; won: number; drawn: number; lost: number }
    >();
    for (const m of matches) {
      const key = (m.opponent ?? "").trim().toLowerCase();
      if (!key) continue;
      const entry =
        map.get(key) ?? { played: 0, won: 0, drawn: 0, lost: 0 };
      const gf = m.score_team ?? 0;
      const ga = m.score_opponent ?? 0;
      entry.played += 1;
      if (gf > ga) entry.won += 1;
      else if (gf === ga) entry.drawn += 1;
      else entry.lost += 1;
      map.set(key, entry);
    }
    return map;
  }, [matches]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return opponents;
    return opponents.filter((o) =>
      [o.name, o.venue, o.contact_name]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [opponents, search]);

  const openNew = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (o: (typeof opponents)[number]) => {
    setForm({
      id: o.id,
      name: o.name ?? "",
      contact_name: o.contact_name ?? "",
      phone: o.phone ?? "",
      email: o.email ?? "",
      venue: o.venue ?? "",
      colors: o.colors ?? "",
      usual_formation: o.usual_formation ?? "",
      strengths: o.strengths ?? "",
      weaknesses: o.weaknesses ?? "",
      notes: o.notes ?? "",
    });
    setOpen(true);
  };

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rubrica avversari</h1>
          <p className="text-sm text-muted-foreground">
            Contatti, campo, modulo e note tattiche di ogni squadra.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo avversario
        </Button>
      </div>

      <Input
        placeholder="Cerca per squadra, campo o referente…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">
          Nessun avversario in rubrica.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => {
            const rec = recordByName.get(o.name.trim().toLowerCase());
            return (
              <Card key={o.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{o.name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {o.usual_formation && (
                        <Badge variant="secondary">{o.usual_formation}</Badge>
                      )}
                      {o.colors && <Badge variant="outline">{o.colors}</Badge>}
                      {rec && (
                        <Badge variant="outline">
                          {rec.played} PG · {rec.won}V {rec.drawn}N {rec.lost}P
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(o)}
                      aria-label={`Modifica ${o.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setToDelete(o.id)}
                      aria-label={`Elimina ${o.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {o.contact_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {o.contact_name}
                    </div>
                  )}
                  {o.phone && (
                    <a
                      href={`tel:${o.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {o.phone}
                    </a>
                  )}
                  {o.email && (
                    <a
                      href={`mailto:${o.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {o.email}
                    </a>
                  )}
                  {o.venue && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {o.venue}
                    </div>
                  )}
                  {o.strengths && (
                    <p>
                      <span className="font-medium">Punti di forza: </span>
                      {o.strengths}
                    </p>
                  )}
                  {o.weaknesses && (
                    <p>
                      <span className="font-medium">Punti deboli: </span>
                      {o.weaknesses}
                    </p>
                  )}
                  {o.notes && (
                    <p className="text-muted-foreground">{o.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Modifica avversario" : "Nuovo avversario"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Squadra *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_name">Referente</Label>
              <Input
                id="contact_name"
                value={form.contact_name}
                onChange={(e) => set("contact_name")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue">Campo</Label>
              <Input
                id="venue"
                value={form.venue}
                onChange={(e) => set("venue")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="colors">Colori maglia</Label>
              <Input
                id="colors"
                value={form.colors}
                onChange={(e) => set("colors")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usual_formation">Modulo abituale</Label>
              <Input
                id="usual_formation"
                placeholder="4-3-3"
                value={form.usual_formation}
                onChange={(e) => set("usual_formation")(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="strengths">Punti di forza</Label>
              <Textarea
                id="strengths"
                value={form.strengths}
                onChange={(e) => set("strengths")(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="weaknesses">Punti deboli</Label>
              <Textarea
                id="weaknesses"
                value={form.weaknesses}
                onChange={(e) => set("weaknesses")(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Note</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => set("notes")(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button
              disabled={!form.name.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate(form)}
            >
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(v) => !v && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo avversario?</AlertDialogTitle>
            <AlertDialogDescription>
              L'operazione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && deleteMutation.mutate(toDelete)}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}