import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { saveMatchStats } from "@/lib/match-stats.functions";

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  role: string;
};

type Stat = {
  player_id: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
};

type Row = Stat;

const FIELDS: {
  key: keyof Omit<Stat, "player_id">;
  label: string;
  max: number;
}[] = [
  { key: "minutes_played", label: "Min", max: 120 },
  { key: "goals", label: "Gol", max: 20 },
  { key: "assists", label: "Assist", max: 20 },
  { key: "yellow_cards", label: "Amm", max: 2 },
  { key: "red_cards", label: "Esp", max: 1 },
];

export function MatchStatsEditor({
  matchId,
  players,
  existing,
}: {
  matchId: string;
  players: Player[];
  existing: Stat[];
}) {
  const queryClient = useQueryClient();
  const initial = useMemo<Record<string, Row>>(() => {
    const map: Record<string, Row> = {};
    for (const p of players) {
      const e = existing.find((s) => s.player_id === p.id);
      map[p.id] = {
        player_id: p.id,
        goals: e?.goals ?? 0,
        assists: e?.assists ?? 0,
        yellow_cards: e?.yellow_cards ?? 0,
        red_cards: e?.red_cards ?? 0,
        minutes_played: e?.minutes_played ?? 0,
      };
    }
    return map;
  }, [players, existing]);

  const [rows, setRows] = useState<Record<string, Row>>(initial);

  const mutation = useMutation({
    mutationFn: saveMatchStats,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-stats", matchId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      toast.success("Statistiche salvate");
    },
    onError: (e) => toast.error(e.message || "Errore nel salvataggio"),
  });

  const roster = players.filter((p) => p.role !== "Allenatore");

  const set = (playerId: string, key: keyof Omit<Stat, "player_id">, value: number) =>
    setRows((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [key]: value },
    }));

  const onSave = () =>
    mutation.mutate({
      data: { match_id: matchId, stats: Object.values(rows) },
    });

  if (roster.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nessun giocatore in rosa. Aggiungi giocatori per registrare le
        statistiche.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Giocatore</TableHead>
              {FIELDS.map((f) => (
                <TableHead key={f.key} className="w-20 text-center">
                  {f.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {p.jersey_number != null && (
                    <span className="mr-2 text-muted-foreground">
                      #{p.jersey_number}
                    </span>
                  )}
                  {p.first_name} {p.last_name}
                </TableCell>
                {FIELDS.map((f) => (
                  <TableCell key={f.key} className="p-1">
                    <Input
                      type="number"
                      min={0}
                      max={f.max}
                      value={rows[p.id]?.[f.key] ?? 0}
                      onChange={(e) =>
                        set(p.id, f.key, Math.max(0, Number(e.target.value) || 0))
                      }
                      className="h-9 w-16 text-center"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button onClick={onSave} disabled={mutation.isPending}>
        <Save className="mr-2 h-4 w-4" />
        {mutation.isPending ? "Salvataggio..." : "Salva statistiche"}
      </Button>
    </div>
  );
}