import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FORMATIONS, PLAYER_ROLES, ROLE_TEXT_COLORS } from "@/lib/team";
import type { PlayerRole } from "@/lib/team";
import { saveLineup } from "@/lib/lineups.functions";

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  role: string;
};

type Entry = {
  player_id: string;
  is_starter: boolean;
  selected: boolean;
  position_label: string;
};

export function LineupEditor({
  matchId,
  formation,
  players,
  existing,
}: {
  matchId: string;
  formation: string | null;
  players: Player[];
  existing: {
    player_id: string;
    is_starter: boolean;
    position_label: string | null;
  }[];
}) {
  const queryClient = useQueryClient();
  const roster = players.filter((p) => p.role !== "Allenatore");

  const initial = useMemo<Record<string, Entry>>(() => {
    const map: Record<string, Entry> = {};
    for (const p of roster) {
      const e = existing.find((x) => x.player_id === p.id);
      map[p.id] = {
        player_id: p.id,
        selected: !!e,
        is_starter: e?.is_starter ?? true,
        position_label: e?.position_label ?? "",
      };
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, existing]);

  const [rows, setRows] = useState<Record<string, Entry>>(initial);
  const [selectedFormation, setSelectedFormation] = useState<string>(
    formation ?? ""
  );

  const set = <K extends keyof Entry>(id: string, key: K, value: Entry[K]) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const mutation = useMutation({
    mutationFn: saveLineup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lineup", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Formazione salvata");
    },
    onError: (e) => toast.error(e.message || "Errore nel salvataggio"),
  });

  const entries = Object.values(rows).filter((r) => r.selected);
  const starters = entries.filter((r) => r.is_starter);
  const subs = entries.filter((r) => !r.is_starter);

  const onSave = () =>
    mutation.mutate({
      data: {
        match_id: matchId,
        formation: selectedFormation || null,
        entries: entries.map((r) => ({
          player_id: r.player_id,
          is_starter: r.is_starter,
          position_label: r.position_label || null,
        })),
      },
    });

  if (roster.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nessun giocatore in rosa. Aggiungi giocatori per creare la formazione.
      </p>
    );
  }

  // group by role for clarity
  const grouped = PLAYER_ROLES.filter((r) => r !== "Allenatore").map((role) => ({
    role: role as PlayerRole,
    list: roster.filter((p) => p.role === role),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-48">
          <label className="mb-1 block text-sm font-medium">Modulo</label>
          <Select
            value={selectedFormation || "none"}
            onValueChange={(v) => setSelectedFormation(v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona modulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nessuno</SelectItem>
              {FORMATIONS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Titolari: {starters.length}</Badge>
          <Badge variant="secondary">Riserve: {subs.length}</Badge>
          <Badge variant="outline">Convocati: {entries.length}</Badge>
        </div>
      </div>

      <div className="space-y-6">
        {grouped.map(({ role, list }) => {
          if (list.length === 0) return null;
          return (
            <div key={role} className="space-y-2">
              <h3
                className={`text-sm font-semibold uppercase tracking-wide ${ROLE_TEXT_COLORS[role]}`}
              >
                {role}
              </h3>
              <div className="space-y-1">
                {list.map((p) => {
                  const r = rows[p.id];
                  return (
                    <div
                      key={p.id}
                      className="flex flex-wrap items-center gap-3 rounded-md border p-2"
                    >
                      <Checkbox
                        checked={r.selected}
                        onCheckedChange={(v) =>
                          set(p.id, "selected", !!v)
                        }
                      />
                      <div className="min-w-[10rem] flex-1 text-sm">
                        {p.jersey_number != null && (
                          <span className="mr-2 text-muted-foreground">
                            #{p.jersey_number}
                          </span>
                        )}
                        {p.first_name} {p.last_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs">
                          <Checkbox
                            checked={r.is_starter}
                            disabled={!r.selected}
                            onCheckedChange={(v) =>
                              set(p.id, "is_starter", !!v)
                            }
                          />
                          Titolare
                        </label>
                        <Input
                          value={r.position_label}
                          disabled={!r.selected}
                          onChange={(e) =>
                            set(p.id, "position_label", e.target.value)
                          }
                          placeholder="Ruolo (es. CDC)"
                          className="h-8 w-32"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={onSave} disabled={mutation.isPending}>
        <Save className="mr-2 h-4 w-4" />
        {mutation.isPending ? "Salvataggio..." : "Salva formazione"}
      </Button>
    </div>
  );
}