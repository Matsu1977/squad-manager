import { type ElementType } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  LayoutGrid,
  Shield,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPlayers,
  playersQueryOptions,
} from "@/lib/players.functions";

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
  },
  component: DashboardPage,
  errorComponent: DashboardError,
});

function DashboardPage() {
  const { data: players } = useSuspenseQuery(playersQueryOptions());
  const total = players.length;
  const goalkeepers = players.filter((p) => p.role === "Portiere").length;
  const defenders = players.filter((p) => p.role === "Difensore").length;
  const midfielders = players.filter((p) => p.role === "Centrocampista").length;
  const forwards = players.filter((p) => p.role === "Attaccante").length;

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
        <StatCard title="Portieri" value={goalkeepers} icon={Shield} />
        <StatCard title="Difensori" value={defenders} icon={Shield} />
        <StatCard
          title="Centrocampisti"
          value={midfielders}
          icon={LayoutGrid}
        />
        <StatCard title="Attaccanti" value={forwards} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
  value: number;
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
