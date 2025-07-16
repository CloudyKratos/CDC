
-- First, let's ensure the profiles table properly supports skills and interests as JSON arrays
-- and add avatar upload support with Supabase Storage

-- Add storage bucket for profile avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES (
  'profile-avatars', 
  'profile-avatars', 
  true,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatars');

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS profiles_updated_at_trigger ON profiles;
CREATE TRIGGER profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Add function to get user profile completion percentage
CREATE OR REPLACE FUNCTION get_profile_completion_percentage(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_fields INTEGER := 11; -- Total number of profile fields we consider
  completed_fields INTEGER := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = user_uuid;
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
