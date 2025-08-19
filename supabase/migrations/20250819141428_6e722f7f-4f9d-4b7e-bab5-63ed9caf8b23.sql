-- Tighten access to sensitive profile data by removing public-read policy
-- This keeps existing scoped policies (own profile, shared channels/workspaces, admin)

-- Ensure table exists and RLS remains enabled (do not disable RLS)
-- Remove overly permissive policy allowing anyone to read all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;