CREATE TABLE public.player_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Tecnica',
  current_level INTEGER NOT NULL DEFAULT 50 CHECK (current_level BETWEEN 1 AND 100),
  target_level INTEGER CHECK (target_level BETWEEN 1 AND 100),
  status TEXT NOT NULL DEFAULT 'Da migliorare',
  notes TEXT,
  achieved_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (player_id, name)
);

GRANT SELECT ON public.player_skills TO anon;
GRANT SELECT ON public.player_skills TO authenticated;
GRANT ALL ON public.player_skills TO service_role;

ALTER TABLE public.player_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "player_skills_public_read" ON public.player_skills FOR SELECT USING (true);

CREATE TABLE public.player_skill_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL REFERENCES public.player_skills(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 100),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.player_skill_logs TO anon;
GRANT SELECT ON public.player_skill_logs TO authenticated;
GRANT ALL ON public.player_skill_logs TO service_role;

ALTER TABLE public.player_skill_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "player_skill_logs_public_read" ON public.player_skill_logs FOR SELECT USING (true);

CREATE INDEX idx_player_skills_player ON public.player_skills(player_id);
CREATE INDEX idx_player_skill_logs_skill ON public.player_skill_logs(skill_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_player_skills_updated_at
BEFORE UPDATE ON public.player_skills
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_skill_logs_updated_at
BEFORE UPDATE ON public.player_skill_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();