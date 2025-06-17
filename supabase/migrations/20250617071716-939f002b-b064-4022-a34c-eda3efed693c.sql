
-- Drop all existing policies that might reference the functions
DROP POLICY IF EXISTS "Users can view members of accessible channels" ON public.channel_members CASCADE;
DROP POLICY IF EXISTS "Users can view members of channels they can access" ON public.channel_members CASCADE;
DROP POLICY IF EXISTS "Users can join public channels" ON public.channel_members CASCADE;
DROP POLICY IF EXISTS "Users can leave channels they joined" ON public.channel_members CASCADE;
DROP POLICY IF EXISTS "Users can leave channels" ON public.channel_members CASCADE;
DROP POLICY IF EXISTS "Users can view messages in accessible channels" ON public.community_messages CASCADE;
DROP POLICY IF EXISTS "Users can send messages to accessible channels" ON public.community_messages CASCADE;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.community_messages CASCADE;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.community_messages CASCADE;

-- Now drop the functions with CASCADE to remove any remaining dependencies
DROP FUNCTION IF EXISTS public.user_can_access_channel_safe(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_public_channel_safe(uuid) CASCADE;

-- Create improved security definer functions that don't cause recursion
CREATE OR REPLACE FUNCTION public.is_public_channel_safe(channel_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT type = 'public' FROM public.channels WHERE id = channel_id_param;
$$;

-- Create simple, non-recursive policies for channel_members
CREATE POLICY "Users can view channel members for public channels" 
  ON public.channel_members 
  FOR SELECT 
  USING (is_public_channel_safe(channel_id));

CREATE POLICY "Users can join public channels" 
  ON public.channel_members 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND is_public_channel_safe(channel_id)
  );

CREATE POLICY "Users can leave channels" 
  ON public.channel_members 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create simple policies for community_messages that avoid recursion
CREATE POLICY "Users can view messages in public channels" 
  ON public.community_messages 
  FOR SELECT 
  USING (
    is_deleted = false 
    AND is_public_channel_safe(channel_id)
  );

CREATE POLICY "Users can send messages to public channels" 
  ON public.community_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id 
    AND is_public_channel_safe(channel_id)
  );

CREATE POLICY "Users can update their own messages" 
  ON public.community_messages 
  FOR UPDATE 
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Enable RLS on both tables if not already enabled
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
