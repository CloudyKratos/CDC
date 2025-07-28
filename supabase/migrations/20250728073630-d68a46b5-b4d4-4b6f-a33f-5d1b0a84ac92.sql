
-- Create a table to store user warrior stats for leaderboard
CREATE TABLE public.warrior_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  completed_quests INTEGER NOT NULL DEFAULT 0,
  total_coins INTEGER NOT NULL DEFAULT 0,
  rank_name TEXT NOT NULL DEFAULT 'Novice Warrior',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.warrior_leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view all leaderboard data (public)
CREATE POLICY "Anyone can view leaderboard stats" 
  ON public.warrior_leaderboard 
  FOR SELECT 
  USING (true);

-- Policy to allow users to insert/update their own stats
CREATE POLICY "Users can manage their own leaderboard stats" 
  ON public.warrior_leaderboard 
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update leaderboard stats
CREATE OR REPLACE FUNCTION public.update_warrior_leaderboard(
  p_user_id UUID,
  p_level INTEGER,
  p_total_xp INTEGER,
  p_current_streak INTEGER,
  p_completed_quests INTEGER,
  p_total_coins INTEGER,
  p_rank_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.warrior_leaderboard (
    user_id, level, total_xp, current_streak, 
    completed_quests, total_coins, rank_name, last_updated
  )
  VALUES (
    p_user_id, p_level, p_total_xp, p_current_streak,
    p_completed_quests, p_total_coins, p_rank_name, now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    level = EXCLUDED.level,
    total_xp = EXCLUDED.total_xp,
    current_streak = EXCLUDED.current_streak,
    completed_quests = EXCLUDED.completed_quests,
    total_coins = EXCLUDED.total_coins,
    rank_name = EXCLUDED.rank_name,
    last_updated = now();
  
  RETURN TRUE;
END;
$$;
