import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LayoutGrid } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { matchesQueryOptions } from "@/lib/matches.functions";

export const Route = createFileRoute("/formations")({
  head: () => ({
    meta: [
      { title: "Formazioni — Team Manager" },
      {
        name: "description",
        content:
          "Gestisci moduli, titolari e riserve per ogni partita della squadra.",
      },
      { property: "og:title", content: "Formazioni — Team Manager" },
      {
        property: "og:description",
        content:
          "Gestisci moduli, titolari e riserve per ogni partita della squadra.",
      },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(matchesQueryOptions()),
  component: FormationsPage,
});

function FormationsPage() {
  const { data: matches } = useSuspenseQuery(matchesQueryOptions());

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Formazioni</h1>
        <p className="text-sm text-muted-foreground">
          Seleziona una partita per impostare modulo, titolari e riserve.
        </p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nessuna partita in programma. Crea prima una partita per
            impostare la formazione.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {matches.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {m.home_or_away === "home" ? "vs " : "@ "}
                  {m.opponent}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(m.match_date).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                {m.formation ? (
                  <Badge variant="default">Modulo {m.formation}</Badge>
                ) : (
                  <Badge variant="outline">Nessun modulo</Badge>
                )}
                <Button asChild size="sm" variant="outline">
                  <Link to="/matches/$id/lineup" params={{ id: m.id }}>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Gestisci
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
