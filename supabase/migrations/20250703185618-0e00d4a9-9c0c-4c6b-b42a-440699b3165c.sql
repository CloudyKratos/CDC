
-- Advanced moderation tools tables
CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID REFERENCES auth.users(id) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) NOT NULL,
  channel_id UUID REFERENCES channels(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('ban', 'kick', 'mute', 'warn', 'timeout')),
  reason TEXT,
  duration_minutes INTEGER, -- null for permanent actions
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) NOT NULL,
  message_id UUID REFERENCES community_messages(id) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community analytics tables
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  channel_id UUID REFERENCES channels(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('message_sent', 'reaction_added', 'joined_channel', 'left_channel', 'login', 'logout')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.channel_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) NOT NULL,
  date DATE NOT NULL,
  message_count INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_members INTEGER DEFAULT 0,
  peak_online_users INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(channel_id, date)
);

-- File sharing tables
CREATE TABLE public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES community_messages(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Community governance tables
CREATE TABLE public.community_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  allow_multiple_votes BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES community_polls(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id, option_index)
);

-- Integration ecosystem tables
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  secret_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_triggered_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moderation_actions
CREATE POLICY "Moderators can view all moderation actions" ON public.moderation_actions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

CREATE POLICY "Moderators can create moderation actions" ON public.moderation_actions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
    AND moderator_id = auth.uid()
  );

-- RLS Policies for message_reports
CREATE POLICY "Users can create message reports" ON public.message_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Moderators can view all reports" ON public.message_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

CREATE POLICY "Moderators can update reports" ON public.message_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- RLS Policies for user_activity_logs
CREATE POLICY "Users can view their own activity" ON public.user_activity_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs" ON public.user_activity_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for channel_analytics
CREATE POLICY "Everyone can view channel analytics" ON public.channel_analytics
  FOR SELECT USING (true);

CREATE POLICY "System can manage analytics" ON public.channel_analytics
  FOR ALL USING (true);

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments in accessible channels" ON public.message_attachments
  FOR SELECT USING (true);

CREATE POLICY "Users can upload attachments" ON public.message_attachments
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- RLS Policies for community_polls
CREATE POLICY "Users can view polls in accessible channels" ON public.community_polls
  FOR SELECT USING (true);

CREATE POLICY "Users can create polls" ON public.community_polls
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Poll creators can update their polls" ON public.community_polls
  FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for poll_votes
CREATE POLICY "Users can view poll votes" ON public.poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote on polls" ON public.poll_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for webhooks
CREATE POLICY "Users can manage webhooks in their channels" ON public.webhooks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for webhook_logs
CREATE POLICY "Webhook owners can view logs" ON public.webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM webhooks w 
      JOIN channels c ON w.channel_id = c.id 
      WHERE w.id = webhook_id AND (c.created_by = auth.uid() OR w.created_by = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Functions for analytics
CREATE OR REPLACE FUNCTION update_channel_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO channel_analytics (channel_id, date, message_count, active_users)
  VALUES (NEW.channel_id, CURRENT_DATE, 1, 1)
  ON CONFLICT (channel_id, date)
  DO UPDATE SET 
    message_count = channel_analytics.message_count + 1,
    active_users = channel_analytics.active_users + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic analytics
CREATE TRIGGER update_analytics_on_message
  AFTER INSERT ON community_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_analytics();
