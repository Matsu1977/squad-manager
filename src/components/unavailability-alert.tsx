import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { unavailabilitiesQueryOptions } from "@/lib/unavailabilities.functions";
import {
  UNAVAILABILITY_VARIANTS,
  UnavailabilityType,
  isUnavailableOn,
} from "@/lib/team";

type Row = {
  id: string;
  type: string;
  reason: string | null;
  start_date: string;
  end_date: string | null;
  players: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

/** Avviso sui giocatori indisponibili in una determinata data (YYYY-MM-DD). */
export function UnavailabilityAlert({ date }: { date: string }) {
  const { data } = useSuspenseQuery(unavailabilitiesQueryOptions());
  const rows = ((data ?? []) as unknown as Row[]).filter((r) =>
    isUnavailableOn(r, date)
  );

  if (rows.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {rows.length} giocatore{rows.length > 1 ? "i" : ""} non disponibil
        {rows.length > 1 ? "i" : "e"}
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {r.players
                  ? `${r.players.first_name} ${r.players.last_name}`
                  : "Giocatore"}
              </span>
              <Badge
                variant={
                  UNAVAILABILITY_VARIANTS[r.type as UnavailabilityType] ??
                  "outline"
                }
              >
                {r.type}
              </Badge>
              {r.reason ? (
                <span className="text-xs opacity-80">{r.reason}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}