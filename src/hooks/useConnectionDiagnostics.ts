
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectionDiagnostics {
  isHealthy: boolean;
  policyValidation: boolean;
  networkLatency: number;
  lastChecked: Date | null;
  errors: string[];
}

export function useConnectionDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<ConnectionDiagnostics>({
    isHealthy: false,
    policyValidation: false,
    networkLatency: 0,
    lastChecked: null,
    errors: []
  });

  const { user } = useAuth();

  const runDiagnostics = useCallback(async (): Promise<ConnectionDiagnostics> => {
    const startTime = Date.now();
    const errors: string[] = [];
    let policyValidation = false;

    console.log('🔍 Running connection diagnostics...');

    try {
      // Test basic connectivity
      const { error: pingError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (pingError) {
        errors.push(`Connection test failed: ${pingError.message}`);
      }

      // Test RLS policies if user is authenticated
      if (user?.id) {
        // Test profile access
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          errors.push(`Profile access failed: ${profileError.message}`);
        } else {
          policyValidation = true;
        }

        // Test channel access
        const { data: channels, error: channelsError } = await supabase
          .from('channels')
          .select('id, name')
          .limit(1);

        if (channelsError) {
          errors.push(`Channel access failed: ${channelsError.message}`);
        }

        // Test message posting ability
        const { data: testMessage, error: messageError } = await supabase
          .from('community_messages')
          .select('id')
          .eq('sender_id', user.id)
          .limit(1);

        if (messageError) {
          errors.push(`Message access failed: ${messageError.message}`);
        }
      }

      const networkLatency = Date.now() - startTime;
      const isHealthy = errors.length === 0;

      const result: ConnectionDiagnostics = {
        isHealthy,
        policyValidation,
        networkLatency,
        lastChecked: new Date(),
        errors
      };

      setDiagnostics(result);
      console.log('🔍 Diagnostics complete:', result);
      
      return result;

    } catch (error) {
      const networkLatency = Date.now() - startTime;
      const result: ConnectionDiagnostics = {
        isHealthy: false,
        policyValidation: false,
        networkLatency,
        lastChecked: new Date(),
        errors: [`Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };

      setDiagnostics(result);
      console.error('💥 Diagnostics failed:', error);
      
      return result;
    }
  }, [user?.id]);

  const startPeriodicCheck = useCallback((intervalMs: number = 30000) => {
    const interval = setInterval(runDiagnostics, intervalMs);
    return () => clearInterval(interval);
  }, [runDiagnostics]);

  const stopPeriodicCheck = useCallback(() => {
    // This would be handled by the cleanup function returned by startPeriodicCheck
  }, []);

  return {
    diagnostics,
    runDiagnostics,
    startPeriodicCheck,
    stopPeriodicCheck
  };
}
