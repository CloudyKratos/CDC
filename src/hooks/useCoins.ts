
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CoinBalance {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export const useCoins = () => {
  const [coins, setCoins] = useState<CoinBalance>({
    balance: 0,
    total_earned: 0,
    total_spent: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchCoins = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('user_coins')
        .select('balance, total_earned, total_spent')
        .eq('user_id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCoins(data);
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockCourse = async (courseId: string, cost: number): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Please sign in to unlock courses');
        return false;
      }

      const { data, error } = await supabase.rpc('unlock_course_with_coins', {
        p_user_id: user.user.id,
        p_course_id: courseId,
        p_cost: cost
      });

      if (error) throw error;

      if (data) {
        toast.success('Course unlocked successfully!');
        await fetchCoins(); // Refresh coin balance
        return true;
      } else {
        toast.error('Insufficient coins to unlock this course');
        return false;
      }
    } catch (error) {
      console.error('Error unlocking course:', error);
      toast.error('Failed to unlock course');
      return false;
    }
  };

  const isCourseUnlocked = async (courseId: string): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data, error } = await supabase
        .from('course_unlocks')
        .select('id')
        .eq('user_id', user.user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking course unlock status:', error);
      return false;
    }
  };

  const refreshCoins = () => {
    fetchCoins();
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  return {
    coins,
    loading,
    unlockCourse,
    isCourseUnlocked,
    refreshCoins
  };
};
