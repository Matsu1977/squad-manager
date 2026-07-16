import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  opponent: z.string().min(1, "L'avversario è obbligatorio"),
  match_date: z.string().min(1, "La data è obbligatoria"),
  location: z.string().optional(),
  home_or_away: z.enum(["home", "away"]),
  score_team: z.coerce.number().int().min(0).optional().nullable(),
  score_opponent: z.coerce.number().int().min(0).optional().nullable(),
  formation: z.string().optional(),
  notes: z.string().optional(),
});

export type MatchFormValues = z.infer<typeof formSchema>;

interface MatchFormProps {
  defaultValues?: Partial<MatchFormValues>;
  onSubmit: (values: MatchFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function MatchForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Salva",
}: MatchFormProps) {
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponent: "",
      match_date: "",
      location: "",
      home_or_away: "home",
      score_team: null,
      score_opponent: null,
      formation: "",
      notes: "",
      ...defaultValues,
    },
  });

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="opponent">Avversario</Label>
          <Input id="opponent" {...form.register("opponent")} />
          {errors.opponent && (
            <p className="text-sm text-destructive">{errors.opponent.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="match_date">Data</Label>
          <Input id="match_date" type="date" {...form.register("match_date")} />
          {errors.match_date && (
            <p className="text-sm text-destructive">{errors.match_date.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Luogo</Label>
          <Input id="location" {...form.register("location")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="home_or_away">Casa / Trasferta</Label>
          <select
            id="home_or_away"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...form.register("home_or_away")}
          >
            <option value="home">Casa</option>
            <option value="away">Trasferta</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="score_team">Gol squadra</Label>
          <Input
            id="score_team"
            type="number"
            min={0}
            {...form.register("score_team", {
              setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="score_opponent">Gol avversario</Label>
          <Input
            id="score_opponent"
            type="number"
            min={0}
            {...form.register("score_opponent", {
              setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
            })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="formation">Modulo</Label>
        <Input id="formation" placeholder="4-3-3" {...form.register("formation")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Note</Label>
        <Textarea id="notes" rows={3} {...form.register("notes")} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio..." : submitLabel}
      </Button>
    </form>
  );
}