-- Secure profiles table: replace public SELECT policy with granular access rules

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1) Remove overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- 2) Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
);

-- 3) Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 4) Users can view profiles of members in shared channels
CREATE POLICY "Users can view profiles in shared channels"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.channel_members cm_me
    JOIN public.channel_members cm_other
      ON cm_me.channel_id = cm_other.channel_id
    WHERE cm_me.user_id = auth.uid()
      AND cm_other.user_id = profiles.id
  )
);

-- 5) Users can view profiles of members in shared workspaces
CREATE POLICY "Users can view profiles in shared workspaces"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm_me
    JOIN public.workspace_members wm_other
      ON wm_me.workspace_id = wm_other.workspace_id
    WHERE wm_me.user_id = auth.uid()
      AND wm_other.user_id = profiles.id
  )
);

-- 6) Users can view profiles of message senders in accessible channels (public or ones they joined)
CREATE POLICY "Users can view profiles of senders in accessible channels"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.community_messages m
    JOIN public.channels c ON c.id = m.channel_id
    WHERE m.sender_id = profiles.id
      AND (
        c.type = 'public'
        OR m.channel_id IN (
          SELECT cm.channel_id FROM public.channel_members cm WHERE cm.user_id = auth.uid()
        )
      )
  )
);

-- 7) Users can view profiles that appear on the public leaderboard
CREATE POLICY "Users can view profiles on leaderboard"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.warrior_leaderboard wl WHERE wl.user_id = profiles.id
  )
);
