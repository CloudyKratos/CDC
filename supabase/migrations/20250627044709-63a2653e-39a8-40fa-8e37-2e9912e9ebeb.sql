
-- Fix infinite recursion in channels RLS policies by simplifying them
DROP POLICY IF EXISTS "Users can view channels" ON public.channels;
DROP POLICY IF EXISTS "Users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Users can update channels" ON public.channels;
DROP POLICY IF EXISTS "Users can delete channels" ON public.channels;

-- Create simple, non-recursive policies for channels
CREATE POLICY "Allow authenticated users to view public channels"
ON public.channels FOR SELECT
TO authenticated
USING (type = 'public');

CREATE POLICY "Allow authenticated users to create channels"
ON public.channels FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  created_by = auth.uid()
);

CREATE POLICY "Allow channel creators to update their channels"
ON public.channels FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Allow channel creators to delete their channels"
ON public.channels FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Ensure proper indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channels_type_name ON public.channels(type, name);
CREATE INDEX IF NOT EXISTS idx_channels_created_by ON public.channels(created_by);

-- Ensure realtime is properly configured for chat functionality
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already added
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

-- Create better indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_messages_channel_created ON public.community_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_sender ON public.community_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_channel ON public.channel_members(user_id, channel_id);
