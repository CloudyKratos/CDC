
-- Ensure the CDC admin user has the admin role assigned
-- First, let's check if the user exists and then assign the role
DO $$
BEGIN
  -- Insert the admin role for the CDC admin user if it doesn't exist
  INSERT INTO user_roles (user_id, role, assigned_at) 
  VALUES ('348ae8de-aaac-41cb-89cd-674023098784', 'admin', now())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Also ensure the user has a profile entry (needed for role checks)
  INSERT INTO profiles (id, email, full_name) 
  VALUES ('348ae8de-aaac-41cb-89cd-674023098784', 'cdcofficialeg@gmail.com', 'CDC Admin')
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);
END $$;

-- Verify the assignment worked
SELECT 
  p.email, 
  ur.role, 
  ur.assigned_at,
  'CDC Admin access should now work' as status
FROM profiles p 
JOIN user_roles ur ON p.id = ur.user_id 
WHERE p.id = '348ae8de-aaac-41cb-89cd-674023098784' 
AND ur.role = 'admin';
