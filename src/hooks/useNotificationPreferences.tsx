
import { useState, useEffect } from 'react';
import { NotificationPreferences } from '@/types/notifications';
import { NotificationService } from '@/services/NotificationService';

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const prefs = await NotificationService.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      const success = await NotificationService.updatePreferences(updates);
      if (success && preferences) {
        setPreferences({ ...preferences, ...updates });
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      return false;
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    reloadPreferences: loadPreferences
  };
};
