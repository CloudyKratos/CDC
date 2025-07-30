
-- Add foreign key constraint to link warrior_leaderboard to profiles table
ALTER TABLE public.warrior_leaderboard 
DROP CONSTRAINT IF EXISTS warrior_leaderboard_user_id_fkey;

-- Add proper foreign key to profiles table instead of auth.users
ALTER TABLE public.warrior_leaderboard 
ADD CONSTRAINT warrior_leaderboard_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
