
-- Fix 1: Admin Role Assignment
-- Add admin role for the designated CDC admin user
INSERT INTO user_roles (user_id, role, assigned_at) 
VALUES ('348ae8de-aaac-41cb-89cd-674023098784', 'admin', now())
ON CONFLICT (user_id, role) DO NOTHING;

-- Verification query to confirm the role assignment
-- This will show the admin user with their role
SELECT p.email, ur.role, ur.assigned_at
FROM profiles p 
JOIN user_roles ur ON p.id = ur.user_id 
WHERE p.email = 'cdcofficialeg@gmail.com';
