import { createFileRoute, Link, useNavigate, Outlet, useLocation } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { matchQueryOptions, deleteMatch } from "@/lib/matches.functions";

export const Route = createFileRoute("/matches/$id")({
  head: () => ({ meta: [{ title: "Dettaglio partita — Team Manager" }] }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(matchQueryOptions(params.id)),
  component: MatchDetailRoute,
});

function MatchDetailRoute() {
  const location = useLocation();
  // If we are on the /edit child route, render its outlet only.
  if (location.pathname.endsWith("/edit")) {
    return <Outlet />;
  }
  return <MatchDetail />;
}

function MatchDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: m } = useSuspenseQuery(matchQueryOptions(id));

  const del = useMutation({
    mutationFn: deleteMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Partita eliminata");
      navigate({ to: "/matches" });
    },
    onError: (e) => toast.error(e.message || "Errore"),
  });

  const hasScore = m.score_team !== null && m.score_opponent !== null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/matches" })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Torna alle partite
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">
              {m.home_or_away === "home" ? "vs " : "@ "}
              {m.opponent}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(m.match_date).toLocaleDateString("it-IT", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/matches/$id/edit" params={{ id: m.id }}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifica
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminare la partita?</AlertDialogTitle>
                  <AlertDialogDescription>
                    L'azione non può essere annullata.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => del.mutate({ data: { id: m.id } })}
                  >
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant={m.home_or_away === "home" ? "default" : "secondary"}>
              {m.home_or_away === "home" ? "Casa" : "Trasferta"}
            </Badge>
            {hasScore ? (
              <span className="text-2xl font-bold tabular-nums">
                {m.score_team} - {m.score_opponent}
              </span>
            ) : (
              <Badge variant="secondary">Da giocare</Badge>
            )}
          </div>
          {m.location && (
            <div>
              <div className="text-xs text-muted-foreground">Luogo</div>
              <div>{m.location}</div>
            </div>
          )}
          {m.formation && (
            <div>
              <div className="text-xs text-muted-foreground">Modulo</div>
              <div>{m.formation}</div>
            </div>
          )}
          {m.notes && (
            <div>
              <div className="text-xs text-muted-foreground">Note</div>
              <div className="whitespace-pre-wrap">{m.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}