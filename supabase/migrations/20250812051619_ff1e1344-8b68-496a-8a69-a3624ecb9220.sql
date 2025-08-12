-- CRITICAL SECURITY FIXES

-- 1. Create a secure function to get user role (prevents infinite recursion in RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role FROM public.user_roles WHERE user_id = check_user_id LIMIT 1;
$$;

-- 2. Fix user_roles RLS policies to prevent privilege escalation
DROP POLICY IF EXISTS "Admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can remove roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

-- Create secure RLS policies for user_roles that prevent privilege escalation
CREATE POLICY "Only super admins can assign roles" ON public.user_roles
FOR INSERT
WITH CHECK (
  -- Only allow if current user has admin role AND is CDC admin email
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'cdcofficialeg@gmail.com'
  ) AND
  public.get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Only super admins can remove roles" ON public.user_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'cdcofficialeg@gmail.com'
  ) AND
  public.get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Only super admins can update roles" ON public.user_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'cdcofficialeg@gmail.com'
  ) AND
  public.get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Only super admins can view all user roles" ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'cdcofficialeg@gmail.com'
  ) AND
  public.get_user_role(auth.uid()) = 'admin'
);

-- 3. Secure channels table - restrict to authenticated users with proper access
DROP POLICY IF EXISTS "allow_all_channels" ON public.channels;

CREATE POLICY "Users can view public channels" ON public.channels
FOR SELECT
USING (type = 'public' OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create channels" ON public.channels
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Channel creators can update their channels" ON public.channels
FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Channel creators can delete their channels" ON public.channels
FOR DELETE
USING (created_by = auth.uid());

-- 4. Secure channel_members table
DROP POLICY IF EXISTS "allow_all_members" ON public.channel_members;

CREATE POLICY "Users can view channel members for channels they have access to" ON public.channel_members
FOR SELECT
USING (
  channel_id IN (
    SELECT id FROM public.channels 
    WHERE type = 'public' OR created_by = auth.uid()
  ) OR
  user_id = auth.uid()
);

CREATE POLICY "Users can join public channels" ON public.channel_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  channel_id IN (
    SELECT id FROM public.channels WHERE type = 'public'
  )
);

CREATE POLICY "Users can leave channels" ON public.channel_members
FOR DELETE
USING (user_id = auth.uid());

-- 5. Secure community_messages table
DROP POLICY IF EXISTS "allow_all_messages" ON public.community_messages;

CREATE POLICY "Users can view messages in accessible channels" ON public.community_messages
FOR SELECT
USING (
  channel_id IN (
    SELECT cm.channel_id FROM public.channel_members cm
    WHERE cm.user_id = auth.uid()
  ) OR
  channel_id IN (
    SELECT id FROM public.channels WHERE type = 'public'
  )
);

CREATE POLICY "Channel members can send messages" ON public.community_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  (
    channel_id IN (
      SELECT cm.channel_id FROM public.channel_members cm
      WHERE cm.user_id = auth.uid()
    ) OR
    channel_id IN (
      SELECT id FROM public.channels WHERE type = 'public'
    )
  )
);

CREATE POLICY "Message senders can update their messages" ON public.community_messages
FOR UPDATE
USING (sender_id = auth.uid());

CREATE POLICY "Message senders can delete their messages" ON public.community_messages
FOR DELETE
USING (sender_id = auth.uid());

-- 6. Add audit logging for role changes
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_user_id uuid NOT NULL,
  changed_by_user_id uuid NOT NULL,
  old_role text,
  new_role text NOT NULL,
  action text NOT NULL, -- 'assigned', 'removed', 'updated'
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Only super admins can view role audit logs" ON public.role_change_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'cdcofficialeg@gmail.com'
  ) AND
  public.get_user_role(auth.uid()) = 'admin'
);

-- 7. Create trigger function for role change auditing
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_change_audit (
      changed_user_id, changed_by_user_id, new_role, action
    ) VALUES (
      NEW.user_id, auth.uid(), NEW.role, 'assigned'
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.role_change_audit (
      changed_user_id, changed_by_user_id, old_role, new_role, action
    ) VALUES (
      NEW.user_id, auth.uid(), OLD.role, NEW.role, 'updated'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_change_audit (
      changed_user_id, changed_by_user_id, old_role, action
    ) VALUES (
      OLD.user_id, auth.uid(), OLD.role, 'removed'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS role_changes_audit_trigger ON public.user_roles;
CREATE TRIGGER role_changes_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();