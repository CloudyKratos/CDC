
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Coins, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface UnlockHistoryItem {
  id: string;
  course_id: string;
  cost: number;
  unlocked_at: string;
  course: {
    title: string;
    type: string;
    instructor: string;
    category: string;
  };
}

const UnlockHistory: React.FC = () => {
  const [unlocks, setUnlocks] = useState<UnlockHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnlockHistory();
  }, []);

  const fetchUnlockHistory = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('course_unlocks')
        .select(`
          id,
          course_id,
          cost,
          unlocked_at,
          courses!inner (
            title,
            type,
            instructor,
            category
          )
        `)
        .eq('user_id', user.user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = data?.map(item => ({
        ...item,
        course: item.courses as any
      })) || [];
      
      setUnlocks(transformedData);
    } catch (error) {
      console.error('Error fetching unlock history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recording': return '🎥';
      case 'workshop': return '🛠️';
      default: return '📚';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unlock History</CardTitle>
          <CardDescription>Your premium content unlocks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Unlock History
        </CardTitle>
        <CardDescription>Your premium content unlocks</CardDescription>
      </CardHeader>
      <CardContent>
        {unlocks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No unlocks yet</p>
            <p className="text-sm">Start unlocking premium content to see your history!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unlocks.map((unlock) => (
              <div key={unlock.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getTypeIcon(unlock.course.type)}</span>
                    <h4 className="font-medium">{unlock.course.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {unlock.course.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>👨‍🏫 {unlock.course.instructor}</span>
                    <span>📂 {unlock.course.category}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(unlock.unlocked_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                    <Coins className="w-4 h-4" />
                    {unlock.cost}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(unlock.unlocked_at), 'h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnlockHistory;
