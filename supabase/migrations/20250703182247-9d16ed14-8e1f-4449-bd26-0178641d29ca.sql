
-- Fix the infinite recursion in channels table policies
DROP POLICY IF EXISTS "channels_simple_select" ON channels;
CREATE POLICY "channels_simple_select" 
ON channels FOR SELECT 
USING (
  type = 'public' OR 
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM channel_members 
    WHERE channel_id = channels.id AND user_id = auth.uid()
  )
);

-- Fix the workspace_members policies to avoid recursion
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
CREATE POLICY "Users can view workspace members" 
ON workspace_members FOR SELECT 
USING (
  user_id = auth.uid() OR
  workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  )
);

-- Ensure community_messages policies are simple and don't cause recursion
DROP POLICY IF EXISTS "messages_simple_select" ON community_messages;
CREATE POLICY "messages_simple_select" 
ON community_messages FOR SELECT 
USING (
  NOT is_deleted AND 
  channel_id IN (
    SELECT id FROM channels WHERE type = 'public'
  )
);

-- Enable realtime for community_messages table
ALTER TABLE community_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;

-- Enable realtime for channels table
ALTER TABLE channels REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE channels;
