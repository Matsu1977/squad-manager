
CREATE TYPE public.preferred_foot AS ENUM ('Destro', 'Sinistro', 'Ambidestro');

ALTER TABLE public.players
  ADD COLUMN height_cm integer CHECK (height_cm IS NULL OR (height_cm BETWEEN 100 AND 250)),
  ADD COLUMN weight_kg integer CHECK (weight_kg IS NULL OR (weight_kg BETWEEN 30 AND 200)),
  ADD COLUMN preferred_foot public.preferred_foot,
  ADD COLUMN rating_pace integer CHECK (rating_pace IS NULL OR (rating_pace BETWEEN 1 AND 100)),
  ADD COLUMN rating_shooting integer CHECK (rating_shooting IS NULL OR (rating_shooting BETWEEN 1 AND 100)),
  ADD COLUMN rating_passing integer CHECK (rating_passing IS NULL OR (rating_passing BETWEEN 1 AND 100)),
  ADD COLUMN rating_dribbling integer CHECK (rating_dribbling IS NULL OR (rating_dribbling BETWEEN 1 AND 100)),
  ADD COLUMN rating_defending integer CHECK (rating_defending IS NULL OR (rating_defending BETWEEN 1 AND 100)),
  ADD COLUMN rating_physical integer CHECK (rating_physical IS NULL OR (rating_physical BETWEEN 1 AND 100));
