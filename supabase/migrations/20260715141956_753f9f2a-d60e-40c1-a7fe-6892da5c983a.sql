DROP POLICY IF EXISTS "Allow all operations on players" ON public.players;
DROP POLICY IF EXISTS "Allow all operations on matches" ON public.matches;
DROP POLICY IF EXISTS "Allow all operations on match_stats" ON public.match_stats;
DROP POLICY IF EXISTS "Allow all operations on training_sessions" ON public.training_sessions;
DROP POLICY IF EXISTS "Allow all operations on training_attendances" ON public.training_attendances;

REVOKE ALL ON public.players FROM authenticated;
REVOKE ALL ON public.matches FROM authenticated;
REVOKE ALL ON public.match_stats FROM authenticated;
REVOKE ALL ON public.training_sessions FROM authenticated;
REVOKE ALL ON public.training_attendances FROM authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.players FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.matches FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.match_stats FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.training_sessions FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.training_attendances FROM anon;

CREATE POLICY "Anyone can view players" ON public.players FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can view match_stats" ON public.match_stats FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can view training_sessions" ON public.training_sessions FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can view training_attendances" ON public.training_attendances FOR SELECT TO anon USING (true);