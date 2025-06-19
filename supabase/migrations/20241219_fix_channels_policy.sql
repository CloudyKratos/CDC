
-- Fix infinite recursion in channels policy
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view public channels or channels they're members of" ON public.channels;
DROP POLICY IF EXISTS "Users can view channels they have access to" ON public.channels;
DROP POLICY IF EXISTS "Users can access public channels" ON public.channels;

-- Create a simple, non-recursive policy for channels
CREATE POLICY "Enable read access for public channels"
ON public.channels FOR SELECT
USING (type = 'public');

-- Create a policy for channel members
CREATE POLICY "Enable read access for channel members"
ON public.channels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.channel_members 
    WHERE channel_id = channels.id AND user_id = auth.uid()
  )
);

-- Create insert policy for authenticated users
CREATE POLICY "Enable insert for authenticated users"
ON public.channels FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  created_by = auth.uid()
);

-- Create update policy for channel creators
CREATE POLICY "Enable update for channel creators"
ON public.channels FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Also fix any potential issues with channel_members table
DROP POLICY IF EXISTS "Users can view channel memberships" ON public.channel_members;
DROP POLICY IF EXISTS "Users can manage their memberships" ON public.channel_members;

-- Simple policies for channel_members
CREATE POLICY "Enable read access for own memberships"
ON public.channel_members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Enable insert for authenticated users"
ON public.channel_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable RLS on channel_members
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
