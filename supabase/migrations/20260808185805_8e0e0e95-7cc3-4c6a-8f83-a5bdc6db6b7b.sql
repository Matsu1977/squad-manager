CREATE TABLE public.opponents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text,
  phone text,
  email text,
  venue text,
  colors text,
  usual_formation text,
  strengths text,
  weaknesses text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.opponents TO anon;
GRANT SELECT ON public.opponents TO authenticated;
GRANT ALL ON public.opponents TO service_role;

ALTER TABLE public.opponents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view opponents" ON public.opponents FOR SELECT USING (true);

CREATE TRIGGER update_opponents_updated_at BEFORE UPDATE ON public.opponents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();