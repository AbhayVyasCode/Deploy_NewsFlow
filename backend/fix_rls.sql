-- Quick fix for RLS policies if they're blocking inserts

-- Temporarily disable RLS on user_preferences for testing
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, add a permissive policy for inserts:
-- DROP POLICY IF EXISTS "Users can insert own preferences." ON public.user_preferences;
-- CREATE POLICY "Allow all inserts for testing" ON public.user_preferences
--   FOR INSERT WITH CHECK (true);

-- To re-enable RLS later:
-- ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
