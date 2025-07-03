
-- Phase 1: Create Security Definer Functions to break circular dependencies

-- Function to check workspace ownership without triggering policies
CREATE OR REPLACE FUNCTION public.is_workspace_owner(user_uuid uuid, workspace_uuid uuid)
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces 
    WHERE id = workspace_uuid AND owner_id = user_uuid
  );
$$;

-- Function to check workspace membership without triggering policies
CREATE OR REPLACE FUNCTION public.is_workspace_member(user_uuid uuid, workspace_uuid uuid)
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE user_id = user_uuid AND workspace_id = workspace_uuid
  );
$$;

-- Function to get user's workspace role without triggering policies
CREATE OR REPLACE FUNCTION public.get_user_workspace_role(user_uuid uuid, workspace_uuid uuid)
RETURNS text 
LANGUAGE sql 
SECURITY DEFINER 
STABLE AS $$
  SELECT role FROM public.workspace_members 
  WHERE user_id = user_uuid AND workspace_id = workspace_uuid
  LIMIT 1;
$$;

-- Function to check if user can access workspace (owner or member)
CREATE OR REPLACE FUNCTION public.can_access_workspace(user_uuid uuid, workspace_uuid uuid)
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces WHERE id = workspace_uuid AND owner_id = user_uuid
  ) OR EXISTS (
    SELECT 1 FROM public.workspace_members WHERE user_id = user_uuid AND workspace_id = workspace_uuid
  );
$$;

-- Function to check if user can access channel without circular dependencies
CREATE OR REPLACE FUNCTION public.can_access_channel(user_uuid uuid, channel_uuid uuid)
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channels 
    WHERE id = channel_uuid AND (type = 'public' OR created_by = user_uuid)
  ) OR EXISTS (
    SELECT 1 FROM public.channel_members 
    WHERE user_id = user_uuid AND channel_id = channel_uuid
  );
$$;

-- Drop existing policies that cause circular dependencies
DROP POLICY IF EXISTS "Users can view workspaces they're members of" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can view stages in their workspaces" ON public.stages;
DROP POLICY IF EXISTS "Users can view speaker requests for stages they can see" ON public.speaker_requests;

-- Rebuild workspace policies using security definer functions
CREATE POLICY "Users can view accessible workspaces" 
ON public.workspaces 
FOR SELECT 
USING (
  owner_id = auth.uid() OR 
  public.is_workspace_member(auth.uid(), id)
);

CREATE POLICY "Workspace owners can update their workspaces" 
ON public.workspaces 
FOR UPDATE 
USING (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete their workspaces" 
ON public.workspaces 
FOR DELETE 
USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create workspaces" 
ON public.workspaces 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = owner_id);

-- Rebuild workspace_members policies using security definer functions
CREATE POLICY "Users can view workspace members in accessible workspaces" 
ON public.workspace_members 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  public.can_access_workspace(auth.uid(), workspace_id)
);

CREATE POLICY "Workspace owners and users can add members" 
ON public.workspace_members 
FOR INSERT 
WITH CHECK (
  public.is_workspace_owner(auth.uid(), workspace_id) OR 
  auth.uid() = user_id
);

CREATE POLICY "Users can leave workspaces" 
ON public.workspace_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Rebuild stages policies to avoid workspace circular dependencies
CREATE POLICY "Users can view all public stages" 
ON public.stages 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own stages" 
ON public.stages 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators and hosts can update their stages" 
ON public.stages 
FOR UPDATE 
USING (auth.uid() = creator_id OR auth.uid() = host_id);

CREATE POLICY "Creators and hosts can delete their stages" 
ON public.stages 
FOR DELETE 
USING (auth.uid() = creator_id OR auth.uid() = host_id);

-- Rebuild speaker_requests policies to avoid workspace circular dependencies
CREATE POLICY "Users can view speaker requests for accessible stages" 
ON public.speaker_requests 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.stages 
    WHERE id = speaker_requests.stage_id AND creator_id = auth.uid()
  )
);

-- Add composite indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workspace_members_user_workspace 
ON public.workspace_members (user_id, workspace_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_channel_members_user_channel 
ON public.channel_members (user_id, channel_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_channels_type_created_by 
ON public.channels (type, created_by);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workspaces_owner_id 
ON public.workspaces (owner_id);

-- Enable realtime for better chat performance
ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_members;
