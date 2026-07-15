import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Partite — Team Manager" },
      {
        name: "description",
        content: "Registra e consulta le partite della squadra.",
      },
      { property: "og:title", content: "Partite — Team Manager" },
      {
        property: "og:description",
        content: "Registra e consulta le partite della squadra.",
      },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Partite</h1>
      <p className="text-muted-foreground">
        In arrivo nella prossima versione.
      </p>
    </div>
  );
}
