
-- Fix infinite recursion in channels RLS policies
DROP POLICY IF EXISTS "enable_read_public_channels" ON public.channels;
DROP POLICY IF EXISTS "enable_insert_channels" ON public.channels;
DROP POLICY IF EXISTS "enable_update_own_channels" ON public.channels;
DROP POLICY IF EXISTS "enable_delete_own_channels" ON public.channels;

-- Create simple, non-recursive policies for channels
CREATE POLICY "channels_select_policy"
ON public.channels FOR SELECT
TO authenticated
USING (type = 'public');

CREATE POLICY "channels_insert_policy"
ON public.channels FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  created_by = auth.uid()
);

CREATE POLICY "channels_update_policy"
ON public.channels FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "channels_delete_policy"
ON public.channels FOR DELETE
TO authenticated
USING (created_by = auth.uid());
