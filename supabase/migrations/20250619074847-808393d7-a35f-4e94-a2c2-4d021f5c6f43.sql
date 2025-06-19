
-- Drop all existing policies that are causing infinite recursion
DROP POLICY IF EXISTS "Users can view members of accessible channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join public channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can leave channels" ON public.channel_members;

-- Drop and recreate the security definer functions to ensure they're working correctly
DROP FUNCTION IF EXISTS public.user_can_access_channel_safe(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_public_channel_safe(uuid) CASCADE;

-- Create improved security definer functions that don't cause recursion
CREATE OR REPLACE FUNCTION public.user_can_access_channel_safe(channel_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channels c 
    WHERE c.id = channel_id_param 
    AND c.type = 'public'
  ) OR EXISTS (
    SELECT 1 FROM public.channel_members cm 
    WHERE cm.channel_id = channel_id_param 
    AND cm.user_id = user_id_param
  );
$$;

CREATE OR REPLACE FUNCTION public.is_public_channel_safe(channel_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channels 
    WHERE id = channel_id_param AND type = 'public'
  );
$$;

-- Create simple, non-recursive policies for channel_members
CREATE POLICY "Users can view public channel members" 
  ON public.channel_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.channels 
      WHERE id = channel_id AND type = 'public'
    )
  );

CREATE POLICY "Users can join public channels" 
  ON public.channel_members 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.channels 
      WHERE id = channel_id AND type = 'public'
    )
  );

CREATE POLICY "Users can leave channels they joined" 
  ON public.channel_members 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Also fix community_messages policies to avoid recursion
DROP POLICY IF EXISTS "Users can view messages in accessible channels" ON public.community_messages;
DROP POLICY IF EXISTS "Users can send messages to accessible channels" ON public.community_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.community_messages;

CREATE POLICY "Users can view messages in public channels" 
  ON public.community_messages 
  FOR SELECT 
  USING (
    is_deleted = false 
    AND EXISTS (
      SELECT 1 FROM public.channels 
      WHERE id = channel_id AND type = 'public'
    )
  );

CREATE POLICY "Users can send messages to public channels" 
  ON public.community_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
      SELECT 1 FROM public.channels 
      WHERE id = channel_id AND type = 'public'
    )
  );

CREATE POLICY "Users can update their own messages" 
  ON public.community_messages 
  FOR UPDATE 
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" 
  ON public.community_messages 
  FOR DELETE 
  USING (auth.uid() = sender_id);
