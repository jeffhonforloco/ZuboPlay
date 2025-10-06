-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Optional: Add a policy for public viewing of minimal profile data in game context
-- This allows users to see basic info of other players they encounter in-game
-- Uncomment if you need this for leaderboards or multiplayer features:
-- CREATE POLICY "Users can view basic profile info of other players"
-- ON public.profiles
-- FOR SELECT
-- TO authenticated
-- USING (true);