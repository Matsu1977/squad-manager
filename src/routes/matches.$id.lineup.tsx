import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { matchQueryOptions } from "@/lib/matches.functions";
import { playersQueryOptions } from "@/lib/players.functions";
import { lineupQueryOptions } from "@/lib/lineups.functions";
import { LineupEditor } from "@/components/lineup-editor";
import { UnavailabilityAlert } from "@/components/unavailability-alert";
import { unavailabilitiesQueryOptions } from "@/lib/unavailabilities.functions";

export const Route = createFileRoute("/matches/$id/lineup")({
  head: () => ({ meta: [{ title: "Formazione partita — Team Manager" }] }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(matchQueryOptions(params.id));
    context.queryClient.ensureQueryData(playersQueryOptions());
    context.queryClient.ensureQueryData(lineupQueryOptions(params.id));
    context.queryClient.ensureQueryData(unavailabilitiesQueryOptions());
  },
  component: LineupPage,
});

function LineupPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: m } = useSuspenseQuery(matchQueryOptions(id));
  const { data: players } = useSuspenseQuery(playersQueryOptions());
  const { data: lineup } = useSuspenseQuery(lineupQueryOptions(id));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/matches/$id", params: { id } })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Torna alla partita
      </Button>

      <UnavailabilityAlert date={m.match_date} />

      <Card>
        <CardHeader>
          <CardTitle>
            Formazione — {m.home_or_away === "home" ? "vs " : "@ "}
            {m.opponent}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(m.match_date).toLocaleDateString("it-IT", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </CardHeader>
        <CardContent>
          <LineupEditor
            matchId={m.id}
            formation={m.formation ?? null}
            players={players}
            existing={lineup}
          />
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <Link
          to="/matches/$id"
          params={{ id }}
          className="underline underline-offset-2"
        >
          Vedi dettaglio partita
        </Link>
      </div>
    </div>
  );
}