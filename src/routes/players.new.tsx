import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlayerForm, PlayerFormValues } from "@/components/player-form";
import { createPlayer } from "@/lib/players.functions";

export const Route = createFileRoute("/players/new")({
  head: () => ({
    meta: [
      { title: "Nuovo Giocatore — Team Manager" },
      {
        name: "description",
        content: "Aggiungi un nuovo giocatore alla squadra.",
      },
      { property: "og:title", content: "Nuovo Giocatore — Team Manager" },
      {
        property: "og:description",
        content: "Aggiungi un nuovo giocatore alla squadra.",
      },
    ],
  }),
  component: NewPlayerPage,
});

function NewPlayerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast.success("Giocatore creato con successo");
      navigate({ to: "/players" });
    },
    onError: (error) => {
      toast.error(error.message || "Errore durante la creazione");
    },
  });

  const onSubmit = (values: PlayerFormValues) => {
    mutation.mutate({ data: values });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Nuovo giocatore</h1>
      <Card>
        <CardHeader>
          <CardTitle>Dati giocatore</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerForm
            onSubmit={onSubmit}
            isSubmitting={mutation.isPending}
            submitLabel="Crea giocatore"
          />
        </CardContent>
      </Card>
      <Button variant="outline" onClick={() => navigate({ to: "/players" })}>
        Annulla
      </Button>
    </div>
  );
}
