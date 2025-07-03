
import { useState, useCallback, useRef } from 'react';

interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  monitoringPeriodMs: number;
  successThreshold: number;
}

export function useCircuitBreaker(config: Partial<CircuitBreakerConfig> = {}) {
  const defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    resetTimeoutMs: 60000, // 1 minute
    monitoringPeriodMs: 10000, // 10 seconds
    successThreshold: 3,
    ...config
  };

  const [state, setState] = useState<CircuitBreakerState>({
    state: 'CLOSED',
    failureCount: 0,
    lastFailureTime: 0,
    successCount: 0
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const recordSuccess = useCallback(() => {
    setState(prev => {
      const newSuccessCount = prev.successCount + 1;
      
      // If we're in HALF_OPEN and have enough successes, close the circuit
      if (prev.state === 'HALF_OPEN' && newSuccessCount >= defaultConfig.successThreshold) {
        console.log('🔄 Circuit breaker: HALF_OPEN -> CLOSED (success threshold reached)');
        return {
          state: 'CLOSED',
          failureCount: 0,
          lastFailureTime: 0,
          successCount: 0
        };
      }

      return {
        ...prev,
        successCount: newSuccessCount,
        failureCount: Math.max(0, prev.failureCount - 1) // Reduce failure count on success
      };
    });
  }, [defaultConfig.successThreshold]);

  const recordFailure = useCallback(() => {
    const now = Date.now();
    
    setState(prev => {
      const newFailureCount = prev.failureCount + 1;
      
      // If failure threshold exceeded, open the circuit
      if (newFailureCount >= defaultConfig.failureThreshold && prev.state === 'CLOSED') {
        console.warn(`⚠️ Circuit breaker: CLOSED -> OPEN (${newFailureCount} failures)`);
        
        // Set timeout to transition to HALF_OPEN
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          console.log('🔄 Circuit breaker: OPEN -> HALF_OPEN (timeout reached)');
          setState(current => ({
            ...current,
            state: 'HALF_OPEN',
            successCount: 0
          }));
        }, defaultConfig.resetTimeoutMs);

        return {
          state: 'OPEN',
          failureCount: newFailureCount,
          lastFailureTime: now,
          successCount: 0
        };
      }

      // If in HALF_OPEN and we fail, go back to OPEN
      if (prev.state === 'HALF_OPEN') {
        console.warn('⚠️ Circuit breaker: HALF_OPEN -> OPEN (failure during test)');
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setState(current => ({
            ...current,
            state: 'HALF_OPEN',
            successCount: 0
          }));
        }, defaultConfig.resetTimeoutMs);

        return {
          state: 'OPEN',
          failureCount: newFailureCount,
          lastFailureTime: now,
          successCount: 0
        };
      }

      return {
        ...prev,
        failureCount: newFailureCount,
        lastFailureTime: now
      };
    });
  }, [defaultConfig.failureThreshold, defaultConfig.resetTimeoutMs]);

  const canExecute = useCallback(() => {
    return state.state === 'CLOSED' || state.state === 'HALF_OPEN';
  }, [state.state]);

  const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    if (!canExecute()) {
      throw new Error('Circuit breaker is OPEN - operation blocked');
    }

    try {
      const result = await operation();
      recordSuccess();
      return result;
    } catch (error) {
      recordFailure();
      throw error;
    }
  }, [canExecute, recordSuccess, recordFailure]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setState({
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0
    });
    
    console.log('🔄 Circuit breaker manually reset');
  }, []);

  return {
    state: state.state,
    failureCount: state.failureCount,
    successCount: state.successCount,
    canExecute,
    execute,
    recordSuccess,
    recordFailure,
    reset
  };
}
