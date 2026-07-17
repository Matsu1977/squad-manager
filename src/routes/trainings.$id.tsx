import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Pencil, Trash2, MapPin, Clock, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  trainingQueryOptions,
  deleteTraining,
  saveAttendances,
} from "@/lib/trainings.functions";
import { playersQueryOptions } from "@/lib/players.functions";

export const Route = createFileRoute("/trainings/$id")({
  head: () => ({ meta: [{ title: "Allenamento — Team Manager" }] }),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(trainingQueryOptions(params.id)),
      context.queryClient.ensureQueryData(playersQueryOptions()),
    ]),
  component: TrainingDetail,
});

function TrainingDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trainingQueryOptions(id));
  const { data: players } = useSuspenseQuery(playersQueryOptions());
  const s = data.session;

  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const a of data.attendances) map[a.player_id] = a.attended;
    setAttendance(map);
  }, [data.attendances]);

  const saveMut = useMutation({
    mutationFn: saveAttendances,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings", id] });
      toast.success("Presenze salvate");
    },
    onError: (e) => toast.error(e.message || "Errore"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast.success("Allenamento eliminato");
      navigate({ to: "/trainings" });
    },
    onError: (e) => toast.error(e.message || "Errore"),
  });

  const onSave = () => {
    const attendances = players.map((p) => ({
      player_id: p.id,
      attended: attendance[p.id] ?? false,
    }));
    saveMut.mutate({ data: { training_session_id: id, attendances } });
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {new Date(s.session_date).toLocaleDateString("it-IT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/trainings/$id/edit" params={{ id }}>
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
                <AlertDialogTitle>Eliminare l'allenamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMut.mutate({ data: { id } })}
                >
                  Elimina
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dettagli</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {s.session_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {s.session_time.slice(0, 5)}
            </div>
          )}
          {s.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {s.location}
            </div>
          )}
          {s.notes && (
            <p className="whitespace-pre-wrap text-muted-foreground">
              {s.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Presenze ({presentCount}/{players.length})
          </CardTitle>
          <Button size="sm" onClick={onSave} disabled={saveMut.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveMut.isPending ? "Salvataggio..." : "Salva presenze"}
          </Button>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessun giocatore in rosa.
            </p>
          ) : (
            <div className="space-y-1">
              {players.map((p) => (
                <label
                  key={p.id}
                  htmlFor={`att-${p.id}`}
                  className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
                >
                  <Checkbox
                    id={`att-${p.id}`}
                    checked={attendance[p.id] ?? false}
                    onCheckedChange={(v) =>
                      setAttendance((prev) => ({
                        ...prev,
                        [p.id]: v === true,
                      }))
                    }
                  />
                  <div className="flex-1">
                    <span className="font-medium">
                      {p.first_name} {p.last_name}
                    </span>
                    {p.jersey_number != null && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        #{p.jersey_number}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {p.role}
                  </span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}