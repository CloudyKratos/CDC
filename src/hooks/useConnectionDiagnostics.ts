
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validatePolicies = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 Validating database policies...');
      
      // Test basic connectivity and policy execution
      const startTime = Date.now();
      
      // Test channels access
      const { data: channelsTest, error: channelsError } = await supabase
        .from('channels')
        .select('id')
        .limit(1);

      if (channelsError) {
        console.error('❌ Channels policy test failed:', channelsError);
        return false;
      }

      // Test workspace access
      const { data: workspacesTest, error: workspacesError } = await supabase
        .from('workspaces')
        .select('id')
        .limit(1);

      if (workspacesError) {
        console.error('❌ Workspaces policy test failed:', workspacesError);
        return false;
      }

      const latency = Date.now() - startTime;
      console.log(`✅ Policy validation successful (${latency}ms)`);
      
      setDiagnostics(prev => ({
        ...prev,
        networkLatency: latency,
        policyValidation: true
      }));

      return true;
    } catch (error) {
      console.error('💥 Policy validation exception:', error);
      return false;
    }
  }, []);

  const runDiagnostics = useCallback(async (): Promise<ConnectionDiagnostics> => {
    const startTime = Date.now();
    const errors: string[] = [];
    
    try {
      console.log('🏥 Running connection diagnostics...');
      
      // Test policy validation
      const policyValidation = await validatePolicies();
      if (!policyValidation) {
        errors.push('Policy validation failed');
      }

      // Test real-time connectivity
      let realtimeHealthy = false;
      try {
        const testChannel = supabase.channel('diagnostics-test');
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Realtime timeout')), 5000);
          
          testChannel.subscribe((status) => {
            clearTimeout(timeout);
            if (status === 'SUBSCRIBED') {
              realtimeHealthy = true;
              resolve(true);
            } else {
              reject(new Error(`Realtime failed: ${status}`));
            }
          });
        });
        
        supabase.removeChannel(testChannel);
      } catch (error) {
        console.error('❌ Realtime connectivity test failed:', error);
        errors.push('Realtime connectivity failed');
      }

      const latency = Date.now() - startTime;
      const isHealthy = policyValidation && realtimeHealthy && errors.length === 0;

      const result: ConnectionDiagnostics = {
        isHealthy,
        policyValidation,
        networkLatency: latency,
        lastChecked: new Date(),
        errors
      };

      setDiagnostics(result);
      console.log(`🏥 Diagnostics complete: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`, result);
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      
      const result: ConnectionDiagnostics = {
        isHealthy: false,
        policyValidation: false,
        networkLatency: Date.now() - startTime,
        lastChecked: new Date(),
        errors
      };

      setDiagnostics(result);
      return result;
    }
  }, [validatePolicies]);

  const startPeriodicCheck = useCallback((intervalMs: number = 30000) => {
    if (checkTimeoutRef.current) {
      clearInterval(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = setInterval(() => {
      runDiagnostics();
    }, intervalMs);

    // Run initial check
    runDiagnostics();
  }, [runDiagnostics]);

  const stopPeriodicCheck = useCallback(() => {
    if (checkTimeoutRef.current) {
      clearInterval(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }
  }, []);

  return {
    diagnostics,
    runDiagnostics,
    validatePolicies,
    startPeriodicCheck,
    stopPeriodicCheck
  };
}
