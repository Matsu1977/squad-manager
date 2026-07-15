import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/player-card";
import { getPlayers, playersQueryOptions } from "@/lib/players.functions";

export const Route = createFileRoute("/players/")({
  head: () => ({
    meta: [
      { title: "Giocatori — Team Manager" },
      {
        name: "description",
        content: "Elenco dei giocatori della squadra.",
      },
      { property: "og:title", content: "Giocatori — Team Manager" },
      {
        property: "og:description",
        content: "Elenco dei giocatori della squadra.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(playersQueryOptions());
  },
  component: PlayersPage,
  errorComponent: PlayersError,
  notFoundComponent: PlayersNotFound,
});

function PlayersPage() {
  const { data: players } = useSuspenseQuery(playersQueryOptions());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Giocatori</h1>
        <Button asChild>
          <Link to="/players/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo giocatore
          </Link>
        </Button>
      </div>
      {players.length === 0 ? (
        <p className="text-muted-foreground">
          Nessun giocatore ancora. Aggiungi il primo!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayersError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Giocatori</h1>
      <p className="text-destructive">
        Errore nel caricamento: {error.message}
      </p>
      <Button onClick={reset}>Riprova</Button>
    </div>
  );
}

function PlayersNotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Giocatori</h1>
      <p className="text-muted-foreground">Pagina non trovata.</p>
    </div>
  );
}
