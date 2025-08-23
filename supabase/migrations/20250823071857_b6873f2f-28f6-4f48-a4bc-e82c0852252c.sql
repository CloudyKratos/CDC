-- Fix security linter warnings by setting search_path on functions

-- Fix the search_messages function by setting search_path
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
SET search_path = ''
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

-- Fix the update_typing_status_updated_at function by setting search_path
CREATE OR REPLACE FUNCTION update_typing_status_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;