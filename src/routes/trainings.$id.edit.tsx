import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrainingForm, TrainingFormValues } from "@/components/training-form";
import { trainingQueryOptions, updateTraining } from "@/lib/trainings.functions";

export const Route = createFileRoute("/trainings/$id/edit")({
  head: () => ({ meta: [{ title: "Modifica Allenamento — Team Manager" }] }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(trainingQueryOptions(params.id)),
  component: EditTrainingPage,
});

function EditTrainingPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trainingQueryOptions(id));
  const s = data.session;

  const mutation = useMutation({
    mutationFn: updateTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success("Allenamento aggiornato");
      navigate({ to: "/trainings/$id", params: { id } });
    },
    onError: (e) => toast.error(e.message || "Errore"),
  });

  const onSubmit = (values: TrainingFormValues) =>
    mutation.mutate({ data: { id, ...values } });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Modifica allenamento</h1>
      <Card>
        <CardHeader>
          <CardTitle>Dati allenamento</CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingForm
            defaultValues={{
              session_date: s.session_date,
              session_time: s.session_time ?? "",
              location: s.location ?? "",
              notes: s.notes ?? "",
            }}
            onSubmit={onSubmit}
            isSubmitting={mutation.isPending}
            submitLabel="Aggiorna allenamento"
          />
        </CardContent>
      </Card>
      <Button
        variant="outline"
        onClick={() => navigate({ to: "/trainings/$id", params: { id } })}
      >
        Annulla
      </Button>
    </div>
  );
}