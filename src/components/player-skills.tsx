import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Trash2, TrendingUp, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addSkillLog,
  deleteSkill,
  playerSkillsQueryOptions,
  saveSkill,
} from "@/lib/skills.functions";
import {
  SKILL_CATEGORIES,
  SKILL_STATUSES,
  SKILL_STATUS_VARIANTS,
  SKILL_SUGGESTIONS,
  SkillCategory,
  SkillStatus,
} from "@/lib/team";

type SkillLog = {
  id: string;
  log_date: string;
  level: number;
  comment: string | null;
};

type Skill = {
  id: string;
  player_id: string;
  name: string;
  category: string;
  current_level: number;
  target_level: number | null;
  status: string;
  notes: string | null;
  achieved_at: string | null;
  player_skill_logs?: SkillLog[] | null;
};

const emptyForm = {
  id: null as string | null,
  name: "",
  category: "Tecnica" as string,
  current_level: 50,
  target_level: 80,
  status: "Da migliorare" as string,
  notes: "",
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function PlayerSkills({ playerId }: { playerId: string }) {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(playerSkillsQueryOptions(playerId));
  const skills = (data ?? []) as unknown as Skill[];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [logSkill, setLogSkill] = useState<Skill | null>(null);
  const [logLevel, setLogLevel] = useState(50);
  const [logComment, setLogComment] = useState("");

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["player-skills", playerId] });

  const saveMutation = useMutation({
    mutationFn: saveSkill,
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setForm(emptyForm);
      toast.success("Abilità salvata");
    },
    onError: (error: Error) => toast.error(error.message || "Errore di salvataggio"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      invalidate();
      toast.success("Abilità eliminata");
    },
    onError: (error: Error) => toast.error(error.message || "Errore"),
  });

  const logMutation = useMutation({
    mutationFn: addSkillLog,
    onSuccess: () => {
      invalidate();
      setLogSkill(null);
      setLogComment("");
      toast.success("Progresso registrato");
    },
    onError: (error: Error) => toast.error(error.message || "Errore"),
  });

  const openNew = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (skill: Skill) => {
    setForm({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      current_level: skill.current_level,
      target_level: skill.target_level ?? 80,
      status: skill.status,
      notes: skill.notes ?? "",
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Inserisci il nome dell'abilità");
      return;
    }
    saveMutation.mutate({
      data: {
        id: form.id,
        player_id: playerId,
        name: form.name.trim(),
        category: form.category,
        current_level: Number(form.current_level),
        target_level: form.target_level ? Number(form.target_level) : null,
        status: form.status as SkillStatus,
        notes: form.notes || null,
        achieved_at: null,
      },
    });
  };

  const achieved = skills.filter((s) => s.status === "Raggiunto").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-lg">Sviluppo e obiettivi</CardTitle>
          <p className="text-sm text-muted-foreground">
            {skills.length} abilità monitorate · {achieved} raggiunte
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}>
              <Plus className="mr-1 h-4 w-4" /> Abilità
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Modifica abilità" : "Nuova abilità"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skill-category">Categoria</Label>
                <select
                  id="skill-category"
                  className={selectClass}
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {SKILL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-name">Abilità</Label>
                <Input
                  id="skill-name"
                  list="skill-suggestions"
                  value={form.name}
                  placeholder="Es. Piede sinistro"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <datalist id="skill-suggestions">
                  {(SKILL_SUGGESTIONS[form.category as SkillCategory] ?? []).map(
                    (s) => (
                      <option key={s} value={s} />
                    )
                  )}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skill-current">Livello attuale</Label>
                  <Input
                    id="skill-current"
                    type="number"
                    min={1}
                    max={100}
                    value={form.current_level}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        current_level: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill-target">Obiettivo</Label>
                  <Input
                    id="skill-target"
                    type="number"
                    min={1}
                    max={100}
                    value={form.target_level}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        target_level: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-status">Stato</Label>
                <select
                  id="skill-status"
                  className={selectClass}
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  {SKILL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-notes">Note / esercizi</Label>
                <Textarea
                  id="skill-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvataggio..." : "Salva"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nessuna abilità monitorata. Aggiungi gli aspetti da migliorare
            (piede debole, colpo di testa, resistenza, visione di gioco…).
          </p>
        ) : (
          skills.map((skill) => {
            const logs = [...(skill.player_skill_logs ?? [])].sort((a, b) =>
              a.log_date < b.log_date ? 1 : -1
            );
            const first = logs[logs.length - 1];
            const delta = first ? skill.current_level - first.level : 0;
            return (
              <div key={skill.id} className="space-y-2 rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{skill.name}</span>
                    <Badge variant="outline">{skill.category}</Badge>
                    <Badge
                      variant={
                        SKILL_STATUS_VARIANTS[skill.status as SkillStatus] ??
                        "outline"
                      }
                    >
                      {skill.status}
                    </Badge>
                    {delta !== 0 ? (
                      <span
                        className={`text-xs font-medium ${delta > 0 ? "text-green-600" : "text-destructive"}`}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setLogSkill(skill);
                        setLogLevel(skill.current_level);
                      }}
                      title="Registra progresso"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(skill)}
                      title="Modifica"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        deleteMutation.mutate({ data: { id: skill.id } })
                      }
                      title="Elimina"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Attuale {skill.current_level}</span>
                    <span>
                      {skill.target_level
                        ? `Obiettivo ${skill.target_level}`
                        : "Nessun obiettivo"}
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${skill.current_level}%` }}
                    />
                    {skill.target_level ? (
                      <div
                        className="absolute top-0 h-full w-0.5 bg-foreground/60"
                        style={{ left: `${skill.target_level}%` }}
                      />
                    ) : null}
                  </div>
                </div>

                {skill.notes ? (
                  <p className="text-sm text-muted-foreground">{skill.notes}</p>
                ) : null}

                {logs.length > 0 ? (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">
                      Storico progressi ({logs.length})
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {logs.map((log) => (
                        <li key={log.id} className="flex gap-2">
                          <span className="text-muted-foreground">
                            {log.log_date}
                          </span>
                          <span className="font-medium">{log.level}</span>
                          {log.comment ? (
                            <span className="text-muted-foreground">
                              — {log.comment}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>

      <Dialog
        open={logSkill !== null}
        onOpenChange={(o) => (o ? null : setLogSkill(null))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registra progresso — {logSkill?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="log-level">Nuovo livello (1-100)</Label>
              <Input
                id="log-level"
                type="number"
                min={1}
                max={100}
                value={logLevel}
                onChange={(e) => setLogLevel(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-comment">Commento</Label>
              <Textarea
                id="log-comment"
                rows={2}
                value={logComment}
                onChange={(e) => setLogComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={logMutation.isPending}
              onClick={() =>
                logSkill &&
                logMutation.mutate({
                  data: {
                    skill_id: logSkill.id,
                    log_date: new Date().toISOString().slice(0, 10),
                    level: logLevel,
                    comment: logComment || null,
                  },
                })
              }
            >
              {logMutation.isPending ? "Salvataggio..." : "Registra"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
