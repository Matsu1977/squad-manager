import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlayerForm, PlayerFormValues } from "@/components/player-form";
import {
  getPlayer,
  playerQueryOptions,
  updatePlayer,
} from "@/lib/players.functions";

export const Route = createFileRoute("/players/$id/edit")({
  head: () => ({
    meta: [
      { title: "Modifica Giocatore — Team Manager" },
      {
        name: "description",
        content: "Modifica i dati del giocatore.",
      },
      { property: "og:title", content: "Modifica Giocatore — Team Manager" },
      {
        property: "og:description",
        content: "Modifica i dati del giocatore.",
      },
    ],
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(playerQueryOptions(params.id));
  },
  component: EditPlayerPage,
  errorComponent: EditPlayerError,
  notFoundComponent: EditPlayerNotFound,
});

function EditPlayerPage() {
  const { id } = Route.useParams();
  const { data: player } = useSuspenseQuery(playerQueryOptions(id));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updatePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["players", id] });
      toast.success("Giocatore aggiornato");
      navigate({ to: "/players/$id", params: { id } });
    },
    onError: (error) => {
      toast.error(error.message || "Errore durante l'aggiornamento");
    },
  });

  const onSubmit = (values: PlayerFormValues) => {
    const { preferred_foot, ...rest } = values;
    mutation.mutate({
      data: { id, ...rest, preferred_foot: preferred_foot ? preferred_foot : null },
    });
  };

  const defaultValues: Partial<PlayerFormValues> = {
    first_name: player.first_name,
    last_name: player.last_name,
    birth_date: player.birth_date ?? undefined,
    role: player.role,
    jersey_number: player.jersey_number ?? undefined,
    phone: player.phone ?? undefined,
    email: player.email ?? undefined,
    photo_url: player.photo_url ?? undefined,
    status: player.status,
    notes: player.notes ?? undefined,
    height_cm: player.height_cm ?? undefined,
    weight_kg: player.weight_kg ?? undefined,
    preferred_foot: player.preferred_foot ?? undefined,
    rating_pace: player.rating_pace ?? undefined,
    rating_shooting: player.rating_shooting ?? undefined,
    rating_passing: player.rating_passing ?? undefined,
    rating_dribbling: player.rating_dribbling ?? undefined,
    rating_defending: player.rating_defending ?? undefined,
    rating_physical: player.rating_physical ?? undefined,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/players/$id" params={{ id }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Modifica giocatore
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dati giocatore</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerForm
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isSubmitting={mutation.isPending}
            submitLabel="Aggiorna"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function EditPlayerError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Errore</h1>
      <p className="text-destructive">{error.message}</p>
      <Button onClick={reset}>Riprova</Button>
    </div>
  );
}

function EditPlayerNotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">
        Giocatore non trovato
      </h1>
      <Button asChild>
        <Link to="/players">Torna all&apos;elenco</Link>
      </Button>
    </div>
  );
}
