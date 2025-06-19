
-- Fix community_messages RLS policies and add proper foreign key constraints
-- First, ensure we have proper foreign key relationships

-- Add missing foreign key for community_messages if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'community_messages_sender_id_fkey'
  ) THEN
    ALTER TABLE public.community_messages 
    ADD CONSTRAINT community_messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing problematic policies for community_messages
DROP POLICY IF EXISTS "Users can view community messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can insert community messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.community_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.community_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.community_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.community_messages;

-- Create simple, non-recursive policies for community_messages
CREATE POLICY "Enable read access for all authenticated users"
ON public.community_messages FOR SELECT
TO authenticated
USING (NOT is_deleted);

CREATE POLICY "Enable insert for authenticated users"
ON public.community_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  sender_id = auth.uid() AND
  NOT is_deleted
);

CREATE POLICY "Enable update for message authors"
ON public.community_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_messages_channel_id ON public.community_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_sender_id ON public.community_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON public.community_messages(created_at);

-- Enable realtime for community_messages
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
