
-- Fix infinite recursion in channels RLS policies
DROP POLICY IF EXISTS "Users can view channels" ON public.channels;
DROP POLICY IF EXISTS "Users can create channels" ON public.channels;
DROP POLICY IF EXISTS "Users can update channels" ON public.channels;

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

-- Ensure proper foreign key relationships exist
ALTER TABLE public.community_messages 
DROP CONSTRAINT IF EXISTS community_messages_sender_id_fkey;

ALTER TABLE public.community_messages 
ADD CONSTRAINT community_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure RLS is enabled on all tables
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Fix channel_members policies
DROP POLICY IF EXISTS "Users can view channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON public.channel_members;

CREATE POLICY "Allow users to view channel members"
ON public.channel_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow users to join channels"
ON public.channel_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Enable realtime for all chat tables
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$ 
BEGIN
  -- Add channels table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'channels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
  END IF;
  
  -- Add community_messages table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
  
  -- Add channel_members table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'channel_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_members;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channels_type_name ON public.channels(type, name);
CREATE INDEX IF NOT EXISTS idx_community_messages_channel_created ON public.community_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_sender ON public.community_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_channel ON public.channel_members(user_id, channel_id);
