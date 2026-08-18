import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const typeSchema = z.enum(["Infortunio", "Sospensione", "Altro"]);

const unavailabilitySchema = z.object({
  id: z.string().uuid().optional().nullable(),
  player_id: z.string().uuid(),
  type: typeSchema,
  reason: z.string().optional().nullable(),
  start_date: z.string().min(1, "La data di inizio è obbligatoria"),
  end_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
type UnavailabilityInput = z.infer<typeof unavailabilitySchema>;

const idSchema = z.object({ id: z.string().uuid() });
type IdInput = z.infer<typeof idSchema>;

export const getUnavailabilities = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("player_unavailabilities")
      .select(
        "*, players(id, first_name, last_name, role, jersey_number, photo_url)"
      )
      .order("start_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
);

export const saveUnavailability = createServerFn({ method: "POST" })
  .validator({
    parse: (data: UnavailabilityInput) => unavailabilitySchema.parse(data),
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { id, ...rest } = data;
    const payload = {
      ...rest,
      reason: rest.reason || null,
      end_date: rest.end_date || null,
      notes: rest.notes || null,
    };
    if (id) {
      const { data: row, error } = await supabaseAdmin
        .from("player_unavailabilities")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("player_unavailabilities")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteUnavailability = createServerFn({ method: "POST" })
  .validator({ parse: (data: IdInput) => idSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("player_unavailabilities")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const unavailabilitiesQueryOptions = () =>
  queryOptions({
    queryKey: ["unavailabilities"],
    queryFn: () => getUnavailabilities(),
  });