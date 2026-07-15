import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/trainings")({
  head: () => ({
    meta: [
      { title: "Allenamenti — Team Manager" },
      {
        name: "description",
        content: "Pianifica e traccia gli allenamenti della squadra.",
      },
      { property: "og:title", content: "Allenamenti — Team Manager" },
      {
        property: "og:description",
        content: "Pianifica e traccia gli allenamenti della squadra.",
      },
    ],
  }),
  component: TrainingsPage,
});

function TrainingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Allenamenti</h1>
      <p className="text-muted-foreground">
        In arrivo nella prossima versione.
      </p>
    </div>
  );
}
