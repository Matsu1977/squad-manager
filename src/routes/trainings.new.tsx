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
import { TrainingForm, TrainingFormValues } from "@/components/training-form";
import { createTraining } from "@/lib/trainings.functions";

export const Route = createFileRoute("/trainings/new")({
  head: () => ({ meta: [{ title: "Nuovo Allenamento — Team Manager" }] }),
  component: NewTrainingPage,
});

function NewTrainingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success("Allenamento creato");
      navigate({ to: "/trainings" });
    },
    onError: (e) => toast.error(e.message || "Errore"),
  });

  const onSubmit = (values: TrainingFormValues) =>
    mutation.mutate({ data: values });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Nuovo allenamento</h1>
      <Card>
        <CardHeader>
          <CardTitle>Dati allenamento</CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingForm
            onSubmit={onSubmit}
            isSubmitting={mutation.isPending}
            submitLabel="Crea allenamento"
          />
        </CardContent>
      </Card>
      <Button variant="outline" onClick={() => navigate({ to: "/trainings" })}>
        Annulla
      </Button>
    </div>
  );
}