import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const skillStatusSchema = z.enum(["Da migliorare", "In corso", "Raggiunto"]);

const skillSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  player_id: z.string().uuid(),
  name: z.string().min(1, "Il nome dell'abilità è obbligatorio"),
  category: z.string().min(1),
  current_level: z.coerce.number().int().min(1).max(100),
  target_level: z.coerce.number().int().min(1).max(100).optional().nullable(),
  status: skillStatusSchema,
  notes: z.string().optional().nullable(),
  achieved_at: z.string().optional().nullable(),
});

type SkillInput = z.infer<typeof skillSchema>;

const playerIdSchema = z.object({ player_id: z.string().uuid() });
type PlayerIdInput = z.infer<typeof playerIdSchema>;

const idSchema = z.object({ id: z.string().uuid() });
type IdInput = z.infer<typeof idSchema>;

const logSchema = z.object({
  skill_id: z.string().uuid(),
  log_date: z.string().min(1),
  level: z.coerce.number().int().min(1).max(100),
  comment: z.string().optional().nullable(),
});
type LogInput = z.infer<typeof logSchema>;

export const getPlayerSkills = createServerFn({ method: "GET" })
  .validator({ parse: (data: PlayerIdInput) => playerIdSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: skills, error } = await supabaseAdmin
      .from("player_skills")
      .select("*, player_skill_logs(*)")
      .eq("player_id", data.player_id)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return skills ?? [];
  });

export const saveSkill = createServerFn({ method: "POST" })
  .validator({ parse: (data: SkillInput) => skillSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { id, ...rest } = data;
    const payload = {
      ...rest,
      achieved_at:
        rest.status === "Raggiunto"
          ? (rest.achieved_at || new Date().toISOString().slice(0, 10))
          : null,
    };
    if (id) {
      const { data: skill, error } = await supabaseAdmin
        .from("player_skills")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return skill;
    }
    const { data: skill, error } = await supabaseAdmin
      .from("player_skills")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    await supabaseAdmin.from("player_skill_logs").insert({
      skill_id: skill.id,
      level: payload.current_level,
      comment: "Valutazione iniziale",
    });
    return skill;
  });

export const deleteSkill = createServerFn({ method: "POST" })
  .validator({ parse: (data: IdInput) => idSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("player_skills")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const addSkillLog = createServerFn({ method: "POST" })
  .validator({ parse: (data: LogInput) => logSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: log, error } = await supabaseAdmin
      .from("player_skill_logs")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    const { error: updateError } = await supabaseAdmin
      .from("player_skills")
      .update({ current_level: data.level })
      .eq("id", data.skill_id);
    if (updateError) throw updateError;
    return log;
  });

export const playerSkillsQueryOptions = (playerId: string) =>
  queryOptions({
    queryKey: ["player-skills", playerId],
    queryFn: () => getPlayerSkills({ data: { player_id: playerId } }),
  });

export const getAllSkills = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("player_skills")
      .select(
        "*, player_skill_logs(*), players(id, first_name, last_name, role, jersey_number)"
      )
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
);

export const allSkillsQueryOptions = () =>
  queryOptions({
    queryKey: ["all-skills"],
    queryFn: () => getAllSkills(),
  });
