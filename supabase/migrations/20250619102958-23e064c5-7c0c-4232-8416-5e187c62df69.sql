
-- Fix RLS policies for community_messages to prevent infinite recursion
-- and ensure proper message retrieval and real-time functionality

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.community_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.community_messages;
DROP POLICY IF EXISTS "Enable update for message authors" ON public.community_messages;
DROP POLICY IF EXISTS "Users can view community messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can insert community messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.community_messages;

-- Create simple, non-recursive policies for community_messages
CREATE POLICY "Allow authenticated users to read messages"
ON public.community_messages FOR SELECT
TO authenticated
USING (NOT is_deleted);

CREATE POLICY "Allow authenticated users to insert messages"
ON public.community_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  sender_id = auth.uid()
);

CREATE POLICY "Allow users to update their own messages"
ON public.community_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid() AND NOT is_deleted)
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Allow users to soft delete their own messages"
ON public.community_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid() AND is_deleted = true);

-- Ensure RLS is enabled
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for community_messages
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;

-- Add table to realtime publication if not already added
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_messages_channel_created ON public.community_messages(channel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_community_messages_sender ON public.community_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_not_deleted ON public.community_messages(channel_id) WHERE NOT is_deleted;
