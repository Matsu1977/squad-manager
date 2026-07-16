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
import { MatchForm, MatchFormValues } from "@/components/match-form";
import { createMatch } from "@/lib/matches.functions";

export const Route = createFileRoute("/matches/new")({
  head: () => ({
    meta: [{ title: "Nuova Partita — Team Manager" }],
  }),
  component: NewMatchPage,
});

function NewMatchPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Partita creata");
      navigate({ to: "/matches" });
    },
    onError: (e) => toast.error(e.message || "Errore"),
  });

  const onSubmit = (values: MatchFormValues) =>
    mutation.mutate({ data: values });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Nuova partita</h1>
      <Card>
        <CardHeader>
          <CardTitle>Dati partita</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchForm
            onSubmit={onSubmit}
            isSubmitting={mutation.isPending}
            submitLabel="Crea partita"
          />
        </CardContent>
      </Card>
      <Button variant="outline" onClick={() => navigate({ to: "/matches" })}>
        Annulla
      </Button>
    </div>
  );
}