
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  level: number;
  total_xp: number;
  current_streak: number;
  completed_quests: number;
  total_coins: number;
  rank_name: string;
  last_updated: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useLeaderboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warrior_leaderboard')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('total_xp', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface with proper null checking
      return (data || []).map(item => ({
        ...item,
        profiles: item.profiles && typeof item.profiles === 'object' && !Array.isArray(item.profiles) ? {
          full_name: item.profiles.full_name || null,
          avatar_url: item.profiles.avatar_url || null
        } : null
      })) as LeaderboardEntry[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user's leaderboard stats
  const updateLeaderboardMutation = useMutation({
    mutationFn: async (stats: {
      level: number;
      total_xp: number;
      current_streak: number;
      completed_quests: number;
      total_coins: number;
      rank_name: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('update_warrior_leaderboard', {
        p_user_id: user.id,
        p_level: stats.level,
        p_total_xp: stats.total_xp,
        p_current_streak: stats.current_streak,
        p_completed_quests: stats.completed_quests,
        p_total_coins: stats.total_coins,
        p_rank_name: stats.rank_name,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('Leaderboard updated!');
    },
    onError: (error) => {
      console.error('Error updating leaderboard:', error);
      toast.error('Failed to update leaderboard');
    },
  });

  return {
    leaderboard,
    isLoading,
    error,
    updateLeaderboard: updateLeaderboardMutation.mutate,
    isUpdating: updateLeaderboardMutation.isPending,
  };
};
