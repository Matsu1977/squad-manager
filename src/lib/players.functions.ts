import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const playerRoleSchema = z.enum([
  "Portiere",
  "Difensore",
  "Centrocampista",
  "Attaccante",
  "Allenatore",
]);

const playerStatusSchema = z.enum([
  "Ativo",
  "Infortunato",
  "Sospeso",
  "Inattivo",
]);

const playerSchema = z.object({
  first_name: z.string().min(1, "Il nome è obbligatorio"),
  last_name: z.string().min(1, "Il cognome è obbligatorio"),
  birth_date: z.string().optional().nullable(),
  role: playerRoleSchema,
  jersey_number: z.coerce.number().int().min(1).max(99).optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  status: playerStatusSchema,
  notes: z.string().optional().nullable(),
});

type PlayerInput = z.infer<typeof playerSchema>;

const playerIdSchema = z.object({ id: z.string().uuid() });

type PlayerIdInput = z.infer<typeof playerIdSchema>;

const updatePlayerSchema = z
  .object({ id: z.string().uuid() })
  .merge(playerSchema);

type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;

export const getPlayers = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("players")
      .select("*")
      .order("last_name", { ascending: true })
      .order("first_name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
);

export const getPlayer = createServerFn({ method: "GET" })
  .validator({
    parse: (data: PlayerIdInput) => playerIdSchema.parse(data),
  })
  .handler(async ({ data }) => {
    const { id } = data;
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: player, error } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return player;
  });

export const createPlayer = createServerFn({ method: "POST" })
  .validator({
    parse: (data: PlayerInput) => playerSchema.parse(data),
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: player, error } = await supabaseAdmin
      .from("players")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return player;
  });

export const updatePlayer = createServerFn({ method: "POST" })
  .validator({
    parse: (data: UpdatePlayerInput) => updatePlayerSchema.parse(data),
  })
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: player, error } = await supabaseAdmin
      .from("players")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return player;
  });

export const deletePlayer = createServerFn({ method: "POST" })
  .validator({
    parse: (data: PlayerIdInput) => playerIdSchema.parse(data),
  })
  .handler(async ({ data }) => {
    const { id } = data;
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("players")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  });

export const playersQueryOptions = () =>
  queryOptions({
    queryKey: ["players"],
    queryFn: () => getPlayers(),
  });

export const playerQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["players", id],
    queryFn: () => getPlayer({ data: { id } }),
  });
