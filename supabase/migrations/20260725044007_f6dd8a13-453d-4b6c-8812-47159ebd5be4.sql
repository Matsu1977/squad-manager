CREATE TABLE public.match_lineup_players (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  is_starter boolean NOT NULL DEFAULT true,
  slot integer,
  position_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, player_id)
);

GRANT SELECT ON public.match_lineup_players TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_lineup_players TO authenticated;
GRANT ALL ON public.match_lineup_players TO service_role;

ALTER TABLE public.match_lineup_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lineups" ON public.match_lineup_players FOR SELECT TO anon USING (true);

CREATE TRIGGER update_match_lineup_players_updated_at
BEFORE UPDATE ON public.match_lineup_players
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Store formation choice on matches (already has formation column). Nothing else.