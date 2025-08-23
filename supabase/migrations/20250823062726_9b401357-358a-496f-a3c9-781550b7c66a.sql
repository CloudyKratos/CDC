-- Add missing columns to community_messages
ALTER TABLE community_messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE community_messages 
ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT false;

ALTER TABLE community_messages 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Update RLS policies for message deletion by admins/moderators
CREATE POLICY "Admins and moderators can delete any messages" 
ON community_messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- Policy for message editing 
CREATE POLICY "Users can edit own messages" 
ON community_messages
FOR UPDATE USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Update the view policy to show sender info properly
DROP POLICY IF EXISTS "Anyone can view non-deleted community messages" ON community_messages;

CREATE POLICY "Users can view non-deleted messages in accessible channels" 
ON community_messages
FOR SELECT USING (
  (is_deleted = false OR is_deleted IS NULL) AND
  (channel_id IN (
    SELECT cm.channel_id
    FROM channel_members cm
    WHERE cm.user_id = auth.uid()
  ) OR channel_id IN (
    SELECT channels.id
    FROM channels
    WHERE channels.type = 'public'
  ))
);