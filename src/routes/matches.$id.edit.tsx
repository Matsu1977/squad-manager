import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchForm, MatchFormValues } from "@/components/match-form";
import { matchQueryOptions, updateMatch } from "@/lib/matches.functions";

export const Route = createFileRoute("/matches/$id/edit")({
  head: () => ({ meta: [{ title: "Modifica partita — Team Manager" }] }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(matchQueryOptions(params.id)),
  component: EditMatchPage,
});

function EditMatchPage() {
  const { id } = Route.useParams();
  const { data: m } = useSuspenseQuery(matchQueryOptions(id));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["matches", id] });
      toast.success("Partita aggiornata");
      navigate({ to: "/matches/$id", params: { id } });
    },
    onError: (e) => toast.error(e.message || "Errore"),
  });

  const defaults: Partial<MatchFormValues> = {
    opponent: m.opponent,
    match_date: m.match_date,
    location: m.location ?? "",
    home_or_away: (m.home_or_away as "home" | "away") ?? "home",
    score_team: m.score_team,
    score_opponent: m.score_opponent,
    formation: m.formation ?? "",
    notes: m.notes ?? "",
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/matches/$id" params={{ id }}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Modifica partita</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dati partita</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchForm
            defaultValues={defaults}
            onSubmit={(v) => mutation.mutate({ data: { id, ...v } })}
            isSubmitting={mutation.isPending}
            submitLabel="Aggiorna"
          />
        </CardContent>
      </Card>
    </div>
  );
}