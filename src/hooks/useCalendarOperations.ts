import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CalendarEventData, CalendarEventFormState } from '@/types/calendar-events';
import CalendarServiceCore from '@/services/calendar/CalendarServiceCore';

export const useCalendarOperations = () => {
  const [formState, setFormState] = useState<CalendarEventFormState>({
    data: {},
    isLoading: false,
    isSubmitting: false,
    isDirty: false,
    errors: []
  });

  const updateFormData = useCallback((updates: Partial<CalendarEventData>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates },
      isDirty: true,
      errors: [] // Clear errors when user makes changes
    }));
  }, []);

  const createEvent = useCallback(async (eventData: CalendarEventData): Promise<boolean> => {
    console.log('🎯 useCalendarOperations: Creating event');
    
    setFormState(prev => ({ ...prev, isSubmitting: true, errors: [] }));
    
    try {
      const newEvent = await CalendarServiceCore.createEvent(eventData);
      toast.success('Event created successfully!');
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isDirty: false,
        lastSaved: new Date()
      }));
      return true;
    } catch (error) {
      console.error('💥 useCalendarOperations: Unexpected error:', error);
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: ['An unexpected error occurred']
      }));
      toast.error('Failed to create event');
      return false;
    }
  }, []);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEventData>): Promise<boolean> => {
    console.log('🔄 useCalendarOperations: Updating event');
    
    setFormState(prev => ({ ...prev, isSubmitting: true, errors: [] }));
    
    try {
      const response = await CalendarServiceCore.updateEvent(id, updates);
      
      if (response.success) {
        toast.success('Event updated successfully!');
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          isDirty: false,
          lastSaved: new Date()
        }));
        return true;
      } else {
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          errors: [response.error || 'Failed to update event']
        }));
        return false;
      }
    } catch (error) {
      console.error('💥 useCalendarOperations: Unexpected error:', error);
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: ['An unexpected error occurred']
      }));
      toast.error('Failed to update event');
      return false;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    console.log('🗑️ useCalendarOperations: Deleting event');
    
    try {
      const response = await CalendarServiceCore.deleteEvent(id);
      
      if (response.success) {
        toast.success('Event deleted successfully!');
        return true;
      } else {
        toast.error(response.error || 'Failed to delete event');
        return false;
      }
    } catch (error) {
      console.error('💥 useCalendarOperations: Unexpected error:', error);
      toast.error('Failed to delete event');
      return false;
    }
  }, []);

  return {
    formState,
    updateFormData,
    createEvent,
    updateEvent,
    deleteEvent
  };
};
