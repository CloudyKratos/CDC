
-- Fix the infinite recursion in channels table policies
DROP POLICY IF EXISTS "channels_simple_select" ON channels;
DROP POLICY IF EXISTS "allow_all_channels" ON channels;

-- Create a proper channels policy without recursion
CREATE POLICY "users_can_view_public_channels" 
ON channels FOR SELECT 
USING (
  type = 'public' OR 
  created_by = auth.uid()
);

-- Create a secure insert policy for channels
CREATE POLICY "authenticated_users_can_create_channels" 
ON channels FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  created_by = auth.uid()
);

-- Create update policy for channel creators
CREATE POLICY "creators_can_update_channels" 
ON channels FOR UPDATE 
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Create delete policy for channel creators
CREATE POLICY "creators_can_delete_channels" 
ON channels FOR DELETE 
USING (created_by = auth.uid());

-- Fix community_messages policies to be more secure and performant
DROP POLICY IF EXISTS "allow_all_messages" ON community_messages;
DROP POLICY IF EXISTS "messages_simple_select" ON community_messages;

-- Create secure message viewing policy
CREATE POLICY "users_can_view_messages_in_accessible_channels" 
ON community_messages FOR SELECT 
USING (
  NOT is_deleted AND 
  channel_id IN (
    SELECT id FROM channels 
    WHERE type = 'public' OR created_by = auth.uid()
  )
);

-- Create secure message creation policy
CREATE POLICY "authenticated_users_can_create_messages" 
ON community_messages FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  sender_id = auth.uid()
);

-- Create message update policy (for editing own messages)
CREATE POLICY "users_can_update_own_messages" 
ON community_messages FOR UPDATE 
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Create message deletion policy (soft delete own messages)
CREATE POLICY "users_can_delete_own_messages" 
ON community_messages FOR UPDATE 
USING (sender_id = auth.uid() AND NOT is_deleted)
WITH CHECK (sender_id = auth.uid() AND is_deleted = true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_messages_channel_created 
ON community_messages(channel_id, created_at DESC) 
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_community_messages_sender 
ON community_messages(sender_id) 
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_channels_type_created 
ON channels(type, created_at DESC);

-- Ensure proper realtime setup for the tables
ALTER TABLE community_messages REPLICA IDENTITY FULL;
ALTER TABLE channels REPLICA IDENTITY FULL;

-- Add the tables to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'channels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE channels;
  END IF;
END $$;
