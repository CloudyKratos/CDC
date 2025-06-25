
import { Database } from '@/integrations/supabase/types';

// Extended types for stages table - using actual database schema
export interface ExtendedStage extends Database['public']['Tables']['stages']['Row'] {
  // All properties are inherited from the base type which includes:
  // id, title, description, status, creator_id, host_id, etc.
}

// Extended insert type for stages
export interface ExtendedStageInsert extends Database['public']['Tables']['stages']['Insert'] {
  // All properties are inherited from the base type
}

// Extended types for stage_participants with profile data - using actual schema
export interface StageParticipant extends Database['public']['Tables']['stage_participants']['Row'] {
  profiles?: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

export interface StageParticipantInsert extends Database['public']['Tables']['stage_participants']['Insert'] {
  // All properties are inherited from the base type
}

// Extended types for speaker_requests - using actual schema
export interface ExtendedSpeakerRequest extends Database['public']['Tables']['speaker_requests']['Row'] {
  // All properties are inherited from the base type which includes:
  // id, stage_id, user_id, status, requested_at, responded_at, responded_by, message
}

export interface ExtendedSpeakerRequestInsert extends Database['public']['Tables']['speaker_requests']['Insert'] {
  // All properties are inherited from the base type
}

// Extended types for user_roles
export interface UserRole extends Database['public']['Tables']['user_roles']['Row'] {
  // All properties are inherited from the base type
}

export interface UserRoleInsert extends Database['public']['Tables']['user_roles']['Insert'] {
  // All properties are inherited from the base type
}

// Extended types for events table
export interface Event extends Database['public']['Tables']['events']['Row'] {
  // All properties are inherited from the base type
}

export interface EventInsert extends Database['public']['Tables']['events']['Insert'] {
  // All properties are inherited from the base type
}

// Service response types
export interface StageAccessValidation {
  canAccess: boolean;
  reason?: string;
}

// Type helpers for common operations
export type StageRole = 'moderator' | 'speaker' | 'audience';
export type StageStatus = 'scheduled' | 'live' | 'ended';
export type SpeakerRequestStatus = 'pending' | 'approved' | 'denied';
export type UserRoleType = 'admin' | 'moderator' | 'user';

// Calendar event type that matches SupabaseService EventData
export type CalendarEventType = 
  | 'mission_call'
  | 'reflection_hour' 
  | 'wisdom_drop'
  | 'tribe_meetup'
  | 'office_hours'
  | 'accountability_circle'
  | 'solo_ritual'
  | 'workshop'
  | 'course_drop'
  | 'challenge_sprint'
  | 'deep_work_day';
