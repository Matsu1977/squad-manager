import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setPlayerContribution } from "@/lib/match-stats.functions";

export type ContributionPlayer = {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
};

export type ContributionRow = {
  player_id: string;
  goals: number;
  assists: number;
};

export function MatchContributionsEditor({
  matchId,
  players,
  initialRows,
  invalidateKeys = [],
}: {
  matchId: string;
  players: ContributionPlayer[];
  initialRows: ContributionRow[];
  invalidateKeys?: unknown[][];
}) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<ContributionRow[]>(initialRows);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const mutation = useMutation({
    mutationFn: (row: ContributionRow) =>
      setPlayerContribution({
        data: {
          match_id: matchId,
          player_id: row.player_id,
          goals: row.goals,
          assists: row.assists,
        },
      }),
    onSuccess: () => {
      setSaved(true);
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      queryClient.invalidateQueries({ queryKey: ["match-stats", matchId] });
    },
    onError: () => toast.error("Errore nel salvataggio automatico"),
  });

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1800);
    return () => clearTimeout(t);
  }, [saved]);

  const playerById = useMemo(() => {
    const map = new Map<string, ContributionPlayer>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const available = players.filter(
    (p) => !rows.some((r) => r.player_id === p.id)
  );

  const persist = (row: ContributionRow) => {
    setRows((prev) =>
      prev.map((r) => (r.player_id === row.player_id ? row : r))
    );
    mutation.mutate(row);
  };

  const bump = (
    row: ContributionRow,
    field: "goals" | "assists",
    delta: number
  ) => {
    const next = {
      ...row,
      [field]: Math.max(0, Math.min(20, row[field] + delta)),
    };
    if (next.goals === row.goals && next.assists === row.assists) return;
    persist(next);
  };

  const remove = (row: ContributionRow) => {
    setRows((prev) => prev.filter((r) => r.player_id !== row.player_id));
    mutation.mutate({ ...row, goals: 0, assists: 0 });
  };

  const addPlayer = (playerId: string) => {
    setRows((prev) => [...prev, { player_id: playerId, goals: 1, assists: 0 }]);
    mutation.mutate({ player_id: playerId, goals: 1, assists: 0 });
  };

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Marcatori e assist</p>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {mutation.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Salvataggio…
            </>
          ) : saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Salvato
            </>
          ) : (
            "Salvataggio automatico"
          )}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nessun marcatore registrato.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const p = playerById.get(row.player_id);
            return (
              <li
                key={row.player_id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  {p?.jersey_number != null && (
                    <Badge variant="outline">{p.jersey_number}</Badge>
                  )}
                  {p ? `${p.first_name} ${p.last_name}` : "Giocatore"}
                </span>
                <span className="flex items-center gap-3">
                  <Counter
                    label="Gol"
                    value={row.goals}
                    onChange={(d) => bump(row, "goals", d)}
                  />
                  <Counter
                    label="Assist"
                    value={row.assists}
                    onChange={(d) => bump(row, "assists", d)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Rimuovi giocatore"
                    onClick={() => remove(row)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {available.length > 0 && (
        <Select value="" onValueChange={addPlayer}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Aggiungi marcatore…" />
          </SelectTrigger>
          <SelectContent>
            {available.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.jersey_number != null ? `#${p.jersey_number} ` : ""}
                {p.first_name} {p.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (delta: number) => void;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        aria-label={`Diminuisci ${label}`}
        onClick={() => onChange(-1)}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="w-5 text-center font-medium">{value}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        aria-label={`Aumenta ${label}`}
        onClick={() => onChange(1)}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </span>
  );
}