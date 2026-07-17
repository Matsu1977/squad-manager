import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const trainingSchema = z.object({
  session_date: z.string().min(1, "La data è obbligatoria"),
  session_time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type TrainingInput = z.infer<typeof trainingSchema>;

const idSchema = z.object({ id: z.string().uuid() });
type IdInput = z.infer<typeof idSchema>;

const updateSchema = z.object({ id: z.string().uuid() }).merge(trainingSchema);
type UpdateInput = z.infer<typeof updateSchema>;

const attendanceSchema = z.object({
  training_session_id: z.string().uuid(),
  attendances: z.array(
    z.object({
      player_id: z.string().uuid(),
      attended: z.boolean(),
    })
  ),
});
type AttendanceInput = z.infer<typeof attendanceSchema>;

export const getTrainings = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("training_sessions")
      .select("*")
      .order("session_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
);

export const getTraining = createServerFn({ method: "GET" })
  .validator({ parse: (data: IdInput) => idSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: session, error } = await supabaseAdmin
      .from("training_sessions")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw error;
    const { data: attendances, error: aErr } = await supabaseAdmin
      .from("training_attendances")
      .select("*")
      .eq("training_session_id", data.id);
    if (aErr) throw aErr;
    return { session, attendances: attendances ?? [] };
  });

export const createTraining = createServerFn({ method: "POST" })
  .validator({ parse: (data: TrainingInput) => trainingSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: session, error } = await supabaseAdmin
      .from("training_sessions")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return session;
  });

export const updateTraining = createServerFn({ method: "POST" })
  .validator({ parse: (data: UpdateInput) => updateSchema.parse(data) })
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: session, error } = await supabaseAdmin
      .from("training_sessions")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return session;
  });

export const deleteTraining = createServerFn({ method: "POST" })
  .validator({ parse: (data: IdInput) => idSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { error } = await supabaseAdmin
      .from("training_sessions")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const saveAttendances = createServerFn({ method: "POST" })
  .validator({ parse: (data: AttendanceInput) => attendanceSchema.parse(data) })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    // Delete all then re-insert (simple)
    const { error: delErr } = await supabaseAdmin
      .from("training_attendances")
      .delete()
      .eq("training_session_id", data.training_session_id);
    if (delErr) throw delErr;
    if (data.attendances.length > 0) {
      const rows = data.attendances.map((a) => ({
        training_session_id: data.training_session_id,
        player_id: a.player_id,
        attended: a.attended,
      }));
      const { error: insErr } = await supabaseAdmin
        .from("training_attendances")
        .insert(rows);
      if (insErr) throw insErr;
    }
    return { success: true };
  });

export const trainingsQueryOptions = () =>
  queryOptions({
    queryKey: ["trainings"],
    queryFn: () => getTrainings(),
  });

export const trainingQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["trainings", id],
    queryFn: () => getTraining({ data: { id } }),
  });