import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, MapPin, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trainingsQueryOptions } from "@/lib/trainings.functions";

export const Route = createFileRoute("/trainings/")({
  head: () => ({
    meta: [{ title: "Allenamenti — Team Manager" }],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(trainingsQueryOptions()),
  component: TrainingsPage,
});

function TrainingsPage() {
  const { data: trainings } = useSuspenseQuery(trainingsQueryOptions());
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Allenamenti</h1>
        <Button asChild>
          <Link to="/trainings/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo allenamento
          </Link>
        </Button>
      </div>

      {trainings.length === 0 ? (
        <p className="text-muted-foreground">Nessun allenamento registrato.</p>
      ) : (
        <div className="space-y-2">
          {trainings.map((t) => {
            const isPast = t.session_date < today;
            return (
              <Link
                key={t.id}
                to="/trainings/$id"
                params={{ id: t.id }}
                className="block"
              >
                <Card className="transition hover:bg-accent">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {new Date(t.session_date).toLocaleDateString("it-IT", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {t.session_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t.session_time.slice(0, 5)}
                          </span>
                        )}
                        {t.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {t.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant={isPast ? "secondary" : "default"}>
                      {isPast ? "Passato" : "In arrivo"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}