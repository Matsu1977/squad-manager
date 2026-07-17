import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  deletePlayer,
  getPlayer,
  playerQueryOptions,
} from "@/lib/players.functions";
import { RATING_FIELDS, ROLE_COLORS, STATUS_VARIANTS } from "@/lib/team";

export const Route = createFileRoute("/players/$id")({
  head: () => ({
    meta: [
      { title: "Dettaglio Giocatore — Team Manager" },
      {
        name: "description",
        content: "Scheda dettaglio del giocatore.",
      },
      {
        property: "og:title",
        content: "Dettaglio Giocatore — Team Manager",
      },
      {
        property: "og:description",
        content: "Scheda dettaglio del giocatore.",
      },
    ],
  }),
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(playerQueryOptions(params.id));
  },
  component: PlayerDetailPage,
  errorComponent: PlayerDetailError,
  notFoundComponent: PlayerDetailNotFound,
});

function PlayerDetailPage() {
  const { id } = Route.useParams();
  const { data: player } = useSuspenseQuery(playerQueryOptions(id));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast.success("Giocatore eliminato");
      navigate({ to: "/players" });
    },
    onError: (error) => {
      toast.error(error.message || "Errore durante l'eliminazione");
    },
  });

  const initials = `${player.first_name[0]}${player.last_name[0]}`.toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/players">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Dettaglio giocatore
        </h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={player.photo_url ?? undefined}
              alt={`${player.first_name} ${player.last_name}`}
            />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {player.first_name} {player.last_name}
            </CardTitle>
            <div className="mt-2 flex gap-2">
              <Badge variant={STATUS_VARIANTS[player.status]}>
                {player.status}
              </Badge>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${ROLE_COLORS[player.role]}`}
              >
                {player.role}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {player.jersey_number ? (
            <p>
              <span className="font-medium">Numero maglia:</span>{" "}
              #{player.jersey_number}
            </p>
          ) : null}
          {player.birth_date ? (
            <p>
              <span className="font-medium">Data di nascita:</span>{" "}
              {player.birth_date}
            </p>
          ) : null}
          {player.phone ? (
            <p>
              <span className="font-medium">Telefono:</span> {player.phone}
            </p>
          ) : null}
          {player.email ? (
            <p>
              <span className="font-medium">Email:</span> {player.email}
            </p>
          ) : null}
          {player.notes ? (
            <p>
              <span className="font-medium">Note:</span> {player.notes}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {(player.height_cm || player.weight_kg || player.preferred_foot) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Parametri fisici</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Altezza</div>
              <div className="text-lg font-semibold">
                {player.height_cm ? `${player.height_cm} cm` : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Peso</div>
              <div className="text-lg font-semibold">
                {player.weight_kg ? `${player.weight_kg} kg` : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Piede</div>
              <div className="text-lg font-semibold">
                {player.preferred_foot ?? "—"}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {RATING_FIELDS.some((r) => player[r.key] != null) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valutazioni tecniche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {RATING_FIELDS.map((r) => {
              const value = player[r.key] as number | null;
              return (
                <div key={r.key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{r.label}</span>
                    <span className="text-muted-foreground">
                      {value ?? "—"}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${value ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link to="/players/$id/edit" params={{ id }}>
            <Pencil className="mr-2 h-4 w-4" /> Modifica
          </Link>
        </Button>
        <Button
          variant="destructive"
          onClick={() => deleteMutation.mutate({ data: { id } })}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Elimina
        </Button>
      </div>
    </div>
  );
}

function PlayerDetailError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Errore</h1>
      <p className="text-destructive">{error.message}</p>
      <Button onClick={reset}>Riprova</Button>
    </div>
  );
}

function PlayerDetailNotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">
        Giocatore non trovato
      </h1>
      <Button asChild>
        <Link to="/players">Torna all&apos;elenco</Link>
      </Button>
    </div>
  );
}
