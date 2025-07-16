
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface UseProfileCompletionReturn {
  completionPercentage: number;
  loading: boolean;
  refreshCompletion: () => Promise<void>;
}

export const useProfileCompletion = (user: User | null): UseProfileCompletionReturn => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCompletion = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_profile_completion_percentage', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching profile completion:', error);
        return;
      }

      setCompletionPercentage(data || 0);
    } catch (error) {
      console.error('Error fetching profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletion();
  }, [user?.id]);

  const refreshCompletion = async () => {
    await fetchCompletion();
  };

  return {
    completionPercentage,
    loading,
    refreshCompletion
  };
};
