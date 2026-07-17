import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  session_date: z.string().min(1, "La data è obbligatoria"),
  session_time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type TrainingFormValues = z.infer<typeof formSchema>;

interface TrainingFormProps {
  defaultValues?: Partial<TrainingFormValues>;
  onSubmit: (values: TrainingFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function TrainingForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Salva",
}: TrainingFormProps) {
  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      session_date: "",
      session_time: "",
      location: "",
      notes: "",
      ...defaultValues,
    },
  });

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="session_date">Data</Label>
          <Input
            id="session_date"
            type="date"
            {...form.register("session_date")}
          />
          {errors.session_date && (
            <p className="text-sm text-destructive">
              {errors.session_date.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="session_time">Ora</Label>
          <Input
            id="session_time"
            type="time"
            {...form.register("session_time")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Luogo</Label>
        <Input id="location" {...form.register("location")} />
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