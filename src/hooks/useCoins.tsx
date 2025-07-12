
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CoinTransaction {
  id: string;
  type: 'earn' | 'spend';
  source: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface UserCoins {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export const useCoins = () => {
  const { user } = useAuth();
  const [coins, setCoins] = useState<UserCoins>({ balance: 0, total_earned: 0, total_spent: 0 });
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch coin balance and transactions
  const fetchCoinsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch coin balance
      const { data: coinData, error: coinError } = await supabase
        .from('user_coins')
        .select('balance, total_earned, total_spent')
        .eq('user_id', user.id)
        .single();

      if (coinError && coinError.code !== 'PGRST116') {
        console.error('Error fetching coins:', coinError);
      } else if (coinData) {
        setCoins(coinData);
      }

      // Fetch transaction history
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('coin_transactions')
        .select('id, type, source, amount, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      } else if (transactionsData) {
        // Type assertion to ensure proper typing
        const typedTransactions: CoinTransaction[] = transactionsData.map(tx => ({
          ...tx,
          type: tx.type as 'earn' | 'spend'
        }));
        setTransactions(typedTransactions);
      }
    } catch (error) {
      console.error('Error in fetchCoinsData:', error);
    } finally {
      setLoading(false);
    }
  };

  // Award daily warrior completion
  const awardDailyCompletion = async (activityType: string = 'warrior_space_daily') => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('award_daily_warrior_completion', {
        p_user_id: user.id,
        p_activity_type: activityType
      });

      if (error) {
        console.error('Error awarding coins:', error);
        return false;
      }

      if (data) {
        toast.success('🎉 +20 Coins Earned!', {
          description: 'Daily Warrior Space completion reward'
        });
        await fetchCoinsData(); // Refresh data
        return true;
      }

      return false; // Already completed today
    } catch (error) {
      console.error('Error in awardDailyCompletion:', error);
      return false;
    }
  };

  // Unlock course with coins
  const unlockCourse = async (courseId: string, cost: number) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('unlock_course_with_coins', {
        p_user_id: user.id,
        p_course_id: courseId,
        p_cost: cost
      });

      if (error) {
        console.error('Error unlocking course:', error);
        toast.error('Failed to unlock course');
        return false;
      }

      if (data) {
        toast.success('Course unlocked successfully!');
        await fetchCoinsData(); // Refresh data
        return true;
      } else {
        toast.error('Insufficient coins to unlock this course');
        return false;
      }
    } catch (error) {
      console.error('Error in unlockCourse:', error);
      toast.error('Failed to unlock course');
      return false;
    }
  };

  // Check if course is unlocked
  const isCourseUnlocked = async (courseId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('course_unlocks')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCoinsData();
    }
  }, [user]);

  return {
    coins,
    transactions,
    loading,
    awardDailyCompletion,
    unlockCourse,
    isCourseUnlocked,
    refreshCoins: fetchCoinsData
  };
};
