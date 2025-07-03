
-- COMPREHENSIVE FIX: Remove ALL existing policies and recreate clean ones
-- This will eliminate the infinite recursion issues completely

-- 1. Drop ALL existing policies on channels table
DROP POLICY IF EXISTS "channels_public_select" ON public.channels;
DROP POLICY IF EXISTS "channels_authenticated_insert" ON public.channels;
DROP POLICY IF EXISTS "channels_owner_update" ON public.channels;
DROP POLICY IF EXISTS "channels_owner_delete" ON public.channels;
DROP POLICY IF EXISTS "enable_read_public_channels" ON public.channels;
DROP POLICY IF EXISTS "enable_insert_channels" ON public.channels;
DROP POLICY IF EXISTS "enable_update_own_channels" ON public.channels;
DROP POLICY IF EXISTS "enable_delete_own_channels" ON public.channels;
DROP POLICY IF EXISTS "channels_select_all_public" ON public.channels;
DROP POLICY IF EXISTS "channels_insert_authenticated" ON public.channels;
DROP POLICY IF EXISTS "channels_update_creator" ON public.channels;
DROP POLICY IF EXISTS "channels_delete_creator" ON public.channels;

-- 2. Drop ALL existing policies on community_messages table
DROP POLICY IF EXISTS "community_messages_public_select" ON public.community_messages;
DROP POLICY IF EXISTS "community_messages_authenticated_insert" ON public.community_messages;
DROP POLICY IF EXISTS "enable_read_public_messages" ON public.community_messages;
DROP POLICY IF EXISTS "enable_insert_messages" ON public.community_messages;
DROP POLICY IF EXISTS "enable_update_own_messages" ON public.community_messages;
DROP POLICY IF EXISTS "enable_delete_own_messages" ON public.community_messages;
DROP POLICY IF EXISTS "messages_select_non_deleted" ON public.community_messages;
DROP POLICY IF EXISTS "messages_insert_authenticated" ON public.community_messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.community_messages;
DROP POLICY IF EXISTS "messages_delete_own" ON public.community_messages;
DROP POLICY IF EXISTS "Anyone can view community messages" ON public.community_messages;
DROP POLICY IF EXISTS "Authenticated users can send community messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can update their own community messages" ON public.community_messages;

-- 3. Drop ALL existing policies on channel_members table
DROP POLICY IF EXISTS "channel_members_public_select" ON public.channel_members;
DROP POLICY IF EXISTS "channel_members_authenticated_insert" ON public.channel_members;
DROP POLICY IF EXISTS "enable_read_memberships" ON public.channel_members;
DROP POLICY IF EXISTS "enable_join_channels" ON public.channel_members;
DROP POLICY IF EXISTS "enable_leave_channels" ON public.channel_members;
DROP POLICY IF EXISTS "enable_join_public_channels" ON public.channel_members;
DROP POLICY IF EXISTS "Anyone can view channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Authenticated users can join channels" ON public.channel_members;

-- 4. Create simple, clean policies for channels (NO RECURSION)
CREATE POLICY "allow_select_public_channels" 
ON public.channels FOR SELECT 
TO authenticated 
USING (type = 'public');

CREATE POLICY "allow_insert_own_channels" 
ON public.channels FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "allow_update_own_channels" 
ON public.channels FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "allow_delete_own_channels" 
ON public.channels FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);

-- 5. Create simple, clean policies for community_messages (NO RECURSION)
CREATE POLICY "allow_select_active_messages" 
ON public.community_messages FOR SELECT 
TO authenticated 
USING (is_deleted = false);

CREATE POLICY "allow_insert_own_messages" 
ON public.community_messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "allow_update_own_messages" 
ON public.community_messages FOR UPDATE 
TO authenticated 
USING (auth.uid() = sender_id);

CREATE POLICY "allow_delete_own_messages" 
ON public.community_messages FOR DELETE 
TO authenticated 
USING (auth.uid() = sender_id);

-- 6. Create simple, clean policies for channel_members (NO RECURSION)
CREATE POLICY "allow_select_all_members" 
ON public.channel_members FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "allow_insert_own_membership" 
ON public.channel_members FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_membership" 
ON public.channel_members FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 7. Ensure realtime is properly configured
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;

-- 8. Add tables to realtime publication
DO $$ 
BEGIN
  -- Channels
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public'
    AND tablename = 'channels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
  END IF;
  
  -- Messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public'
    AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
  
  -- Members
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public'
    AND tablename = 'channel_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_members;
  END IF;
END $$;

-- 9. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_channels_public_name 
ON public.channels(name) 
WHERE type = 'public';

CREATE INDEX IF NOT EXISTS idx_messages_channel_created 
ON public.community_messages(channel_id, created_at DESC) 
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_messages_sender_created 
ON public.community_messages(sender_id, created_at DESC) 
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_members_channel_user 
ON public.channel_members(channel_id, user_id);
