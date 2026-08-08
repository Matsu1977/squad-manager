import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { allSkillsQueryOptions } from "@/lib/skills.functions";
import {
  SKILL_CATEGORIES,
  SKILL_STATUSES,
  SKILL_STATUS_VARIANTS,
  SkillStatus,
} from "@/lib/team";

type SkillRow = {
  id: string;
  player_id: string;
  name: string;
  category: string;
  current_level: number;
  target_level: number | null;
  status: string;
  player_skill_logs?: { id: string; level: number; log_date: string }[] | null;
  players?: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    jersey_number: number | null;
  } | null;
};

const selectClass =
  "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm";

export const Route = createFileRoute("/development")({
  head: () => ({
    meta: [
      { title: "Sviluppo giocatori — Team Manager" },
      {
        name: "description",
        content:
          "Monitora i progressi tecnici, atletici e tattici di tutti i giocatori della squadra.",
      },
      { property: "og:title", content: "Sviluppo giocatori — Team Manager" },
      {
        property: "og:description",
        content:
          "Monitora i progressi tecnici, atletici e tattici di tutti i giocatori della squadra.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(allSkillsQueryOptions());
  },
  component: DevelopmentPage,
  errorComponent: () => (
    <p className="text-destructive">Errore nel caricamento degli sviluppi.</p>
  ),
  notFoundComponent: () => <p>Pagina non trovata.</p>,
});

function delta(skill: SkillRow) {
  const logs = [...(skill.player_skill_logs ?? [])].sort((a, b) =>
    a.log_date < b.log_date ? -1 : 1
  );
  const first = logs[0];
  return first ? skill.current_level - first.level : 0;
}

function DevelopmentPage() {
  const { data } = useSuspenseQuery(allSkillsQueryOptions());
  const skills = (data ?? []) as unknown as SkillRow[];

  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(
    () =>
      skills.filter(
        (s) =>
          (category === "all" || s.category === category) &&
          (status === "all" || s.status === status)
      ),
    [skills, category, status]
  );

  const groups = useMemo(() => {
    const map = new Map<string, { player: SkillRow["players"]; items: SkillRow[] }>();
    for (const s of filtered) {
      const key = s.player_id;
      if (!map.has(key)) map.set(key, { player: s.players ?? null, items: [] });
      map.get(key)!.items.push(s);
    }
    return [...map.values()].sort((a, b) =>
      `${a.player?.last_name ?? ""}`.localeCompare(`${b.player?.last_name ?? ""}`)
    );
  }, [filtered]);

  const achieved = filtered.filter((s) => s.status === "Raggiunto").length;
  const avgDelta = filtered.length
    ? Math.round(
        (filtered.reduce((acc, s) => acc + delta(s), 0) / filtered.length) * 10
      ) / 10
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sviluppo giocatori</h1>
        <p className="text-sm text-muted-foreground">
          Tutti gli obiettivi di miglioramento della rosa, con progressi registrati.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Obiettivi monitorati</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{filtered.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Raggiunti</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{achieved}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso medio</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-2xl font-bold">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            {avgDelta > 0 ? "+" : ""}
            {avgDelta}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Categoria"
          className={selectClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Tutte le categorie</option>
          {SKILL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Stato"
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Tutti gli stati</option>
          {SKILL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground">
          Nessun obiettivo di sviluppo. Aprine uno dalla scheda di un giocatore.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map(({ player, items }) => (
            <Card key={player?.id ?? items[0]!.player_id}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">
                    {player
                      ? `${player.first_name} ${player.last_name}`
                      : "Giocatore"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {player?.role}
                    {player?.jersey_number ? ` · #${player.jersey_number}` : ""} ·{" "}
                    {items.length} obiettivi
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/players/$id" params={{ id: items[0]!.player_id }}>
                    Scheda
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((skill) => {
                  const d = delta(skill);
                  return (
                    <div key={skill.id} className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{skill.name}</span>
                        <Badge variant="outline">{skill.category}</Badge>
                        <Badge
                          variant={
                            SKILL_STATUS_VARIANTS[skill.status as SkillStatus] ??
                            "outline"
                          }
                        >
                          {skill.status}
                        </Badge>
                        {d !== 0 ? (
                          <span
                            className={`text-xs font-medium ${d > 0 ? "text-green-600" : "text-destructive"}`}
                          >
                            {d > 0 ? "+" : ""}
                            {d}
                          </span>
                        ) : null}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {skill.current_level}
                          {skill.target_level ? ` / ${skill.target_level}` : ""}
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${skill.current_level}%` }}
                        />
                        {skill.target_level ? (
                          <div
                            className="absolute top-0 h-full w-0.5 bg-foreground/60"
                            style={{ left: `${skill.target_level}%` }}
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}