
import { useEffect, useRef, useCallback } from 'react';

interface SubscriptionRef {
  id: string;
  subscription: any;
  created: Date;
  active: boolean;
}

export function useMemoryManager() {
  const subscriptionsRef = useRef<Map<string, SubscriptionRef>>(new Map());
  const cleanupCallbacksRef = useRef<Set<() => void>>(new Set());
  const isUnmountedRef = useRef(false);

  const registerSubscription = useCallback((id: string, subscription: any) => {
    console.log(`📝 Registering subscription: ${id}`);
    
    subscriptionsRef.current.set(id, {
      id,
      subscription,
      created: new Date(),
      active: true
    });
  }, []);

  const unregisterSubscription = useCallback((id: string) => {
    const sub = subscriptionsRef.current.get(id);
    if (sub && sub.active) {
      console.log(`🧹 Unregistering subscription: ${id}`);
      
      try {
        if (sub.subscription && typeof sub.subscription.unsubscribe === 'function') {
          sub.subscription.unsubscribe();
        }
      } catch (error) {
        console.warn(`⚠️ Error unsubscribing ${id}:`, error);
      }
      
      subscriptionsRef.current.delete(id);
    }
  }, []);

  const registerCleanup = useCallback((callback: () => void) => {
    cleanupCallbacksRef.current.add(callback);
    
    return () => {
      cleanupCallbacksRef.current.delete(callback);
    };
  }, []);

  const cleanupAll = useCallback(() => {
    if (isUnmountedRef.current) return;
    
    console.log('🧹 Starting comprehensive cleanup');
    
    // Cleanup all subscriptions
    subscriptionsRef.current.forEach((sub, id) => {
      unregisterSubscription(id);
    });
    
    // Run all cleanup callbacks
    cleanupCallbacksRef.current.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('⚠️ Error in cleanup callback:', error);
      }
    });
    
    cleanupCallbacksRef.current.clear();
    subscriptionsRef.current.clear();
    
    console.log('✅ Cleanup completed');
  }, [unregisterSubscription]);

  const getHealthStats = useCallback(() => {
    return {
      activeSubscriptions: subscriptionsRef.current.size,
      registeredCleanups: cleanupCallbacksRef.current.size,
      isUnmounted: isUnmountedRef.current
    };
  }, []);

  // Safety check for component unmount
  useEffect(() => {
    isUnmountedRef.current = false;
    
    return () => {
      isUnmountedRef.current = true;
      cleanupAll();
    };
  }, [cleanupAll]);

  return {
    registerSubscription,
    unregisterSubscription,
    registerCleanup,
    cleanupAll,
    getHealthStats,
    isUnmounted: () => isUnmountedRef.current
  };
}
