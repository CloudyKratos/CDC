
-- Fix infinite recursion in workspace_members policies
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
CREATE POLICY "Users can view workspace members" 
  ON workspace_members 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Fix infinite recursion in channels policies
DROP POLICY IF EXISTS "channels_simple_select" ON channels;
CREATE POLICY "channels_simple_select" 
  ON channels 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Ensure channel_members policies are working correctly
DROP POLICY IF EXISTS "members_simple_select" ON channel_members;
CREATE POLICY "members_simple_select" 
  ON channel_members 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Add missing UPDATE policy for channel_members if needed
DROP POLICY IF EXISTS "members_simple_update" ON channel_members;
CREATE POLICY "members_simple_update" 
  ON channel_members 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
