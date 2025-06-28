
-- Phase 1: Database Foundation Fixes (Fixed Version)

-- First, let's fix the foreign key relationships and add proper constraints
ALTER TABLE public.community_messages 
DROP CONSTRAINT IF EXISTS community_messages_sender_id_fkey;

ALTER TABLE public.community_messages 
ADD CONSTRAINT community_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.community_messages 
DROP CONSTRAINT IF EXISTS community_messages_channel_id_fkey;

ALTER TABLE public.community_messages 
ADD CONSTRAINT community_messages_channel_id_fkey 
FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;

ALTER TABLE public.channel_members 
DROP CONSTRAINT IF EXISTS channel_members_channel_id_fkey;

ALTER TABLE public.channel_members 
ADD CONSTRAINT channel_members_channel_id_fkey 
FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;

ALTER TABLE public.channel_members 
DROP CONSTRAINT IF EXISTS channel_members_user_id_fkey;

ALTER TABLE public.channel_members 
ADD CONSTRAINT channel_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "Users can view channels" ON public.channels;
DROP POLICY IF EXISTS "Users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Users can update channels" ON public.channels;
DROP POLICY IF EXISTS "Users can delete channels" ON public.channels;
DROP POLICY IF EXISTS "Allow authenticated users to view public channels" ON public.channels;
DROP POLICY IF EXISTS "Allow authenticated users to create channels" ON public.channels;
DROP POLICY IF EXISTS "Allow channel creators to update their channels" ON public.channels;
DROP POLICY IF EXISTS "Allow channel creators to delete their channels" ON public.channels;
DROP POLICY IF EXISTS "Authenticated users can view public channels" ON public.channels;
DROP POLICY IF EXISTS "Authenticated users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Channel creators can update their channels" ON public.channels;
DROP POLICY IF EXISTS "Channel creators can delete their channels" ON public.channels;

DROP POLICY IF EXISTS "Users can view messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can update messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can delete messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can view messages in public channels" ON public.community_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.community_messages;

DROP POLICY IF EXISTS "Users can view channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON public.channel_members;
DROP POLICY IF EXISTS "Allow users to view channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Allow users to join channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can view channel memberships" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join public channels" ON public.channel_members;
DROP POLICY IF EXISTS "Users can leave channels" ON public.channel_members;

-- Create security definer functions
CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.is_channel_member(channel_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members 
    WHERE channel_id = channel_uuid AND user_id = user_uuid
  );
$$;

-- Create RLS policies for channels with unique names
CREATE POLICY "enable_read_public_channels"
ON public.channels FOR SELECT
TO authenticated
USING (type = 'public');

CREATE POLICY "enable_insert_channels"
ON public.channels FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  created_by = auth.uid() AND
  type = 'public'
);

CREATE POLICY "enable_update_own_channels"
ON public.channels FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "enable_delete_own_channels"
ON public.channels FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Create RLS policies for community_messages
CREATE POLICY "enable_read_public_messages"
ON public.community_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.channels 
    WHERE channels.id = community_messages.channel_id 
    AND channels.type = 'public'
  ) AND is_deleted = false
);

CREATE POLICY "enable_insert_messages"
ON public.community_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.channels 
    WHERE channels.id = community_messages.channel_id 
    AND channels.type = 'public'
  )
);

CREATE POLICY "enable_update_own_messages"
ON public.community_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "enable_delete_own_messages"
ON public.community_messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- Create RLS policies for channel_members
CREATE POLICY "enable_read_memberships"
ON public.channel_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "enable_join_public_channels"
ON public.channel_members FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.channels 
    WHERE channels.id = channel_members.channel_id 
    AND channels.type = 'public'
  )
);

CREATE POLICY "enable_leave_channels"
ON public.channel_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Enable RLS on all tables
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Configure tables for realtime
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$ 
BEGIN
  -- Add channels table to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'channels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
  END IF;
  
  -- Add community_messages table to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
  
  -- Add channel_members table to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'channel_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_members;
  END IF;
END $$;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_channels_type_name ON public.channels(type, name);
CREATE INDEX IF NOT EXISTS idx_channels_created_by ON public.channels(created_by);
CREATE INDEX IF NOT EXISTS idx_community_messages_channel_created ON public.community_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_sender ON public.community_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_not_deleted ON public.community_messages(channel_id, is_deleted, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_channel ON public.channel_members(user_id, channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON public.channel_members(channel_id);

-- Add unique constraints to prevent duplicates
ALTER TABLE public.channel_members 
DROP CONSTRAINT IF EXISTS unique_user_channel_membership;

ALTER TABLE public.channel_members 
ADD CONSTRAINT unique_user_channel_membership 
UNIQUE (user_id, channel_id);

-- Add check constraints
ALTER TABLE public.channels 
DROP CONSTRAINT IF EXISTS valid_channel_name;

ALTER TABLE public.channels 
ADD CONSTRAINT valid_channel_name 
CHECK (length(trim(name)) > 0 AND length(name) <= 50);

ALTER TABLE public.community_messages 
DROP CONSTRAINT IF EXISTS valid_message_content;

ALTER TABLE public.community_messages 
ADD CONSTRAINT valid_message_content 
CHECK (length(trim(content)) > 0 AND length(content) <= 2000);
