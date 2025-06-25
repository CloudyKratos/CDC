
-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_members table
CREATE TABLE public.workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Create stages table
CREATE TABLE public.stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  max_participants INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create speaker_requests table
CREATE TABLE public.speaker_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stage_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaker_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they're members of" ON public.workspaces FOR SELECT USING (
  id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  OR owner_id = auth.uid()
);
CREATE POLICY "Authenticated users can create workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = owner_id);
CREATE POLICY "Workspace owners can update their workspaces" ON public.workspaces FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Workspace owners can delete their workspaces" ON public.workspaces FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for workspace_members
CREATE POLICY "Users can view workspace members" ON public.workspace_members FOR SELECT USING (true);
CREATE POLICY "Workspace owners can add members" ON public.workspace_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  OR auth.uid() = user_id
);
CREATE POLICY "Users can leave workspaces" ON public.workspace_members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for stages
CREATE POLICY "Users can view stages in their workspaces" ON public.stages FOR SELECT USING (
  workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  OR host_id = auth.uid()
);
CREATE POLICY "Workspace members can create stages" ON public.stages FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND auth.uid() = host_id
);
CREATE POLICY "Stage hosts can update their stages" ON public.stages FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Stage hosts can delete their stages" ON public.stages FOR DELETE USING (auth.uid() = host_id);

-- RLS Policies for speaker_requests
CREATE POLICY "Users can view speaker requests for stages they can see" ON public.speaker_requests FOR SELECT USING (
  stage_id IN (SELECT id FROM public.stages WHERE workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()))
  OR user_id = auth.uid()
);
CREATE POLICY "Authenticated users can create speaker requests" ON public.speaker_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Users can update their own speaker requests" ON public.speaker_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own speaker requests" ON public.speaker_requests FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for stages and speaker_requests
ALTER TABLE public.stages REPLICA IDENTITY FULL;
ALTER TABLE public.speaker_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.speaker_requests;
