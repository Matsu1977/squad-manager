import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const matchIdSchema = z.object({ match_id: z.string().uuid() });
type MatchIdInput = z.infer<typeof matchIdSchema>;

const entrySchema = z.object({
  player_id: z.string().uuid(),
  is_starter: z.boolean(),
  slot: z.coerce.number().int().min(0).max(20).nullable().optional(),
  position_label: z.string().nullable().optional(),
});

const saveSchema = z.object({
  match_id: z.string().uuid(),
  formation: z.string().nullable().optional(),
  entries: z.array(entrySchema),
});
type SaveInput = z.infer<typeof saveSchema>;

export const getLineup = createServerFn({ method: "GET" })
  .validator({ parse: (data: MatchIdInput) => matchIdSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: rows, error } = await supabaseAdmin
      .from("match_lineup_players")
      .select("*")
      .eq("match_id", data.match_id);
    if (error) throw error;
    return rows ?? [];
  });

export const saveLineup = createServerFn({ method: "POST" })
  .validator({ parse: (data: SaveInput) => saveSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // Update match formation
    const { error: mErr } = await supabaseAdmin
      .from("matches")
      .update({ formation: data.formation ?? null })
      .eq("id", data.match_id);
    if (mErr) throw mErr;

    // Replace all lineup entries for this match
    const del = await supabaseAdmin
      .from("match_lineup_players")
      .delete()
      .eq("match_id", data.match_id);
    if (del.error) throw del.error;

    if (data.entries.length > 0) {
      const payload = data.entries.map((e) => ({
        match_id: data.match_id,
        player_id: e.player_id,
        is_starter: e.is_starter,
        slot: e.slot ?? null,
        position_label: e.position_label ?? null,
      }));
      const { error } = await supabaseAdmin
        .from("match_lineup_players")
        .insert(payload);
      if (error) throw error;
    }
    return { success: true };
  });

export const lineupQueryOptions = (matchId: string) =>
  queryOptions({
    queryKey: ["lineup", matchId],
    queryFn: () => getLineup({ data: { match_id: matchId } }),
  });