
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export interface UseFormAutoSaveOptions {
  onSave: () => Promise<boolean>;
  delay?: number;
  enabled?: boolean;
}

export const useFormAutoSave = ({
  onSave,
  delay = 2000,
  enabled = false
}: UseFormAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const savingRef = useRef(false);

  const debouncedSave = useCallback(async () => {
    if (savingRef.current) return;

    try {
      savingRef.current = true;
      const success = await onSave();
      if (success) {
        toast.success('Changes saved automatically', {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      savingRef.current = false;
    }
  }, [onSave]);

  const triggerAutoSave = useCallback(() => {
    if (!enabled || savingRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(debouncedSave, delay);
  }, [debouncedSave, delay, enabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { triggerAutoSave };
};
