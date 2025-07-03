
-- FINAL FIX: Complete policy cleanup and rebuild to eliminate infinite recursion
-- This will create the simplest possible policies without any circular references

-- 1. Drop ALL existing policies completely
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on channels table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'channels' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.channels', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on community_messages table  
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'community_messages' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.community_messages', policy_record.policyname);
    END LOOP;
    
    -- Drop all policies on channel_members table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'channel_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.channel_members', policy_record.policyname);
    END LOOP;
END $$;

-- 2. Create ultra-simple, non-recursive policies for channels
CREATE POLICY "channels_simple_select" 
ON public.channels FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "channels_simple_insert" 
ON public.channels FOR INSERT 
TO authenticated 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "channels_simple_update" 
ON public.channels FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid()) 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "channels_simple_delete" 
ON public.channels FOR DELETE 
TO authenticated 
USING (created_by = auth.uid());

-- 3. Create ultra-simple policies for community_messages
CREATE POLICY "messages_simple_select" 
ON public.community_messages FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "messages_simple_insert" 
ON public.community_messages FOR INSERT 
TO authenticated 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_simple_update" 
ON public.community_messages FOR UPDATE 
TO authenticated 
USING (sender_id = auth.uid()) 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_simple_delete" 
ON public.community_messages FOR DELETE 
TO authenticated 
USING (sender_id = auth.uid());

-- 4. Create ultra-simple policies for channel_members
CREATE POLICY "members_simple_select" 
ON public.channel_members FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "members_simple_insert" 
ON public.channel_members FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "members_simple_delete" 
ON public.channel_members FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- 5. Ensure all tables have RLS enabled
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- 6. Ensure proper realtime configuration
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;

-- 7. Ensure tables are in realtime publication
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
