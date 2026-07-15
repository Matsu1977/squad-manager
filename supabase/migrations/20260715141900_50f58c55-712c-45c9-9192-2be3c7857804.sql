CREATE TYPE public.player_role AS ENUM ('Portiere', 'Difensore', 'Centrocampista', 'Attaccante', 'Allenatore');
CREATE TYPE public.player_status AS ENUM ('Ativo', 'Infortunato', 'Sospeso', 'Inattivo');

CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date,
  role public.player_role NOT NULL,
  jersey_number integer,
  phone text,
  email text,
  photo_url text,
  status public.player_status NOT NULL DEFAULT 'Ativo',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO anon;

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on players" ON public.players
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opponent text NOT NULL,
  match_date date NOT NULL,
  location text,
  home_or_away text NOT NULL DEFAULT 'home',
  score_team integer DEFAULT 0,
  score_opponent integer DEFAULT 0,
  formation text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO anon;

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on matches" ON public.matches
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE public.match_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  goals integer NOT NULL DEFAULT 0,
  assists integer NOT NULL DEFAULT 0,
  yellow_cards integer NOT NULL DEFAULT 0,
  red_cards integer NOT NULL DEFAULT 0,
  minutes_played integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(match_id, player_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_stats TO authenticated;
GRANT ALL ON public.match_stats TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_stats TO anon;

ALTER TABLE public.match_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on match_stats" ON public.match_stats
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE public.training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL,
  session_time time,
  location text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_sessions TO authenticated;
GRANT ALL ON public.training_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_sessions TO anon;

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on training_sessions" ON public.training_sessions
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE public.training_attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_session_id uuid NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  attended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(training_session_id, player_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_attendances TO authenticated;
GRANT ALL ON public.training_attendances TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_attendances TO anon;

ALTER TABLE public.training_attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on training_attendances" ON public.training_attendances
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_stats_updated_at BEFORE UPDATE ON public.match_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON public.training_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_attendances_updated_at BEFORE UPDATE ON public.training_attendances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();