
-- Fix the infinite recursion in channel_members policies
-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Users can view channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join public channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can leave channels they joined" ON public.channel_members;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.user_can_access_channel_safe(channel_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channels c 
    WHERE c.id = channel_id_param 
    AND (
      c.type = 'public' 
      OR EXISTS (
        SELECT 1 FROM public.channel_members cm 
        WHERE cm.channel_id = c.id AND cm.user_id = user_id_param
      )
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_public_channel_safe(channel_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT type = 'public' FROM public.channels WHERE id = channel_id_param;
$$;

-- Create new safe policies using the security definer functions
CREATE POLICY "Users can view members of channels they can access" 
  ON public.channel_members 
  FOR SELECT 
  USING (user_can_access_channel_safe(channel_id, auth.uid()));

CREATE POLICY "Users can join public channels" 
  ON public.channel_members 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND is_public_channel_safe(channel_id)
  );

CREATE POLICY "Users can leave channels they joined" 
  ON public.channel_members 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Also ensure community_messages policies are safe
DROP POLICY IF EXISTS "Users can view messages in accessible channels" ON public.community_messages;
DROP POLICY IF EXISTS "Users can send messages to accessible channels" ON public.community_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.community_messages;

CREATE POLICY "Users can view messages in accessible channels" 
  ON public.community_messages 
  FOR SELECT 
  USING (
    is_deleted = false 
    AND user_can_access_channel_safe(channel_id, auth.uid())
  );

CREATE POLICY "Users can send messages to accessible channels" 
  ON public.community_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id 
    AND user_can_access_channel_safe(channel_id, auth.uid())
  );

CREATE POLICY "Users can delete their own messages" 
  ON public.community_messages 
  FOR UPDATE 
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id AND is_deleted = true);
