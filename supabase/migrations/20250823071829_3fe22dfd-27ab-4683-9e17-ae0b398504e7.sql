-- Fix foreign key relationships and improve RLS policies for better chat functionality (with existence checks)

-- Add foreign key constraint for message_reactions to profiles (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'message_reactions_user_id_fkey' 
        AND table_name = 'message_reactions'
    ) THEN
        ALTER TABLE public.message_reactions 
        ADD CONSTRAINT message_reactions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Improve profiles RLS policy for better chat functionality
DROP POLICY IF EXISTS "Users can view public profiles for chat" ON public.profiles;
CREATE POLICY "Users can view public profiles for chat" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Add indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_channel_created ON public.community_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_sender ON public.community_messages(sender_id);

-- Add typing status table for real-time typing indicators
CREATE TABLE IF NOT EXISTS public.typing_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    is_typing BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(channel_id, user_id)
);

-- Enable RLS on typing_status
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for typing_status
DROP POLICY IF EXISTS "Users can insert their own typing status" ON public.typing_status;
CREATE POLICY "Users can insert their own typing status" 
ON public.typing_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own typing status" ON public.typing_status;
CREATE POLICY "Users can update their own typing status" 
ON public.typing_status 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own typing status" ON public.typing_status;
CREATE POLICY "Users can delete their own typing status" 
ON public.typing_status 
FOR DELETE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view typing status in accessible channels" ON public.typing_status;
CREATE POLICY "Users can view typing status in accessible channels" 
ON public.typing_status 
FOR SELECT 
USING (
    channel_id IN (
        SELECT c.id FROM public.channels c 
        WHERE c.type = 'public' 
        OR c.id IN (
            SELECT cm.channel_id FROM public.channel_members cm 
            WHERE cm.user_id = auth.uid()
        )
    )
);

-- Add trigger to auto-update typing_status updated_at
CREATE OR REPLACE FUNCTION update_typing_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS typing_status_updated_at ON public.typing_status;
CREATE TRIGGER typing_status_updated_at
    BEFORE UPDATE ON public.typing_status
    FOR EACH ROW
    EXECUTE FUNCTION update_typing_status_updated_at();

-- Add message search functionality
CREATE INDEX IF NOT EXISTS idx_community_messages_content_search 
ON public.community_messages USING gin(to_tsvector('english', content));

-- Add function for better message search
CREATE OR REPLACE FUNCTION search_messages(
    search_term TEXT,
    channel_uuid UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    created_at TIMESTAMPTZ,
    sender_id UUID,
    channel_id UUID,
    rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.id,
        cm.content,
        cm.created_at,
        cm.sender_id,
        cm.channel_id,
        ts_rank(to_tsvector('english', cm.content), plainto_tsquery('english', search_term)) as rank
    FROM public.community_messages cm
    WHERE 
        (channel_uuid IS NULL OR cm.channel_id = channel_uuid)
        AND cm.is_deleted = false
        AND to_tsvector('english', cm.content) @@ plainto_tsquery('english', search_term)
        AND (
            cm.channel_id IN (
                SELECT c.id FROM public.channels c WHERE c.type = 'public'
            )
            OR cm.channel_id IN (
                SELECT member_cm.channel_id FROM public.channel_members member_cm 
                WHERE member_cm.user_id = auth.uid()
            )
        )
    ORDER BY rank DESC, cm.created_at DESC
    LIMIT limit_count;
END;
$$;