import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { matchesQueryOptions } from "@/lib/matches.functions";

export const Route = createFileRoute("/matches/")({
  head: () => ({
    meta: [
      { title: "Partite — Team Manager" },
      { name: "description", content: "Calendario e risultati delle partite." },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(matchesQueryOptions()),
  component: MatchesPage,
});

const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];
const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function MatchesPage() {
  const { data: matches } = useSuspenseQuery(matchesQueryOptions());
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // 0 = Monday
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const matchesByDate = new Map<string, typeof matches>();
  for (const m of matches) {
    const arr = matchesByDate.get(m.match_date) ?? [];
    arr.push(m);
    matchesByDate.set(m.match_date, arr);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const fmt = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isToday = (d: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === d;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Partite</h1>
        <Button asChild>
          <Link to="/matches/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuova partita
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              aria-label="Mese precedente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {MONTHS[month]} {year}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              aria-label="Mese successivo"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) {
                return <div key={i} className="min-h-20 rounded-md" />;
              }
              const dayMatches = matchesByDate.get(fmt(d)) ?? [];
              return (
                <div
                  key={i}
                  className={`min-h-20 rounded-md border p-1 text-left ${
                    isToday(d) ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="text-xs font-medium">{d}</div>
                  <div className="mt-1 space-y-1">
                    {dayMatches.map((m) => (
                      <Link
                        key={m.id}
                        to="/matches/$id"
                        params={{ id: m.id }}
                        className="block truncate rounded bg-primary px-1 py-0.5 text-[10px] text-primary-foreground hover:opacity-80"
                      >
                        {m.opponent}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Elenco partite</h2>
        {matches.length === 0 ? (
          <p className="text-muted-foreground">Nessuna partita registrata.</p>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => {
              const hasScore =
                m.score_team !== null && m.score_opponent !== null;
              const result =
                hasScore &&
                (m.score_team! > m.score_opponent!
                  ? "V"
                  : m.score_team! < m.score_opponent!
                    ? "S"
                    : "P");
              return (
                <Link
                  key={m.id}
                  to="/matches/$id"
                  params={{ id: m.id }}
                  className="block"
                >
                  <Card className="transition hover:bg-accent">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <div className="font-medium">
                          {m.home_or_away === "home" ? "vs " : "@ "}
                          {m.opponent}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(m.match_date).toLocaleDateString("it-IT", {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {m.location ? ` — ${m.location}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {hasScore ? (
                          <span className="text-lg font-bold tabular-nums">
                            {m.score_team} - {m.score_opponent}
                          </span>
                        ) : (
                          <Badge variant="secondary">Da giocare</Badge>
                        )}
                        {result && (
                          <Badge
                            variant={
                              result === "V"
                                ? "default"
                                : result === "S"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {result}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}