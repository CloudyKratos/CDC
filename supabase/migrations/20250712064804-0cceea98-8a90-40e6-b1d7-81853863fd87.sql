
-- Enable RLS on existing tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- User coin balance table
CREATE TABLE IF NOT EXISTS user_coins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coin transactions table
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  source TEXT NOT NULL, -- e.g., "warrior_space_daily", "quest_completion", "course_unlock"
  amount INTEGER NOT NULL CHECK (amount > 0),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Daily activity completions to prevent duplicate rewards
CREATE TABLE IF NOT EXISTS daily_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- e.g., "warrior_space_daily", "morning_upload", "gratitude_list"
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, activity_type, completion_date)
);

-- Course unlocks table
CREATE TABLE IF NOT EXISTS course_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  cost INTEGER NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS on all new tables
ALTER TABLE user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_coins
CREATE POLICY "Users can view their own coin balance" ON user_coins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coin balance" ON user_coins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coin balance" ON user_coins
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for coin_transactions
CREATE POLICY "Users can view their own transactions" ON coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON coin_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_completions
CREATE POLICY "Users can view their own completions" ON daily_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" ON daily_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for course_unlocks
CREATE POLICY "Users can view their own unlocks" ON course_unlocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unlocks" ON course_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to safely update coin balance
CREATE OR REPLACE FUNCTION update_coin_balance(
  p_user_id UUID,
  p_type TEXT,
  p_source TEXT,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Validate inputs
  IF p_type NOT IN ('earn', 'spend') THEN
    RAISE EXCEPTION 'Invalid transaction type: %', p_type;
  END IF;
  
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive: %', p_amount;
  END IF;

  -- Get current balance or create user_coins record if doesn't exist
  INSERT INTO user_coins (user_id, balance) 
  VALUES (p_user_id, 0) 
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT balance INTO current_balance 
  FROM user_coins 
  WHERE user_id = p_user_id;

  -- Check if spending would result in negative balance
  IF p_type = 'spend' AND current_balance < p_amount THEN
    RETURN FALSE; -- Insufficient balance
  END IF;

  -- Insert transaction record
  INSERT INTO coin_transactions (user_id, type, source, amount, description, metadata)
  VALUES (p_user_id, p_type, p_source, p_amount, p_description, p_metadata);

  -- Update balance and totals
  IF p_type = 'earn' THEN
    UPDATE user_coins 
    SET 
      balance = balance + p_amount,
      total_earned = total_earned + p_amount,
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSE -- spend
    UPDATE user_coins 
    SET 
      balance = balance - p_amount,
      total_spent = total_spent + p_amount,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$$;

-- Function to check and award daily warrior space completion
CREATE OR REPLACE FUNCTION award_daily_warrior_completion(
  p_user_id UUID,
  p_activity_type TEXT DEFAULT 'warrior_space_daily'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completion_exists BOOLEAN;
  reward_amount INTEGER := 20; -- Default reward amount
BEGIN
  -- Check if already completed today
  SELECT EXISTS(
    SELECT 1 FROM daily_completions 
    WHERE user_id = p_user_id 
    AND activity_type = p_activity_type 
    AND completion_date = CURRENT_DATE
  ) INTO completion_exists;

  -- If already completed today, return false
  IF completion_exists THEN
    RETURN FALSE;
  END IF;

  -- Record completion
  INSERT INTO daily_completions (user_id, activity_type, completion_date)
  VALUES (p_user_id, p_activity_type, CURRENT_DATE);

  -- Award coins
  PERFORM update_coin_balance(
    p_user_id,
    'earn',
    p_activity_type,
    reward_amount,
    'Daily Warrior Space completion reward'
  );

  RETURN TRUE;
END;
$$;

-- Function to unlock course with coins
CREATE OR REPLACE FUNCTION unlock_course_with_coins(
  p_user_id UUID,
  p_course_id TEXT,
  p_cost INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  already_unlocked BOOLEAN;
  transaction_success BOOLEAN;
BEGIN
  -- Check if course is already unlocked
  SELECT EXISTS(
    SELECT 1 FROM course_unlocks 
    WHERE user_id = p_user_id AND course_id = p_course_id
  ) INTO already_unlocked;

  IF already_unlocked THEN
    RETURN TRUE; -- Already unlocked
  END IF;

  -- Try to spend coins
  SELECT update_coin_balance(
    p_user_id,
    'spend',
    'course_unlock',
    p_cost,
    'Unlocked course: ' || p_course_id
  ) INTO transaction_success;

  -- If transaction failed (insufficient balance)
  IF NOT transaction_success THEN
    RETURN FALSE;
  END IF;

  -- Record course unlock
  INSERT INTO course_unlocks (user_id, course_id, cost)
  VALUES (p_user_id, p_course_id, p_cost);

  RETURN TRUE;
END;
$$;
