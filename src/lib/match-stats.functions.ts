import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const statSchema = z.object({
  player_id: z.string().uuid(),
  goals: z.coerce.number().int().min(0).default(0),
  assists: z.coerce.number().int().min(0).default(0),
  yellow_cards: z.coerce.number().int().min(0).max(2).default(0),
  red_cards: z.coerce.number().int().min(0).max(1).default(0),
  minutes_played: z.coerce.number().int().min(0).max(120).default(0),
});

const saveStatsSchema = z.object({
  match_id: z.string().uuid(),
  stats: z.array(statSchema),
});

type SaveStatsInput = z.infer<typeof saveStatsSchema>;

const matchIdSchema = z.object({ match_id: z.string().uuid() });
type MatchIdInput = z.infer<typeof matchIdSchema>;

export const getMatchStats = createServerFn({ method: "GET" })
  .validator({ parse: (data: MatchIdInput) => matchIdSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: rows, error } = await supabaseAdmin
      .from("match_stats")
      .select("*")
      .eq("match_id", data.match_id);
    if (error) throw error;
    return rows ?? [];
  });

export const saveMatchStats = createServerFn({ method: "POST" })
  .validator({ parse: (data: SaveStatsInput) => saveStatsSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const nonEmpty = data.stats.filter(
      (s) =>
        s.goals > 0 ||
        s.assists > 0 ||
        s.yellow_cards > 0 ||
        s.red_cards > 0 ||
        s.minutes_played > 0
    );
    // Replace all stats for this match
    const del = await supabaseAdmin
      .from("match_stats")
      .delete()
      .eq("match_id", data.match_id);
    if (del.error) throw del.error;

    if (nonEmpty.length > 0) {
      const payload = nonEmpty.map((s) => ({
        match_id: data.match_id,
        ...s,
      }));
      const { error } = await supabaseAdmin
        .from("match_stats")
        .insert(payload);
      if (error) throw error;
    }
    return { success: true };
  });

export const getLeaderboard = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("match_stats")
      .select(
        "player_id, goals, assists, yellow_cards, red_cards, minutes_played, players ( id, first_name, last_name, role, jersey_number )"
      );
    if (error) throw error;
    type Row = {
      player_id: string;
      goals: number;
      assists: number;
      yellow_cards: number;
      red_cards: number;
      minutes_played: number;
      players: {
        id: string;
        first_name: string;
        last_name: string;
        role: string;
        jersey_number: number | null;
      } | null;
    };
    const map = new Map<
      string,
      {
        player_id: string;
        first_name: string;
        last_name: string;
        role: string;
        jersey_number: number | null;
        appearances: number;
        goals: number;
        assists: number;
        yellow_cards: number;
        red_cards: number;
        minutes_played: number;
      }
    >();
    for (const r of (data ?? []) as Row[]) {
      if (!r.players) continue;
      const cur = map.get(r.player_id) ?? {
        player_id: r.player_id,
        first_name: r.players.first_name,
        last_name: r.players.last_name,
        role: r.players.role,
        jersey_number: r.players.jersey_number,
        appearances: 0,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        minutes_played: 0,
      };
      cur.appearances += 1;
      cur.goals += r.goals;
      cur.assists += r.assists;
      cur.yellow_cards += r.yellow_cards;
      cur.red_cards += r.red_cards;
      cur.minutes_played += r.minutes_played;
      map.set(r.player_id, cur);
    }
    return Array.from(map.values());
  }
);

export const matchStatsQueryOptions = (matchId: string) =>
  queryOptions({
    queryKey: ["match-stats", matchId],
    queryFn: () => getMatchStats({ data: { match_id: matchId } }),
  });

export const leaderboardQueryOptions = () =>
  queryOptions({
    queryKey: ["leaderboard"],
    queryFn: () => getLeaderboard(),
  });