
-- Create community_messages table (this is what the code expects)
CREATE TABLE public.community_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create channel_members table (for channel membership)
CREATE TABLE public.channel_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT 'member',
  UNIQUE(channel_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_messages
CREATE POLICY "Anyone can view community messages" ON public.community_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send community messages" ON public.community_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = sender_id);
CREATE POLICY "Users can update their own community messages" ON public.community_messages FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for channel_members
CREATE POLICY "Anyone can view channel members" ON public.channel_members FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join channels" ON public.channel_members FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Users can leave channels" ON public.channel_members FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for community_messages
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
