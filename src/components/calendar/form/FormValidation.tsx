
import { EventData } from '@/services/SupabaseService';

export const validateEventForm = (formData: Partial<EventData>): string[] => {
  console.log('🔍 Form: Validating form with data:', formData);
  const errors: string[] = [];

  // Required field validation
  if (!formData.title || !formData.title.trim()) {
    errors.push('Event title is required');
  }

  if (!formData.start_time) {
    errors.push('Start date and time are required');
  }

  if (!formData.end_time) {
    errors.push('End date and time are required');
  }

  // Date validation
  if (formData.start_time && formData.end_time) {
    const startDateTime = new Date(formData.start_time);
    const endDateTime = new Date(formData.end_time);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      errors.push('Invalid date/time format');
    } else {
      if (endDateTime <= startDateTime) {
        errors.push('End time must be after start time');
      }

      // Check if event is in the past (with 5 minute grace period)
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      if (startDateTime < fiveMinutesAgo) {
        errors.push('Cannot create events in the past');
      }

      // Check duration
      const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
      if (durationHours > 8) {
        errors.push('Event duration cannot exceed 8 hours');
      }
      if (durationHours < 0.25) {
        errors.push('Event must be at least 15 minutes long');
      }
    }
  }

  // Additional validation
  if (formData.max_attendees && formData.max_attendees < 1) {
    errors.push('Maximum attendees must be at least 1');
  }

  if (formData.xp_reward && (formData.xp_reward < 0 || formData.xp_reward > 100)) {
    errors.push('XP reward must be between 0 and 100');
  }

  if (formData.meeting_url && formData.meeting_url.trim() && !isValidUrl(formData.meeting_url.trim())) {
    errors.push('Please enter a valid meeting URL');
  }

  if (errors.length > 0) {
    console.log('❌ Form: Validation errors:', errors);
  } else {
    console.log('✅ Form: Validation passed');
  }

  return errors;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
