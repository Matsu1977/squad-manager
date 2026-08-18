CREATE TYPE public.unavailability_type AS ENUM ('Infortunio', 'Sospensione', 'Altro');

CREATE TABLE public.player_unavailabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  type public.unavailability_type NOT NULL DEFAULT 'Infortunio',
  reason text,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.player_unavailabilities TO anon;
GRANT SELECT ON public.player_unavailabilities TO authenticated;
GRANT ALL ON public.player_unavailabilities TO service_role;

ALTER TABLE public.player_unavailabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view player_unavailabilities"
  ON public.player_unavailabilities FOR SELECT USING (true);

CREATE TRIGGER update_player_unavailabilities_updated_at
  BEFORE UPDATE ON public.player_unavailabilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_player_unavailabilities_player ON public.player_unavailabilities(player_id);
CREATE INDEX idx_player_unavailabilities_dates ON public.player_unavailabilities(start_date, end_date);