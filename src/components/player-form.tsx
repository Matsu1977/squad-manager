import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PLAYER_ROLES,
  PLAYER_STATUSES,
  PREFERRED_FEET,
  RATING_FIELDS,
} from "@/lib/team";

const formSchema = z.object({
  first_name: z.string().min(1, "Il nome è obbligatorio"),
  last_name: z.string().min(1, "Il cognome è obbligatorio"),
  birth_date: z.string().optional(),
  role: z.enum(["Portiere", "Difensore", "Centrocampista", "Attaccante", "Allenatore"]),
  jersey_number: z.coerce.number().int().min(1).max(99).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  photo_url: z.string().url().optional().or(z.literal("")),
  status: z.enum(["Ativo", "Infortunato", "Sospeso", "Inattivo"]),
  notes: z.string().optional(),
  height_cm: z.coerce.number().int().min(100).max(250).optional(),
  weight_kg: z.coerce.number().int().min(30).max(200).optional(),
  preferred_foot: z.enum(["Destro", "Sinistro", "Ambidestro"]).optional().or(z.literal("")),
  rating_pace: z.coerce.number().int().min(1).max(100).optional(),
  rating_shooting: z.coerce.number().int().min(1).max(100).optional(),
  rating_passing: z.coerce.number().int().min(1).max(100).optional(),
  rating_dribbling: z.coerce.number().int().min(1).max(100).optional(),
  rating_defending: z.coerce.number().int().min(1).max(100).optional(),
  rating_physical: z.coerce.number().int().min(1).max(100).optional(),
});

export type PlayerFormValues = z.infer<typeof formSchema>;

interface PlayerFormProps {
  defaultValues?: Partial<PlayerFormValues>;
  onSubmit: (values: PlayerFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function PlayerForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Salva",
}: PlayerFormProps) {
  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      birth_date: "",
      role: "Attaccante",
      jersey_number: undefined,
      phone: "",
      email: "",
      photo_url: "",
      status: "Ativo",
      notes: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Nome</Label>
          <Input id="first_name" {...form.register("first_name")} />
          {form.formState.errors.first_name ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.first_name.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Cognome</Label>
          <Input id="last_name" {...form.register("last_name")} />
          {form.formState.errors.last_name ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.last_name.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="birth_date">Data di nascita</Label>
          <Input id="birth_date" type="date" {...form.register("birth_date")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jersey_number">Numero maglia</Label>
          <Input
            id="jersey_number"
            type="number"
            min={1}
            max={99}
            {...form.register("jersey_number")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">Ruolo</Label>
          <select
            id="role"
            {...form.register("role")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {PLAYER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Stato</Label>
          <select
            id="status"
            {...form.register("status")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {PLAYER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" type="tel" {...form.register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo_url">URL foto</Label>
        <Input id="photo_url" type="url" {...form.register("photo_url")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Note</Label>
        <Textarea id="notes" {...form.register("notes")} rows={4} />
      </div>

      <div className="space-y-3 rounded-md border p-4">
        <h3 className="text-sm font-semibold">Parametri fisici</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="height_cm">Altezza (cm)</Label>
            <Input id="height_cm" type="number" min={100} max={250} {...form.register("height_cm")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight_kg">Peso (kg)</Label>
            <Input id="weight_kg" type="number" min={30} max={200} {...form.register("weight_kg")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferred_foot">Piede preferito</Label>
            <select
              id="preferred_foot"
              {...form.register("preferred_foot")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">—</option>
              {PREFERRED_FEET.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-md border p-4">
        <h3 className="text-sm font-semibold">Valutazioni tecniche (1-100)</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {RATING_FIELDS.map((r) => (
            <div key={r.key} className="space-y-2">
              <Label htmlFor={r.key}>{r.label}</Label>
              <Input
                id={r.key}
                type="number"
                min={1}
                max={100}
                {...form.register(r.key)}
              />
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio..." : submitLabel}
      </Button>
    </form>
  );
}
