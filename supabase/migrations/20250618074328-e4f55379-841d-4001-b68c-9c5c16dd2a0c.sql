
-- Create a direct messages table for member-to-member communication
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  reply_to_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL
);

-- Create an index for better query performance
CREATE INDEX idx_direct_messages_sender_recipient ON public.direct_messages(sender_id, recipient_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at);
CREATE INDEX idx_direct_messages_unread ON public.direct_messages(recipient_id, is_read) WHERE is_read = false;

-- Enable Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for direct messages
CREATE POLICY "Users can view their own direct messages" 
  ON public.direct_messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send direct messages" 
  ON public.direct_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own sent messages" 
  ON public.direct_messages 
  FOR UPDATE 
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own sent messages" 
  ON public.direct_messages 
  FOR DELETE 
  USING (auth.uid() = sender_id);

-- Create a conversations table to track conversation metadata
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_one_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_two_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_one_id, participant_two_id),
  CHECK (participant_one_id < participant_two_id) -- Ensure consistent ordering
);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

CREATE POLICY "Users can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

CREATE POLICY "Users can update their conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = participant_one_id OR auth.uid() = participant_two_id);

-- Enable real-time updates for direct messages
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user_one_id UUID, user_two_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversation_id UUID;
  ordered_user_one UUID;
  ordered_user_two UUID;
BEGIN
  -- Ensure consistent ordering (smaller UUID first)
  IF user_one_id < user_two_id THEN
    ordered_user_one := user_one_id;
    ordered_user_two := user_two_id;
  ELSE
    ordered_user_one := user_two_id;
    ordered_user_two := user_one_id;
  END IF;
  
  -- Try to get existing conversation
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE participant_one_id = ordered_user_one 
    AND participant_two_id = ordered_user_two;
  
  -- Create if doesn't exist
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_one_id, participant_two_id)
    VALUES (ordered_user_one, ordered_user_two)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Function to update conversation last activity
CREATE OR REPLACE FUNCTION public.update_conversation_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Get or create conversation
  conv_id := public.get_or_create_conversation(NEW.sender_id, NEW.recipient_id);
  
  -- Update conversation with latest message
  UPDATE public.conversations 
  SET 
    last_message_id = NEW.id,
    last_activity_at = NEW.created_at
  WHERE id = conv_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update conversation on new message
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_activity();
