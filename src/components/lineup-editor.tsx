import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, GripVertical, ArrowRight, ArrowLeft, X } from "lucide-react";
import { AlertCircle } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FORMATIONS, ROLE_COLORS } from "@/lib/team";
import type { PlayerRole } from "@/lib/team";
import { saveLineup } from "@/lib/lineups.functions";

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  role: string;
};

type Bucket = "available" | "starters" | "subs";

type Entry = {
  bucket: Bucket;
  position_label: string;
};

const BUCKET_LABEL: Record<Bucket, string> = {
  available: "Disponibili",
  starters: "Titolari",
  subs: "Riserve",
};

function PlayerChip({
  player,
  positionLabel,
  onPositionChange,
  onMove,
  onRemove,
  bucket,
  dragging,
}: {
  player: Player;
  positionLabel: string;
  onPositionChange?: (v: string) => void;
  onMove?: (target: Bucket) => void;
  onRemove?: () => void;
  bucket: Bucket;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: player.id,
  });
  const roleColor = ROLE_COLORS[player.role as PlayerRole] ?? "bg-muted";

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 rounded-md border bg-card p-2 shadow-sm ${
        isDragging || dragging ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...listeners}
        {...attributes}
        aria-label="Trascina"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className={`h-2 w-2 shrink-0 rounded-full ${roleColor}`} />
      <div className="min-w-0 flex-1 text-sm">
        {player.jersey_number != null && (
          <span className="mr-1 text-muted-foreground">
            #{player.jersey_number}
          </span>
        )}
        <span className="truncate">
          {player.first_name} {player.last_name}
        </span>
      </div>
      {bucket !== "available" && onPositionChange && (
        <Input
          value={positionLabel}
          onChange={(e) => onPositionChange(e.target.value)}
          placeholder="Ruolo"
          className="h-7 w-20 text-xs"
        />
      )}
      <div className="flex items-center gap-1">
        {bucket === "available" && onMove && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => onMove("starters")}
            >
              T
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => onMove("subs")}
            >
              R
            </Button>
          </>
        )}
        {bucket === "starters" && onMove && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-1"
            onClick={() => onMove("subs")}
            title="Sposta in riserve"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
        {bucket === "subs" && onMove && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-1"
            onClick={() => onMove("starters")}
            title="Sposta in titolari"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        )}
        {bucket !== "available" && onRemove && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-1 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            title="Rimuovi dai convocati"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Column({
  id,
  title,
  count,
  limit,
  children,
}: {
  id: Bucket;
  title: string;
  count: number;
  limit?: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const over = limit != null && count > limit;
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] flex-col rounded-lg border-2 border-dashed p-3 transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-border bg-muted/20"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant={over ? "destructive" : "secondary"}>
          {count}
          {limit != null ? `/${limit}` : ""}
        </Badge>
      </div>
      <div className="flex-1 space-y-1.5">{children}</div>
    </div>
  );
}

export function LineupEditor({
  matchId,
  formation,
  players,
  existing,
}: {
  matchId: string;
  formation: string | null;
  players: Player[];
  existing: {
    player_id: string;
    is_starter: boolean;
    position_label: string | null;
  }[];
}) {
  const queryClient = useQueryClient();
  const roster = useMemo(
    () => players.filter((p) => p.role !== "Allenatore"),
    [players]
  );

  const initial = useMemo<Record<string, Entry>>(() => {
    const map: Record<string, Entry> = {};
    for (const p of roster) {
      const e = existing.find((x) => x.player_id === p.id);
      map[p.id] = {
        bucket: e ? (e.is_starter ? "starters" : "subs") : "available",
        position_label: e?.position_label ?? "",
      };
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, existing]);

  const [rows, setRows] = useState<Record<string, Entry>>(initial);
  const [selectedFormation, setSelectedFormation] = useState<string>(
    formation ?? ""
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const move = (id: string, target: Bucket) =>
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], bucket: target },
    }));

  const setPos = (id: string, value: string) =>
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], position_label: value },
    }));

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const over = e.over?.id;
    if (!over) return;
    move(String(e.active.id), over as Bucket);
  };

  const mutation = useMutation({
    mutationFn: saveLineup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lineup", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Formazione salvata");
    },
    onError: (e) => toast.error(e.message || "Errore nel salvataggio"),
  });

  const byBucket = (b: Bucket) =>
    roster.filter((p) => rows[p.id]?.bucket === b);

  const available = byBucket("available");
  const starters = byBucket("starters");
  const subs = byBucket("subs");

  const onSave = () => {
    if (errors.length > 0) {
      toast.error("Correggi gli errori prima di salvare");
      return;
    }
    const entries = [...starters, ...subs].map((p) => ({
      player_id: p.id,
      is_starter: rows[p.id].bucket === "starters",
      position_label: rows[p.id].position_label || null,
    }));
    mutation.mutate({
      data: {
        match_id: matchId,
        formation: selectedFormation || null,
        entries,
      },
    });
  };

  const resetAll = () =>
    setRows((prev) => {
      const next: Record<string, Entry> = {};
      for (const id of Object.keys(prev)) {
        next[id] = { bucket: "available", position_label: "" };
      }
      return next;
    });

  const allToSubs = () =>
    setRows((prev) => {
      const next: Record<string, Entry> = { ...prev };
      for (const p of roster) {
        if (next[p.id].bucket === "available") {
          next[p.id] = { ...next[p.id], bucket: "subs" };
        }
      }
      return next;
    });

  if (roster.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nessun giocatore in rosa. Aggiungi giocatori per creare la formazione.
      </p>
    );
  }

  const activePlayer = activeId
    ? roster.find((p) => p.id === activeId)
    : null;

  // Validation
  const errors: string[] = [];
  if (!selectedFormation) errors.push("Seleziona un modulo tattico.");
  if (starters.length > 11)
    errors.push(`Troppi titolari (${starters.length}/11). Sposta o rimuovi giocatori.`);
  if (starters.length > 0 && starters.length < 11)
    errors.push(`Titolari incompleti (${starters.length}/11).`);
  if (starters.length === 0 && subs.length === 0)
    errors.push("Convoca almeno un giocatore.");
  const bucketMap = new Map<string, Bucket>();
  const duplicates: string[] = [];
  for (const p of roster) {
    const b = rows[p.id]?.bucket;
    if (!b || b === "available") continue;
    if (bucketMap.has(p.id)) duplicates.push(`${p.first_name} ${p.last_name}`);
    bucketMap.set(p.id, b);
  }
  if (duplicates.length > 0)
    errors.push(`Giocatori duplicati: ${duplicates.join(", ")}.`);
  const goalies = starters.filter((p) => p.role === "Portiere").length;
  if (goalies > 1)
    errors.push(`Puoi schierare un solo portiere titolare (attuali: ${goalies}).`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <label className="mb-1 block text-sm font-medium">Modulo</label>
          <Select
            value={selectedFormation || "none"}
            onValueChange={(v) => setSelectedFormation(v === "none" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona modulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nessuno</SelectItem>
              {FORMATIONS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={allToSubs}>
            Convoca tutti
          </Button>
          <Button variant="ghost" size="sm" onClick={resetAll}>
            Azzera
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Trascina i giocatori tra le colonne o usa i pulsanti T (titolare) / R
        (riserva) per una selezione rapida.
      </p>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Controlla la formazione</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 text-sm">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Column
            id="available"
            title={BUCKET_LABEL.available}
            count={available.length}
          >
            {available.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Tutti convocati.
              </p>
            )}
            {available.map((p) => (
              <PlayerChip
                key={p.id}
                player={p}
                bucket="available"
                positionLabel=""
                onMove={(t) => move(p.id, t)}
              />
            ))}
          </Column>

          <Column
            id="starters"
            title={BUCKET_LABEL.starters}
            count={starters.length}
            limit={11}
          >
            {starters.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Trascina qui i titolari.
              </p>
            )}
            {starters.map((p) => (
              <PlayerChip
                key={p.id}
                player={p}
                bucket="starters"
                positionLabel={rows[p.id].position_label}
                onPositionChange={(v) => setPos(p.id, v)}
                onMove={(t) => move(p.id, t)}
                onRemove={() => move(p.id, "available")}
              />
            ))}
          </Column>

          <Column id="subs" title={BUCKET_LABEL.subs} count={subs.length}>
            {subs.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Trascina qui le riserve.
              </p>
            )}
            {subs.map((p) => (
              <PlayerChip
                key={p.id}
                player={p}
                bucket="subs"
                positionLabel={rows[p.id].position_label}
                onPositionChange={(v) => setPos(p.id, v)}
                onMove={(t) => move(p.id, t)}
                onRemove={() => move(p.id, "available")}
              />
            ))}
          </Column>
        </div>

        <DragOverlay>
          {activePlayer ? (
            <div className="flex items-center gap-2 rounded-md border bg-card p-2 shadow-lg">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span
                className={`h-2 w-2 rounded-full ${
                  ROLE_COLORS[activePlayer.role as PlayerRole] ?? "bg-muted"
                }`}
              />
              <span className="text-sm">
                {activePlayer.jersey_number != null && (
                  <span className="mr-1 text-muted-foreground">
                    #{activePlayer.jersey_number}
                  </span>
                )}
                {activePlayer.first_name} {activePlayer.last_name}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Button
        onClick={onSave}
        disabled={mutation.isPending || errors.length > 0}
      >
        <Save className="mr-2 h-4 w-4" />
        {mutation.isPending ? "Salvataggio..." : "Salva formazione"}
      </Button>
    </div>
  );
}