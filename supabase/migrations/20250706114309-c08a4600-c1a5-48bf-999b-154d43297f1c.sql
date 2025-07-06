
-- Fix the foreign key constraint for community_messages to profiles
ALTER TABLE community_messages 
DROP CONSTRAINT IF EXISTS community_messages_sender_id_fkey;

ALTER TABLE community_messages 
ADD CONSTRAINT community_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix infinite recursion in channels RLS policies by replacing them with simpler ones
DROP POLICY IF EXISTS "allow_all_channels" ON channels;

CREATE POLICY "Users can view all channels" 
ON channels FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create channels" 
ON channels FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creators can update their channels" 
ON channels FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Channel creators can delete their channels" 
ON channels FOR DELETE 
USING (auth.uid() = created_by);

-- Ensure general channel exists for immediate use
INSERT INTO channels (id, name, type, created_by) 
VALUES ('general-channel', 'general', 'public', (SELECT id FROM profiles LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Fix community_messages RLS policies to prevent recursion
DROP POLICY IF EXISTS "allow_all_messages" ON community_messages;

CREATE POLICY "Users can view messages in accessible channels" 
ON community_messages FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create messages" 
ON community_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Message senders can update their messages" 
ON community_messages FOR UPDATE 
USING (auth.uid() = sender_id);

CREATE POLICY "Message senders can delete their messages" 
ON community_messages FOR DELETE 
USING (auth.uid() = sender_id);

-- Enable realtime for community_messages
ALTER TABLE community_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;
