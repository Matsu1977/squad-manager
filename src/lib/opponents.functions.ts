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

export const getOpponentDetail = createServerFn({ method: "GET" })
  .validator({ parse: (data: IdInput) => idSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: opponent, error } = await supabaseAdmin
      .from("opponents")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw error;

    const { data: allMatches, error: mErr } = await supabaseAdmin
      .from("matches")
      .select("*")
      .order("match_date", { ascending: false });
    if (mErr) throw mErr;

    const key = (opponent.name ?? "").trim().toLowerCase();
    const matches = (allMatches ?? []).filter(
      (m) => (m.opponent ?? "").trim().toLowerCase() === key
    );

    if (matches.length === 0) {
      return { opponent, matches, scorers: [] as ScorerRow[] };
    }

    const { data: stats, error: sErr } = await supabaseAdmin
      .from("match_stats")
      .select("match_id, goals, assists, players(first_name, last_name)")
      .in(
        "match_id",
        matches.map((m) => m.id)
      );
    if (sErr) throw sErr;

    const scorers: ScorerRow[] = (stats ?? [])
      .filter((s) => (s.goals ?? 0) > 0 || (s.assists ?? 0) > 0)
      .map((s) => ({
        match_id: s.match_id,
        goals: s.goals ?? 0,
        assists: s.assists ?? 0,
        name: s.players
          ? `${s.players.first_name} ${s.players.last_name}`
          : "—",
      }));

    return { opponent, matches, scorers };
  });

export type ScorerRow = {
  match_id: string;
  goals: number;
  assists: number;
  name: string;
};

export const opponentDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["opponents", id, "detail"],
    queryFn: () => getOpponentDetail({ data: { id } }),
  });