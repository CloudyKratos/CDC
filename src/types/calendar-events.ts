
// Unified Calendar Event Data Types - aligned with EnhancedEventData
export interface CalendarEventData {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type?: 'mission_call' | 'workshop' | 'meeting' | 'social' | 'reflection_hour' | 'wisdom_drop' | 'tribe_meetup' | 'office_hours' | 'accountability_circle' | 'solo_ritual' | 'course_drop' | 'challenge_sprint' | 'deep_work_day';
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
  max_attendees?: number;
  is_recurring?: boolean;
  recurrence_pattern?: any;
  tags?: string[];
  cohort_id?: string;
  coach_id?: string;
  replay_url?: string;
  meeting_url?: string;
  resources?: any;
  visibility_level?: 'public' | 'private' | 'restricted';
  xp_reward?: number;
  created_by?: string;
  workspace_id?: string;
}

export interface CalendarEventValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface CalendarEventFormState {
  data: Partial<CalendarEventData>;
  isLoading: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  errors: string[];
  lastSaved?: Date;
}

export interface CalendarServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
