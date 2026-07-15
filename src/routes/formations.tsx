import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/formations")({
  head: () => ({
    meta: [
      { title: "Formazioni — Team Manager" },
      {
        name: "description",
        content: "Gestisci le formazioni della squadra.",
      },
      { property: "og:title", content: "Formazioni — Team Manager" },
      {
        property: "og:description",
        content: "Gestisci le formazioni della squadra.",
      },
    ],
  }),
  component: FormationsPage,
});

function FormationsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Formazioni</h1>
      <p className="text-muted-foreground">
        In arrivo nella prossima versione.
      </p>
    </div>
  );
}
