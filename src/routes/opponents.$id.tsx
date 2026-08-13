import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, MapPin, Phone, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { opponentDetailQueryOptions } from "@/lib/opponents.functions";

export const Route = createFileRoute("/opponents/$id")({
  head: () => ({
    meta: [
      { title: "Scheda avversario — Team Manager" },
      {
        name: "description",
        content:
          "Dettaglio squadra avversaria: contatti, note tattiche e storico completo dei precedenti con risultati e marcatori.",
      },
      { property: "og:title", content: "Scheda avversario — Team Manager" },
      {
        property: "og:description",
        content:
          "Storico partite, risultati, marcatori e note tattiche contro questa squadra avversaria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(opponentDetailQueryOptions(params.id)),
  component: OpponentDetailPage,
});

function OpponentDetailPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(opponentDetailQueryOptions(id));
  const { opponent, matches, scorers } = data;

  const record = matches.reduce(
    (acc, m) => {
      const gf = m.score_team ?? 0;
      const ga = m.score_opponent ?? 0;
      acc.played += 1;
      acc.gf += gf;
      acc.ga += ga;
      if (gf > ga) acc.won += 1;
      else if (gf === ga) acc.drawn += 1;
      else acc.lost += 1;
      return acc;
    },
    { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to="/opponents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Rubrica avversari
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{opponent.name}</h1>
          <div className="flex flex-wrap gap-1">
            {opponent.usual_formation && (
              <Badge variant="secondary">{opponent.usual_formation}</Badge>
            )}
            {opponent.colors && (
              <Badge variant="outline">{opponent.colors}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Precedenti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-2xl font-bold">
              {record.won}V {record.drawn}N {record.lost}P
            </p>
            <p className="text-muted-foreground">
              {record.played} partite · {record.gf}-{record.ga} gol
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contatti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {opponent.contact_name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                {opponent.contact_name}
              </div>
            )}
            {opponent.phone && (
              <a
                href={`tel:${opponent.phone}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-3.5 w-3.5" />
                {opponent.phone}
              </a>
            )}
            {opponent.email && (
              <a
                href={`mailto:${opponent.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" />
                {opponent.email}
              </a>
            )}
            {opponent.venue && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {opponent.venue}
              </div>
            )}
            {!opponent.contact_name &&
              !opponent.phone &&
              !opponent.email &&
              !opponent.venue && (
                <p className="text-muted-foreground">Nessun contatto.</p>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Note tattiche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {opponent.strengths && (
              <p>
                <span className="font-medium">Punti di forza: </span>
                {opponent.strengths}
              </p>
            )}
            {opponent.weaknesses && (
              <p>
                <span className="font-medium">Punti deboli: </span>
                {opponent.weaknesses}
              </p>
            )}
            {opponent.notes && (
              <p className="text-muted-foreground">{opponent.notes}</p>
            )}
            {!opponent.strengths && !opponent.weaknesses && !opponent.notes && (
              <p className="text-muted-foreground">Nessuna nota.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Storico partite</h2>
        {matches.length === 0 ? (
          <p className="text-muted-foreground">
            Nessuna partita disputata contro questa squadra.
          </p>
        ) : (
          <div className="grid gap-3">
            {matches.map((m) => {
              const gf = m.score_team ?? 0;
              const ga = m.score_opponent ?? 0;
              const outcome =
                gf > ga ? "Vittoria" : gf === ga ? "Pareggio" : "Sconfitta";
              const rows = scorers.filter((s) => s.match_id === m.id);
              return (
                <Card key={m.id}>
                  <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {new Date(m.match_date).toLocaleDateString("it-IT")} ·{" "}
                        {m.home_or_away === "home" ? "Casa" : "Trasferta"}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1">
                        {m.competition && (
                          <Badge variant="outline">{m.competition}</Badge>
                        )}
                        {m.season && (
                          <Badge variant="outline">{m.season}</Badge>
                        )}
                        <Badge
                          variant={gf > ga ? "default" : gf === ga ? "secondary" : "destructive"}
                        >
                          {outcome} {gf}-{ga}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/matches/$id" params={{ id: m.id }}>
                        Dettaglio partita
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {rows.length > 0 && (
                      <p>
                        <span className="font-medium">Marcatori: </span>
                        {rows
                          .map(
                            (r) =>
                              `${r.name}${r.goals ? ` ⚽${r.goals}` : ""}${
                                r.assists ? ` 🅰${r.assists}` : ""
                              }`
                          )
                          .join(" · ")}
                      </p>
                    )}
                    {m.notes && (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Note partita:{" "}
                        </span>
                        {m.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}