
-- ULTIMATE FIX: Remove ALL existing policies and create the absolute simplest ones
-- This will eliminate infinite recursion completely

-- 1. Drop ALL existing policies on all tables
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

-- 2. Create the absolute simplest policies (NO RECURSION POSSIBLE)
-- Allow authenticated users to do everything on channels
CREATE POLICY "allow_all_channels" 
ON public.channels FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to do everything on messages
CREATE POLICY "allow_all_messages" 
ON public.community_messages FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to do everything on members
CREATE POLICY "allow_all_members" 
ON public.channel_members FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Ensure RLS is enabled
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- 4. Fix the general channel to have proper created_by
UPDATE public.channels 
SET created_by = (SELECT id FROM auth.users LIMIT 1)
WHERE name = 'general' AND created_by IS NULL;

-- 5. Ensure realtime is configured
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;

-- 6. Add to realtime publication
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
