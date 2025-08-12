import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  website: string | null;
  avatar_url: string | null;
  skills: any | null; // JSON type from Supabase
  interests: any | null; // JSON type from Supabase
}

interface UserCoins {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [coins, setCoins] = useState<UserCoins | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to load profile');
        } else {
          setProfile(profileData);
        }

        // Fetch coins
        const { data: coinsData, error: coinsError } = await supabase
          .from('user_coins')
          .select('balance, total_earned, total_spent')
          .eq('user_id', user.id)
          .single();

        if (coinsError) {
          // User might not have coins record yet, create default
          console.log('No coins record found, using defaults');
          setCoins({ balance: 0, total_earned: 0, total_spent: 0 });
        } else {
          setCoins(coinsData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  return { profile, coins, isLoading, error, refetch: () => {} };
};