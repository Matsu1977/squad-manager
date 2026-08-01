ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS season text,
  ADD COLUMN IF NOT EXISTS competition text;

UPDATE public.matches
SET season = CASE
  WHEN EXTRACT(MONTH FROM match_date) >= 7
    THEN EXTRACT(YEAR FROM match_date)::int || '/' || (EXTRACT(YEAR FROM match_date)::int + 1)
  ELSE (EXTRACT(YEAR FROM match_date)::int - 1) || '/' || EXTRACT(YEAR FROM match_date)::int
END
WHERE season IS NULL;

UPDATE public.matches SET competition = 'Campionato' WHERE competition IS NULL;