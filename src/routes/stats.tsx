import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leaderboardQueryOptions } from "@/lib/match-stats.functions";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Statistiche — Team Manager" },
      {
        name: "description",
        content: "Classifica marcatori, assist e cartellini della squadra.",
      },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(leaderboardQueryOptions()),
  component: StatsPage,
});

function StatsPage() {
  const { data: rows } = useSuspenseQuery(leaderboardQueryOptions());

  const scorers = [...rows].sort((a, b) => b.goals - a.goals).filter((r) => r.goals > 0);
  const assisters = [...rows].sort((a, b) => b.assists - a.assists).filter((r) => r.assists > 0);
  const disciplinary = [...rows]
    .sort(
      (a, b) =>
        b.red_cards * 10 + b.yellow_cards - (a.red_cards * 10 + a.yellow_cards)
    )
    .filter((r) => r.yellow_cards > 0 || r.red_cards > 0);
  const minutes = [...rows]
    .sort((a, b) => b.minutes_played - a.minutes_played)
    .filter((r) => r.minutes_played > 0);

  const name = (r: (typeof rows)[number]) =>
    `${r.first_name} ${r.last_name}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistiche</h1>
        <p className="text-muted-foreground">
          Classifiche stagionali basate sulle partite registrate.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground">
          Nessuna statistica registrata. Apri una partita e inserisci gol,
          assist e minuti giocati.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Marcatori</CardTitle>
            </CardHeader>
            <CardContent>
              {scorers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessun gol segnato.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Giocatore</TableHead>
                      <TableHead className="text-right">Gol</TableHead>
                      <TableHead className="text-right">Pres.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scorers.map((r, i) => (
                      <TableRow key={r.player_id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{name(r)}</TableCell>
                        <TableCell className="text-right font-bold">
                          {r.goals}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {r.appearances}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assist</CardTitle>
            </CardHeader>
            <CardContent>
              {assisters.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessun assist registrato.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Giocatore</TableHead>
                      <TableHead className="text-right">Assist</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assisters.map((r, i) => (
                      <TableRow key={r.player_id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{name(r)}</TableCell>
                        <TableCell className="text-right font-bold">
                          {r.assists}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Minuti giocati</CardTitle>
            </CardHeader>
            <CardContent>
              {minutes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessun minuto registrato.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Giocatore</TableHead>
                      <TableHead className="text-right">Min</TableHead>
                      <TableHead className="text-right">Pres.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {minutes.map((r) => (
                      <TableRow key={r.player_id}>
                        <TableCell>{name(r)}</TableCell>
                        <TableCell className="text-right font-bold">
                          {r.minutes_played}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {r.appearances}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cartellini</CardTitle>
            </CardHeader>
            <CardContent>
              {disciplinary.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessun cartellino.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Giocatore</TableHead>
                      <TableHead className="text-right">Gialli</TableHead>
                      <TableHead className="text-right">Rossi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disciplinary.map((r) => (
                      <TableRow key={r.player_id}>
                        <TableCell>{name(r)}</TableCell>
                        <TableCell className="text-right">
                          {r.yellow_cards}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.red_cards}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}