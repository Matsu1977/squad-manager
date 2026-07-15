import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLAYER_ROLES, PLAYER_STATUSES } from "@/lib/team";

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
          <Label>Ruolo</Label>
          <Select
            defaultValue={form.getValues("role")}
            onValueChange={(value) => form.setValue("role", value as PlayerRole)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLAYER_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Stato</Label>
          <Select
            defaultValue={form.getValues("status")}
            onValueChange={(value) =>
              form.setValue("status", value as PlayerStatus)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLAYER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio..." : submitLabel}
      </Button>
    </form>
  );
}
