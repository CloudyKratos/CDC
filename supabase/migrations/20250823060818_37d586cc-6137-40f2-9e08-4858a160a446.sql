-- Fix migration: avoid nested $$ in DO blocks and use EXECUTE with single-quoted strings

-- 1) Enable required extensions safely
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2) Decrement thread count when a reply is deleted
CREATE OR REPLACE FUNCTION public.decrement_thread_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF OLD.parent_message_id IS NOT NULL THEN
    UPDATE public.community_messages 
      SET thread_count = GREATEST(COALESCE(thread_count,0) - 1, 0)
    WHERE id = OLD.parent_message_id;
  END IF;
  RETURN OLD;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='community_messages' AND column_name='parent_message_id'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t 
      JOIN pg_class c ON c.oid=t.tgrelid
      WHERE c.relname='community_messages' AND t.tgname='decrement_message_thread_count'
    ) THEN
      EXECUTE 'CREATE TRIGGER decrement_message_thread_count AFTER DELETE ON public.community_messages FOR EACH ROW EXECUTE FUNCTION public.decrement_thread_count()';
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Skipping decrement trigger creation: %', SQLERRM;
END$$;

-- 3) Performance indexes (conditional for parent_message_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='community_messages' AND column_name='parent_message_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON public.community_messages(parent_message_id)';
  END IF;
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.community_messages(channel_id)';
END$$;

-- 4) Read receipts sync (only if both tables exist)
CREATE OR REPLACE FUNCTION public.sync_channel_read_position()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.channel_read_positions (channel_id, user_id, last_read_message_id, last_read_at)
  VALUES (NEW.channel_id, NEW.user_id, NEW.message_id, NEW.read_at)
  ON CONFLICT (channel_id, user_id)
  DO UPDATE SET last_read_message_id = EXCLUDED.last_read_message_id,
                last_read_at = EXCLUDED.last_read_at;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.message_read_status') IS NOT NULL 
     AND to_regclass('public.channel_read_positions') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t 
      JOIN pg_class c ON c.oid=t.tgrelid
      WHERE c.relname='message_read_status' AND t.tgname='sync_read_position'
    ) THEN
      EXECUTE 'CREATE TRIGGER sync_read_position AFTER INSERT ON public.message_read_status FOR EACH ROW EXECUTE FUNCTION public.sync_channel_read_position()';
    END IF;
  END IF;
END$$;

-- 5) Typing status cleanup function (defensive if table/columns not present)
CREATE OR REPLACE FUNCTION public.cleanup_expired_typing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF to_regclass('public.typing_status') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='typing_status' AND column_name='expires_at'
    ) THEN
      EXECUTE 'DELETE FROM public.typing_status WHERE expires_at < now()';
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='typing_status' AND column_name='updated_at'
    ) THEN
      EXECUTE 'DELETE FROM public.typing_status WHERE updated_at < now() - interval ''1 minute''' ;
    END IF;
  END IF;
END;
$$;

-- 6) Schedule cleanup every minute via pg_cron (if available)
DO $$
BEGIN
  PERFORM 1 FROM pg_extension WHERE extname='pg_cron';
  IF FOUND THEN
    -- Avoid duplicates by unscheduling if it exists
    BEGIN
      PERFORM cron.unschedule('cleanup_typing_status_every_minute');
    EXCEPTION WHEN OTHERS THEN
      -- ignore
    END;
    PERFORM cron.schedule('cleanup_typing_status_every_minute', '*/1 * * * *', 'SELECT public.cleanup_expired_typing();');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Cron scheduling skipped: %', SQLERRM;
END$$;

-- 7) Mentions: DB trigger to call Edge Function for parsing @username
CREATE OR REPLACE FUNCTION public.notify_mention_parser()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  req_id bigint;
BEGIN
  PERFORM 1 FROM pg_extension WHERE extname='pg_net';
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  SELECT net.http_post(
    url := 'https://onlamqkvlfjhtvqexyzq.supabase.co/functions/v1/parse-mentions',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object(
      'message_id', NEW.id,
      'channel_id', NEW.channel_id,
      'sender_id', NEW.sender_id,
      'content', NEW.content,
      'created_at', NEW.created_at
    )
  ) INTO req_id;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t 
    JOIN pg_class c ON c.oid=t.tgrelid
    WHERE c.relname='community_messages' AND t.tgname='notify_mention_parser_on_insert'
  ) THEN
    EXECUTE 'CREATE TRIGGER notify_mention_parser_on_insert AFTER INSERT ON public.community_messages FOR EACH ROW EXECUTE FUNCTION public.notify_mention_parser()';
  END IF;
END$$;

-- Note on RLS: Existing insert policy already enforces channel membership; no duplicate policy added.