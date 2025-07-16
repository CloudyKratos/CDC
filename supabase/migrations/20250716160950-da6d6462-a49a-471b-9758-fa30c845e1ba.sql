
-- Phase 1: Fix Database Security Issues - Add search_path to all functions
-- This addresses the 11 function security warnings

-- Fix update_channel_analytics function
CREATE OR REPLACE FUNCTION public.update_channel_analytics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.channel_analytics (channel_id, date, message_count, active_users)
  VALUES (NEW.channel_id, CURRENT_DATE, 1, 1)
  ON CONFLICT (channel_id, date)
  DO UPDATE SET 
    message_count = public.channel_analytics.message_count + 1,
    active_users = public.channel_analytics.active_users + 1;
  
  RETURN NEW;
END;
$function$;

-- Fix update_profiles_updated_at function
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix is_authenticated_user function
CREATE OR REPLACE FUNCTION public.is_authenticated_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT auth.uid() IS NOT NULL;
$function$;

-- Fix is_channel_member function
CREATE OR REPLACE FUNCTION public.is_channel_member(channel_uuid uuid, user_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members 
    WHERE channel_id = channel_uuid AND user_id = user_uuid
  );
$function$;

-- Fix get_profile_completion_percentage function
CREATE OR REPLACE FUNCTION public.get_profile_completion_percentage(user_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  total_fields INTEGER := 11;
  completed_fields INTEGER := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Count completed fields
  IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.company IS NOT NULL AND profile_record.company != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.website IS NOT NULL AND profile_record.website != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.phone_number IS NOT NULL AND profile_record.phone_number != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.avatar_url IS NOT NULL AND profile_record.avatar_url != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.github_url IS NOT NULL AND profile_record.github_url != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.linkedin_url IS NOT NULL AND profile_record.linkedin_url != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.twitter_url IS NOT NULL AND profile_record.twitter_url != '' THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  IF profile_record.skills IS NOT NULL AND jsonb_array_length(profile_record.skills) > 0 THEN
    completed_fields := completed_fields + 1;
  END IF;
  
  RETURN (completed_fields * 100 / total_fields);
END;
$function$;

-- Fix update_coin_balance function
CREATE OR REPLACE FUNCTION public.update_coin_balance(p_user_id uuid, p_type text, p_source text, p_amount integer, p_description text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
  INSERT INTO public.user_coins (user_id, balance) 
  VALUES (p_user_id, 0) 
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT balance INTO current_balance 
  FROM public.user_coins 
  WHERE user_id = p_user_id;

  -- Check if spending would result in negative balance
  IF p_type = 'spend' AND current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Insert transaction record
  INSERT INTO public.coin_transactions (user_id, type, source, amount, description, metadata)
  VALUES (p_user_id, p_type, p_source, p_amount, p_description, p_metadata);

  -- Update balance and totals
  IF p_type = 'earn' THEN
    UPDATE public.user_coins 
    SET 
      balance = balance + p_amount,
      total_earned = total_earned + p_amount,
      updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.user_coins 
    SET 
      balance = balance - p_amount,
      total_spent = total_spent + p_amount,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$function$;

-- Fix award_daily_warrior_completion function
CREATE OR REPLACE FUNCTION public.award_daily_warrior_completion(p_user_id uuid, p_activity_type text DEFAULT 'warrior_space_daily'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  completion_exists BOOLEAN;
  reward_amount INTEGER := 20;
BEGIN
  -- Check if already completed today
  SELECT EXISTS(
    SELECT 1 FROM public.daily_completions 
    WHERE user_id = p_user_id 
    AND activity_type = p_activity_type 
    AND completion_date = CURRENT_DATE
  ) INTO completion_exists;

  IF completion_exists THEN
    RETURN FALSE;
  END IF;

  -- Record completion
  INSERT INTO public.daily_completions (user_id, activity_type, completion_date)
  VALUES (p_user_id, p_activity_type, CURRENT_DATE);

  -- Award coins
  PERFORM public.update_coin_balance(
    p_user_id,
    'earn',
    p_activity_type,
    reward_amount,
    'Daily Warrior Space completion reward'
  );

  RETURN TRUE;
END;
$function$;

-- Fix unlock_course_with_coins function
CREATE OR REPLACE FUNCTION public.unlock_course_with_coins(p_user_id uuid, p_course_id text, p_cost integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  already_unlocked BOOLEAN;
  transaction_success BOOLEAN;
BEGIN
  -- Check if course is already unlocked
  SELECT EXISTS(
    SELECT 1 FROM public.course_unlocks 
    WHERE user_id = p_user_id AND course_id = p_course_id
  ) INTO already_unlocked;

  IF already_unlocked THEN
    RETURN TRUE;
  END IF;

  -- Try to spend coins
  SELECT public.update_coin_balance(
    p_user_id,
    'spend',
    'course_unlock',
    p_cost,
    'Unlocked course: ' || p_course_id
  ) INTO transaction_success;

  IF NOT transaction_success THEN
    RETURN FALSE;
  END IF;

  -- Record course unlock
  INSERT INTO public.course_unlocks (user_id, course_id, cost)
  VALUES (p_user_id, p_course_id, p_cost);

  RETURN TRUE;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Insert profile with better error handling
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    COALESCE(new.email, '')
  );
  
  -- Initialize user coins
  INSERT INTO public.user_coins (user_id, balance, total_earned, total_spent)
  VALUES (new.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Initialize user settings
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN new;
END;
$function$;

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = check_user_id AND role = 'admin' LIMIT 1;
$function$;

-- Add password reset functionality
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on password reset tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for password reset tokens
CREATE POLICY "Users can view their own reset tokens" 
  ON public.password_reset_tokens 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage reset tokens" 
  ON public.password_reset_tokens 
  FOR ALL 
  USING (true);

-- Add auth attempt logging table for rate limiting
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  attempt_type text NOT NULL, -- 'signin', 'signup', 'reset'
  ip_address inet,
  user_agent text,
  success boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on auth attempts
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policy for auth attempts (admin only)
CREATE POLICY "Admins can view auth attempts" 
  ON public.auth_attempts 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Function to check rate limiting
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(p_email text, p_attempt_type text, p_limit integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*) INTO attempt_count
  FROM public.auth_attempts
  WHERE email = p_email 
    AND attempt_type = p_attempt_type
    AND created_at > now() - (p_window_minutes * interval '1 minute');
  
  RETURN attempt_count < p_limit;
END;
$function$;

-- Function to log auth attempts
CREATE OR REPLACE FUNCTION public.log_auth_attempt(p_email text, p_attempt_type text, p_success boolean DEFAULT false, p_ip_address inet DEFAULT NULL, p_user_agent text DEFAULT NULL)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.auth_attempts (email, attempt_type, success, ip_address, user_agent)
  VALUES (p_email, p_attempt_type, p_success, p_ip_address, p_user_agent);
END;
$function$;
