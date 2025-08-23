-- Create message_reactions table for emoji reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate reactions
CREATE UNIQUE INDEX IF NOT EXISTS message_reactions_unique 
ON message_reactions (message_id, user_id, emoji);

-- Enable RLS on message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reactions
CREATE POLICY "Users can add reactions" ON message_reactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions" ON message_reactions
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view reactions in accessible channels" ON message_reactions
FOR SELECT USING (
  message_id IN (
    SELECT cm.id FROM community_messages cm
    JOIN channels c ON c.id = cm.channel_id
    WHERE c.type = 'public' OR cm.channel_id IN (
      SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
    )
  )
);

-- Add parent_message_id for threading support to community_messages if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'community_messages' 
                 AND column_name = 'parent_message_id') THEN
    ALTER TABLE community_messages 
    ADD COLUMN parent_message_id UUID REFERENCES community_messages(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add thread_count to track replies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'community_messages' 
                 AND column_name = 'thread_count') THEN
    ALTER TABLE community_messages 
    ADD COLUMN thread_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Function to increment thread count
CREATE OR REPLACE FUNCTION public.increment_thread_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NEW.parent_message_id IS NOT NULL THEN
    UPDATE public.community_messages 
      SET thread_count = COALESCE(thread_count,0) + 1
    WHERE id = NEW.parent_message_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for incrementing thread count
DROP TRIGGER IF EXISTS increment_thread_count_trigger ON community_messages;
CREATE TRIGGER increment_thread_count_trigger
  AFTER INSERT ON community_messages
  FOR EACH ROW
  EXECUTE FUNCTION increment_thread_count();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_parent_id ON community_messages(parent_message_id);

-- Enable realtime for message_reactions
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;