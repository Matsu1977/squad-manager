import { type ElementType, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarDays,
  Goal,
  LayoutGrid,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { playersQueryOptions } from "@/lib/players.functions";
import { matchesQueryOptions } from "@/lib/matches.functions";
import { trainingsQueryOptions } from "@/lib/trainings.functions";
import { leaderboardQueryOptions } from "@/lib/match-stats.functions";

const MONTHS = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Team Manager — Gestione Squadra di Calcio" },
      {
        name: "description",
        content: "Dashboard della tua squadra di calcio amatoriale.",
      },
      {
        property: "og:title",
        content: "Team Manager — Gestione Squadra di Calcio",
      },
      {
        property: "og:description",
        content: "Dashboard della tua squadra di calcio amatoriale.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(playersQueryOptions());
    context.queryClient.ensureQueryData(matchesQueryOptions());
    context.queryClient.ensureQueryData(trainingsQueryOptions());
    context.queryClient.ensureQueryData(leaderboardQueryOptions());
  },
  component: DashboardPage,
  errorComponent: DashboardError,
});

function DashboardPage() {
  const { data: players } = useSuspenseQuery(playersQueryOptions());
  const { data: matches } = useSuspenseQuery(matchesQueryOptions());
  const { data: trainings } = useSuspenseQuery(trainingsQueryOptions());
  const { data: leaderboard } = useSuspenseQuery(leaderboardQueryOptions());

  const total = players.length;
  const now = Date.now();

  const played = useMemo(
    () =>
      matches.filter(
        (m) => m.score_team != null && m.score_opponent != null
      ),
    [matches]
  );
  const wins = played.filter((m) => m.score_team! > m.score_opponent!).length;
  const draws = played.filter((m) => m.score_team! === m.score_opponent!).length;
  const losses = played.filter((m) => m.score_team! < m.score_opponent!).length;
  const goalsFor = played.reduce((s, m) => s + (m.score_team ?? 0), 0);
  const goalsAgainst = played.reduce(
    (s, m) => s + (m.score_opponent ?? 0),
    0
  );

  const nextMatch = useMemo(
    () =>
      [...matches]
        .filter((m) => new Date(m.match_date).getTime() >= now)
        .sort(
          (a, b) =>
            new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
        )[0] ?? null,
    [matches, now]
  );

  const nextTraining = useMemo(
    () =>
      [...trainings]
        .filter((t) => new Date(t.session_date).getTime() >= now)
        .sort(
          (a, b) =>
            new Date(a.session_date).getTime() -
            new Date(b.session_date).getTime()
        )[0] ?? null,
    [trainings, now]
  );

  const lastResults = useMemo(
    () =>
      [...played]
        .sort(
          (a, b) =>
            new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
        )
        .slice(0, 5),
    [played]
  );

  const goalsByMonth = useMemo(() => {
    const buckets = MONTHS.map((label) => ({ label, fatti: 0, subiti: 0 }));
    for (const m of played) {
      const i = new Date(m.match_date).getMonth();
      buckets[i].fatti += m.score_team ?? 0;
      buckets[i].subiti += m.score_opponent ?? 0;
    }
    return buckets;
  }, [played]);

  const topScorers = useMemo(
    () =>
      [...leaderboard]
        .filter((p) => p.goals > 0)
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
        .slice(0, 5),
    [leaderboard]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Panoramica della tua squadra</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          title="Giocatori"
          value={total}
          icon={Users}
          href="/players"
        />
        <StatCard
          title="Partite giocate"
          value={played.length}
          icon={Shield}
          href="/matches"
        />
        <StatCard
          title="Bilancio"
          value={`${wins}V ${draws}P ${losses}S`}
          icon={Trophy}
          href="/stats"
        />
        <StatCard
          title="Gol fatti / subiti"
          value={`${goalsFor} : ${goalsAgainst}`}
          icon={Goal}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prossima partita</CardTitle>
          </CardHeader>
          <CardContent>
            {nextMatch ? (
              <Link
                to="/matches/$id"
                params={{ id: nextMatch.id }}
                className="block space-y-1"
              >
                <p className="text-lg font-semibold">
                  {nextMatch.home_or_away === "home" ? "vs " : "@ "}
                  {nextMatch.opponent}
                </p>
                <p className="text-sm text-muted-foreground">
                  {fmtDate(nextMatch.match_date)}
                  {nextMatch.location ? ` · ${nextMatch.location}` : ""}
                </p>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessuna partita in programma.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prossimo allenamento</CardTitle>
          </CardHeader>
          <CardContent>
            {nextTraining ? (
              <Link
                to="/trainings/$id"
                params={{ id: nextTraining.id }}
                className="block space-y-1"
              >
                <p className="text-lg font-semibold">
                  {fmtDate(nextTraining.session_date)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {nextTraining.session_time ?? "Orario da definire"}
                  {nextTraining.location ? ` · ${nextTraining.location}` : ""}
                </p>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessun allenamento in programma.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gol per mese</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {played.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nessun risultato registrato.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" fontSize={11} tickLine={false} />
                  <YAxis allowDecimals={false} fontSize={11} width={24} />
                  <ChartTooltip />
                  <Bar
                    dataKey="fatti"
                    fill="hsl(var(--primary))"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="subiti"
                    fill="hsl(var(--muted-foreground))"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Migliori marcatori</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topScorers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nessun gol registrato.
              </p>
            )}
            {topScorers.map((p, i) => (
              <div
                key={p.player_id}
                className="flex items-center justify-between border-b pb-1 last:border-0"
              >
                <span className="text-sm">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {p.first_name} {p.last_name}
                </span>
                <span className="text-sm font-semibold">
                  {p.goals} gol · {p.assists} assist
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ultimi risultati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lastResults.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nessuna partita giocata.
              </p>
            )}
            {lastResults.map((m) => {
              const win = m.score_team! > m.score_opponent!;
              const draw = m.score_team! === m.score_opponent!;
              return (
                <Link
                  key={m.id}
                  to="/matches/$id"
                  params={{ id: m.id }}
                  className="flex items-center justify-between rounded-md px-1 py-1 hover:bg-accent/50"
                >
                  <span className="text-sm">
                    {m.home_or_away === "home" ? "vs " : "@ "}
                    {m.opponent}
                  </span>
                  <Badge
                    variant={
                      win ? "default" : draw ? "secondary" : "destructive"
                    }
                  >
                    {m.score_team} - {m.score_opponent}
                  </Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prossimi passi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/players/new">
                <Users className="mr-2 h-4 w-4" /> Aggiungi un giocatore
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/formations">
                <LayoutGrid className="mr-2 h-4 w-4" /> Crea una formazione
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/matches">
                <Shield className="mr-2 h-4 w-4" /> Registra una partita
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/trainings">
                <CalendarDays className="mr-2 h-4 w-4" /> Pianifica un
                allenamento
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: number | string;
  icon: ElementType;
  href?: string;
}) {
  const content = (
    <Card className="transition-colors hover:bg-accent/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
  return href ? <Link to={href}>{content}</Link> : content;
}

function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-destructive">{error.message}</p>
      <Button onClick={reset}>Riprova</Button>
    </div>
  );
}
