
-- Fix infinite recursion in channels RLS policies by completely dropping and recreating them
-- Drop ALL existing conflicting policies on channels table
DROP POLICY IF EXISTS "channels_public_select" ON public.channels;
DROP POLICY IF EXISTS "channels_authenticated_insert" ON public.channels;
DROP POLICY IF EXISTS "channels_owner_update" ON public.channels;
DROP POLICY IF EXISTS "channels_owner_delete" ON public.channels;
DROP POLICY IF EXISTS "enable_read_public_channels" ON public.channels;
DROP POLICY IF EXISTS "enable_insert_channels" ON public.channels;
DROP POLICY IF EXISTS "enable_update_own_channels" ON public.channels;
DROP POLICY IF EXISTS "enable_delete_own_channels" ON public.channels;

-- Create simple, non-recursive policies for channels
CREATE POLICY "channels_select_all_public" 
ON public.channels FOR SELECT 
TO authenticated 
USING (type = 'public');

CREATE POLICY "channels_insert_authenticated" 
ON public.channels FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "channels_update_creator" 
ON public.channels FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid()) 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "channels_delete_creator" 
ON public.channels FOR DELETE 
TO authenticated 
USING (created_by = auth.uid());

-- Clean up community_messages policies to avoid any circular references
DROP POLICY IF EXISTS "community_messages_public_select" ON public.community_messages;
DROP POLICY IF EXISTS "community_messages_authenticated_insert" ON public.community_messages;
DROP POLICY IF EXISTS "enable_read_public_messages" ON public.community_messages;
DROP POLICY IF EXISTS "enable_insert_messages" ON public.community_messages;
DROP POLICY IF EXISTS "enable_update_own_messages" ON public.community_messages;
DROP POLICY IF EXISTS "enable_delete_own_messages" ON public.community_messages;

-- Create simplified community_messages policies without circular references
CREATE POLICY "messages_select_non_deleted" 
ON public.community_messages FOR SELECT 
TO authenticated 
USING (is_deleted = false);

CREATE POLICY "messages_insert_authenticated" 
ON public.community_messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL AND sender_id = auth.uid());

CREATE POLICY "messages_update_own" 
ON public.community_messages FOR UPDATE 
TO authenticated 
USING (sender_id = auth.uid()) 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_delete_own" 
ON public.community_messages FOR DELETE 
TO authenticated 
USING (sender_id = auth.uid());

-- Ensure proper realtime replication for chat functionality
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already added
DO $$ 
BEGIN
  -- Add channels to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public'
    AND tablename = 'channels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
  END IF;
  
  -- Add community_messages to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public'
    AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
  
  -- Add channel_members to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public'
    AND tablename = 'channel_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_members;
  END IF;
END $$;

-- Create performance indexes for better chat performance
CREATE INDEX IF NOT EXISTS idx_channels_type_name_active 
ON public.channels(type, name) 
WHERE type = 'public';

CREATE INDEX IF NOT EXISTS idx_community_messages_channel_time_active 
ON public.community_messages(channel_id, created_at DESC) 
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_community_messages_sender_active 
ON public.community_messages(sender_id, created_at DESC) 
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_channel_members_channel_user 
ON public.channel_members(channel_id, user_id);
