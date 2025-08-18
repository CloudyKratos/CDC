-- Fix community messages foreign key constraint and RLS policies

-- First, drop any existing foreign key that might be causing issues
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'community_messages_sender_id_fkey' 
             AND table_name = 'community_messages') THEN
    ALTER TABLE community_messages DROP CONSTRAINT community_messages_sender_id_fkey;
  END IF;
END $$;

-- Add proper foreign key constraint pointing to profiles table
ALTER TABLE community_messages 
ADD CONSTRAINT community_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Enable RLS on community_messages if not already enabled
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view community messages" ON community_messages;
DROP POLICY IF EXISTS "Users can create community messages" ON community_messages;
DROP POLICY IF EXISTS "Users can update their own community messages" ON community_messages;

-- Create proper RLS policies for community_messages
CREATE POLICY "Anyone can view non-deleted community messages" 
ON community_messages FOR SELECT 
USING (is_deleted = false OR is_deleted IS NULL);

CREATE POLICY "Authenticated users can create community messages" 
ON community_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own community messages" 
ON community_messages FOR UPDATE 
USING (auth.uid() = sender_id);

-- Ensure profiles table has proper RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profiles policies to recreate them
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure channels table has proper RLS policies
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Drop existing channel policies to recreate them
DROP POLICY IF EXISTS "Anyone can view public channels" ON channels;
DROP POLICY IF EXISTS "Authenticated users can create channels" ON channels;

-- Create proper RLS policies for channels
CREATE POLICY "Anyone can view public channels" 
ON channels FOR SELECT 
USING (type = 'public');

CREATE POLICY "Authenticated users can create channels" 
ON channels FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Enable realtime for the tables
ALTER TABLE community_messages REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE channels REPLICA IDENTITY FULL;