
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  read boolean NOT NULL DEFAULT false,
  action_url text,
  action_text text,
  metadata jsonb DEFAULT '{}',
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  calendar_events boolean NOT NULL DEFAULT true,
  calendar_reminders boolean NOT NULL DEFAULT true,
  community_messages boolean NOT NULL DEFAULT true,
  community_mentions boolean NOT NULL DEFAULT true,
  system_updates boolean NOT NULL DEFAULT true,
  marketing boolean NOT NULL DEFAULT false,
  digest_frequency text NOT NULL DEFAULT 'daily',
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create notification subscriptions table
CREATE TABLE public.notification_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  subscription_type text NOT NULL DEFAULT 'all',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_type, resource_id)
);

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key text NOT NULL UNIQUE,
  title_template text NOT NULL,
  message_template text NOT NULL,
  category text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  priority text NOT NULL DEFAULT 'medium',
  action_text text,
  metadata jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for notification preferences
CREATE POLICY "Users can manage their own preferences" 
  ON public.notification_preferences 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification subscriptions
CREATE POLICY "Users can manage their own subscriptions" 
  ON public.notification_subscriptions 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification templates
CREATE POLICY "Everyone can view templates" 
  ON public.notification_templates 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage templates" 
  ON public.notification_templates 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create notification management functions
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_template_key text,
  p_variables jsonb DEFAULT '{}',
  p_action_url text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  template_record notification_templates%ROWTYPE;
  notification_id uuid;
  rendered_title text;
  rendered_message text;
BEGIN
  -- Get template
  SELECT * INTO template_record 
  FROM notification_templates 
  WHERE template_key = p_template_key AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found: %', p_template_key;
  END IF;
  
  -- Simple variable replacement ({{variable_name}})
  rendered_title := template_record.title_template;
  rendered_message := template_record.message_template;
  
  -- Replace variables in title and message
  IF p_variables IS NOT NULL THEN
    -- This is a simplified version - in production you might want more sophisticated templating
    SELECT rendered_title, rendered_message INTO rendered_title, rendered_message;
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (
    user_id, title, message, type, category, priority, 
    action_url, action_text, metadata
  ) VALUES (
    p_user_id, rendered_title, rendered_message, 
    template_record.type, template_record.category, template_record.priority,
    COALESCE(p_action_url, template_record.action_text), 
    template_record.action_text, 
    COALESCE(template_record.metadata, '{}')
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE notifications 
  SET read = true, updated_at = now()
  WHERE id = notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS integer AS $$
DECLARE
  affected_count integer;
BEGIN
  UPDATE notifications 
  SET read = true, updated_at = now()
  WHERE user_id = auth.uid() AND read = false;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for event notifications
CREATE OR REPLACE FUNCTION public.handle_event_notifications()
RETURNS trigger AS $$
BEGIN
  -- Event created notification
  IF TG_OP = 'INSERT' THEN
    -- Notify creator
    PERFORM create_notification(
      NEW.created_by,
      'event_created',
      jsonb_build_object(
        'event_title', NEW.title,
        'event_id', NEW.id,
        'start_time', NEW.start_time
      ),
      '/calendar'
    );
    
    -- Schedule reminder notifications (simplified - would need a job queue in production)
    -- This could be handled by a separate cron job or background task
    
    RETURN NEW;
  END IF;
  
  -- Event updated notification
  IF TG_OP = 'UPDATE' THEN
    -- Only notify if significant changes
    IF OLD.title != NEW.title OR OLD.start_time != NEW.start_time OR OLD.end_time != NEW.end_time THEN
      PERFORM create_notification(
        NEW.created_by,
        'event_updated',
        jsonb_build_object(
          'event_title', NEW.title,
          'event_id', NEW.id,
          'start_time', NEW.start_time
        ),
        '/calendar'
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for event notifications
CREATE TRIGGER event_notifications_trigger
  AFTER INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION handle_event_notifications();

-- Insert default notification templates
INSERT INTO notification_templates (template_key, title_template, message_template, category, type, priority, action_text) VALUES
('event_created', 'Event Created: {{event_title}}', 'Your event "{{event_title}}" has been successfully created for {{start_time}}.', 'calendar', 'success', 'medium', 'View Event'),
('event_updated', 'Event Updated: {{event_title}}', 'Your event "{{event_title}}" has been updated. New start time: {{start_time}}.', 'calendar', 'info', 'medium', 'View Event'),
('event_reminder_1h', 'Event Starting Soon', 'Your event "{{event_title}}" starts in 1 hour.', 'calendar', 'info', 'high', 'Join Event'),
('event_reminder_1d', 'Event Tomorrow', 'Don\'t forget: "{{event_title}}" is scheduled for tomorrow.', 'calendar', 'info', 'medium', 'View Event'),
('community_mention', 'You were mentioned', '{{user_name}} mentioned you in {{channel_name}}.', 'community', 'info', 'medium', 'View Message'),
('community_message', 'New message in {{channel_name}}', '{{user_name}} posted a new message.', 'community', 'info', 'low', 'View Channel'),
('system_update', 'System Update', 'New features and improvements are now available.', 'system', 'info', 'medium', 'Learn More'),
('welcome', 'Welcome!', 'Welcome to the platform! Get started by exploring the dashboard.', 'system', 'success', 'medium', 'Get Started');

-- Insert default preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Send welcome notification
  PERFORM create_notification(
    NEW.id,
    'welcome',
    '{}',
    '/dashboard'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user preferences
CREATE TRIGGER create_notification_preferences_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- Add updated_at trigger for notifications table
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for notification_preferences table
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
