import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const matchSchema = z.object({
  opponent: z.string().min(1, "L'avversario è obbligatorio"),
  match_date: z.string().min(1, "La data è obbligatoria"),
  location: z.string().optional().nullable(),
  home_or_away: z.enum(["home", "away"]),
  score_team: z.coerce.number().int().min(0).nullable().optional(),
  score_opponent: z.coerce.number().int().min(0).nullable().optional(),
  formation: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type MatchInput = z.infer<typeof matchSchema>;

const matchIdSchema = z.object({ id: z.string().uuid() });
type MatchIdInput = z.infer<typeof matchIdSchema>;

const updateMatchSchema = z
  .object({ id: z.string().uuid() })
  .merge(matchSchema);
type UpdateMatchInput = z.infer<typeof updateMatchSchema>;

export const getMatches = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("matches")
      .select("*")
      .order("match_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
);

export const getMatch = createServerFn({ method: "GET" })
  .validator({
    parse: (data: MatchIdInput) => matchIdSchema.parse(data),
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: match, error } = await supabaseAdmin
      .from("matches")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw error;
    return match;
  });

export const createMatch = createServerFn({ method: "POST" })
  .validator({
    parse: (data: MatchInput) => matchSchema.parse(data),
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: match, error } = await supabaseAdmin
      .from("matches")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return match;
  });

export const updateMatch = createServerFn({ method: "POST" })
  .validator({
    parse: (data: UpdateMatchInput) => updateMatchSchema.parse(data),
  })
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: match, error } = await supabaseAdmin
      .from("matches")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return match;
  });

export const deleteMatch = createServerFn({ method: "POST" })
  .validator({
    parse: (data: MatchIdInput) => matchIdSchema.parse(data),
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("matches")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const matchesQueryOptions = () =>
  queryOptions({
    queryKey: ["matches"],
    queryFn: () => getMatches(),
  });

export const matchQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["matches", id],
    queryFn: () => getMatch({ data: { id } }),
  });
