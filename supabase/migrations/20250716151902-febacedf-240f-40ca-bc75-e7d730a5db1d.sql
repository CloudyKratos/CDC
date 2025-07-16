
-- Create the missing default channels that the UI expects
INSERT INTO public.channels (name, type, description, created_by) 
VALUES 
  ('morning journey', 'public', 'Start your day with motivation and morning routines', (SELECT id FROM auth.users LIMIT 1)),
  ('announcement', 'public', 'Important announcements and updates', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- Ensure the general channel exists with proper description
INSERT INTO public.channels (name, type, description, created_by) 
VALUES 
  ('general', 'public', 'General discussion and community chat', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- Update existing channels to have proper descriptions if they're missing
UPDATE public.channels 
SET description = CASE 
  WHEN name = 'general' AND (description IS NULL OR description = '') 
    THEN 'General discussion and community chat'
  WHEN name = 'morning journey' AND (description IS NULL OR description = '') 
    THEN 'Start your day with motivation and morning routines'
  WHEN name = 'announcement' AND (description IS NULL OR description = '') 
    THEN 'Important announcements and updates'
  ELSE description
END
WHERE name IN ('general', 'morning journey', 'announcement');
