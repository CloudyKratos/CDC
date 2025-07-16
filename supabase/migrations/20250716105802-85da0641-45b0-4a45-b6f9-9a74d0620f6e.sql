
-- Phase 1: Database Setup
-- Ensure the CDC admin user has the admin role assigned
INSERT INTO user_roles (user_id, role, assigned_at) 
VALUES ('348ae8de-aaac-41cb-89cd-674023098784', 'admin', now())
ON CONFLICT (user_id, role) DO NOTHING;

-- Add a security function to check if user is the specific CDC admin
CREATE OR REPLACE FUNCTION public.is_cdc_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN public.user_roles ur ON u.id = ur.user_id
    WHERE u.id = check_user_id 
    AND u.email = 'cdcofficialeg@gmail.com'
    AND ur.role = 'admin'
  );
$$;

-- Update RLS policies to use the new CDC admin check for enhanced security
DROP POLICY IF EXISTS "Admins can assign roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can remove roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;

CREATE POLICY "CDC Admin can assign roles" 
ON user_roles FOR INSERT 
WITH CHECK (is_cdc_admin(auth.uid()));

CREATE POLICY "CDC Admin can remove roles" 
ON user_roles FOR DELETE 
USING (is_cdc_admin(auth.uid()));

CREATE POLICY "CDC Admin can update roles" 
ON user_roles FOR UPDATE 
USING (is_cdc_admin(auth.uid()));

CREATE POLICY "CDC Admin can view all user roles" 
ON user_roles FOR SELECT 
USING (is_cdc_admin(auth.uid()));
