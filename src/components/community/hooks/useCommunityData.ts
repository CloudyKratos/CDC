import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

export function useCommunityData() {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .eq('type', 'public');

        if (error) {
          throw new Error(error.message);
        }

        setChannels(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchChannels();
    }
  }, [user]);

  return {
    channels,
    isLoading,
    error
  };
}

