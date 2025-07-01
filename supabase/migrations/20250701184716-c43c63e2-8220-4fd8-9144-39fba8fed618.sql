
-- STEP 1: Database Policy and Structure Cleanup
-- Fix infinite recursion in RLS policies by cleaning up conflicting policies

-- Drop all existing conflicting policies on channels table
DROP POLICY IF EXISTS "Anyone can view channels" ON public.channels;
DROP POLICY IF EXISTS "channels_select_policy" ON public.channels;
DROP POLICY IF EXISTS "channels_insert_policy" ON public.channels;
DROP POLICY IF EXISTS "channels_update_policy" ON public.channels;
DROP POLICY IF EXISTS "channels_delete_policy" ON public.channels;

-- Create clean, non-conflicting policies for channels
CREATE POLICY "channels_public_select" 
ON public.channels FOR SELECT 
TO authenticated 
USING (type = 'public');

CREATE POLICY "channels_authenticated_insert" 
ON public.channels FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "channels_owner_update" 
ON public.channels FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid()) 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "channels_owner_delete" 
ON public.channels FOR DELETE 
TO authenticated 
USING (created_by = auth.uid());

-- Clean up community_messages policies to avoid circular references
DROP POLICY IF EXISTS "enable_read_public_messages" ON public.community_messages;
DROP POLICY IF EXISTS "enable_insert_messages" ON public.community_messages;

-- Create simplified community_messages policies without circular references
CREATE POLICY "community_messages_public_select" 
ON public.community_messages FOR SELECT 
TO authenticated 
USING (is_deleted = false);

CREATE POLICY "community_messages_authenticated_insert" 
ON public.community_messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL AND sender_id = auth.uid());

-- Add performance indexes for real-time chat
CREATE INDEX IF NOT EXISTS idx_community_messages_channel_time 
ON public.community_messages(channel_id, created_at DESC) 
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_community_messages_sender_time 
ON public.community_messages(sender_id, created_at DESC) 
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_channels_type_name_unique 
ON public.channels(type, name) 
WHERE type = 'public';

-- Ensure proper realtime replication for chat functionality
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;

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
END $$;
