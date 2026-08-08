import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const opponentSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Il nome della squadra è obbligatorio"),
  contact_name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  colors: z.string().optional().nullable(),
  usual_formation: z.string().optional().nullable(),
  strengths: z.string().optional().nullable(),
  weaknesses: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
type OpponentInput = z.infer<typeof opponentSchema>;

const idSchema = z.object({ id: z.string().uuid() });
type IdInput = z.infer<typeof idSchema>;

export const getOpponents = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("opponents")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
);

export const saveOpponent = createServerFn({ method: "POST" })
  .validator({ parse: (data: OpponentInput) => opponentSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { id, ...rest } = data;
    if (id) {
      const { data: row, error } = await supabaseAdmin
        .from("opponents")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("opponents")
      .insert(rest)
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const deleteOpponent = createServerFn({ method: "POST" })
  .validator({ parse: (data: IdInput) => idSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("opponents")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const opponentsQueryOptions = () =>
  queryOptions({
    queryKey: ["opponents"],
    queryFn: () => getOpponents(),
  });