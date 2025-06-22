
-- Enable realtime for existing tables (skip if already enabled)
DO $$
BEGIN
    ALTER TABLE public.channels REPLICA IDENTITY FULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.channel_members REPLICA IDENTITY FULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create message threads table for threaded replies
CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  reply_message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_message_id, reply_message_id)
);

-- Create message mentions table
CREATE TABLE IF NOT EXISTS public.message_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  UNIQUE(message_id, mentioned_user_id)
);

-- Create pinned messages table
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL,
  pinned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(channel_id, message_id)
);

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 seconds'),
  UNIQUE(channel_id, user_id)
);

-- Add message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Add message attachments to community_messages (skip if already exists)
DO $$
BEGIN
    ALTER TABLE public.community_messages 
    ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN reply_to_id UUID REFERENCES public.community_messages(id),
    ADD COLUMN is_announcement BOOLEAN DEFAULT false,
    ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system'));
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add more fields to channels (skip if already exists)
DO $$
BEGIN
    ALTER TABLE public.channels 
    ADD COLUMN is_private BOOLEAN DEFAULT false,
    ADD COLUMN required_role TEXT,
    ADD COLUMN is_locked BOOLEAN DEFAULT false,
    ADD COLUMN slow_mode_seconds INTEGER DEFAULT 0;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id_param UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = user_id_param LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.can_access_channel_safe(channel_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channels c 
    WHERE c.id = channel_id_param 
    AND (
      (c.type = 'public' AND c.is_private = false)
      OR EXISTS (
        SELECT 1 FROM public.channel_members cm 
        WHERE cm.channel_id = c.id AND cm.user_id = user_id_param
      )
      OR (c.required_role IS NOT NULL AND public.get_user_role_safe(user_id_param) = c.required_role)
    )
  );
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view accessible channels" ON public.channels;
DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Channel creators and admins can update channels" ON public.channels;
DROP POLICY IF EXISTS "Users can view messages in accessible channels" ON public.community_messages;
DROP POLICY IF EXISTS "Users can send messages to accessible channels" ON public.community_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can view channel members for accessible channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join public channels" ON public.channel_members;

-- RLS Policies for channels
CREATE POLICY "Users can view accessible channels" ON public.channels
  FOR SELECT USING (
    public.can_access_channel_safe(id, auth.uid())
  );

CREATE POLICY "Authenticated users can create channels" ON public.channels
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND created_by = auth.uid()
  );

CREATE POLICY "Channel creators and admins can update channels" ON public.channels
  FOR UPDATE USING (
    created_by = auth.uid() OR public.get_user_role_safe(auth.uid()) = 'admin'
  );

-- RLS Policies for community_messages
CREATE POLICY "Users can view messages in accessible channels" ON public.community_messages
  FOR SELECT USING (
    public.can_access_channel_safe(channel_id, auth.uid())
  );

CREATE POLICY "Users can send messages to accessible channels" ON public.community_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND sender_id = auth.uid() 
    AND public.can_access_channel_safe(channel_id, auth.uid())
  );

CREATE POLICY "Users can update their own messages" ON public.community_messages
  FOR UPDATE USING (
    sender_id = auth.uid() AND auth.uid() IS NOT NULL
  );

-- RLS Policies for channel_members
CREATE POLICY "Users can view channel members for accessible channels" ON public.channel_members
  FOR SELECT USING (
    public.can_access_channel_safe(channel_id, auth.uid())
  );

CREATE POLICY "Users can join public channels" ON public.channel_members
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND public.can_access_channel_safe(channel_id, auth.uid())
  );

-- RLS Policies for message_threads
CREATE POLICY "Users can view threads in accessible channels" ON public.message_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_messages cm 
      WHERE cm.id = parent_message_id 
      AND public.can_access_channel_safe(cm.channel_id, auth.uid())
    )
  );

CREATE POLICY "Users can create thread replies" ON public.message_threads
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.community_messages cm 
      WHERE cm.id = reply_message_id 
      AND cm.sender_id = auth.uid()
    )
  );

-- RLS Policies for message_mentions
CREATE POLICY "Users can view their mentions" ON public.message_mentions
  FOR SELECT USING (
    mentioned_user_id = auth.uid()
  );

CREATE POLICY "Users can create mentions when sending messages" ON public.message_mentions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.community_messages cm 
      WHERE cm.id = message_id 
      AND cm.sender_id = auth.uid()
    )
  );

-- RLS Policies for pinned_messages
CREATE POLICY "Users can view pinned messages in accessible channels" ON public.pinned_messages
  FOR SELECT USING (
    public.can_access_channel_safe(channel_id, auth.uid())
  );

CREATE POLICY "Admins can pin messages" ON public.pinned_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND pinned_by = auth.uid()
    AND public.get_user_role_safe(auth.uid()) IN ('admin', 'moderator')
  );

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing in accessible channels" ON public.typing_indicators
  FOR SELECT USING (
    public.can_access_channel_safe(channel_id, auth.uid())
  );

CREATE POLICY "Users can set their typing status" ON public.typing_indicators
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND public.can_access_channel_safe(channel_id, auth.uid())
  );

CREATE POLICY "Users can update their typing status" ON public.typing_indicators
  FOR UPDATE USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete their typing status" ON public.typing_indicators
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions in accessible channels" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_messages cm 
      WHERE cm.id = message_id 
      AND public.can_access_channel_safe(cm.channel_id, auth.uid())
    )
  );

CREATE POLICY "Users can add reactions" ON public.message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can remove their reactions" ON public.message_reactions
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Enable realtime for new tables
ALTER TABLE public.message_threads REPLICA IDENTITY FULL;
ALTER TABLE public.message_mentions REPLICA IDENTITY FULL;
ALTER TABLE public.pinned_messages REPLICA IDENTITY FULL;
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_mentions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pinned_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- Function to clean up expired typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_expired_typing()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.typing_indicators WHERE expires_at < now();
$$;
