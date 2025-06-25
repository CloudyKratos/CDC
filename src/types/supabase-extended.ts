
import { Database } from '@/integrations/supabase/types';

// Extended types for stages table with the new columns we added
export interface ExtendedStage extends Database['public']['Tables']['stages']['Row'] {
  title: string;
  topic?: string;
  creator_id: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_start_time?: string;
  actual_start_time?: string;
  end_time?: string;
  max_speakers?: number;
  max_audience?: number;
  allow_hand_raising?: boolean;
  recording_enabled?: boolean;
}

// Extended insert type for stages
export interface ExtendedStageInsert extends Omit<Database['public']['Tables']['stages']['Insert'], 'title' | 'creator_id'> {
  title: string;
  topic?: string;
  creator_id: string;
  status?: 'scheduled' | 'live' | 'ended';
  scheduled_start_time?: string;
  max_speakers?: number;
  max_audience?: number;
  allow_hand_raising?: boolean;
  recording_enabled?: boolean;
}

// Extended types for stage_participants (if not in auto-generated types)
export interface StageParticipant {
  id: string;
  stage_id: string;
  user_id: string;
  role: 'moderator' | 'speaker' | 'audience';
  is_muted?: boolean;
  is_video_enabled?: boolean;
  is_hand_raised?: boolean;
  joined_at?: string;
  left_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StageParticipantInsert {
  stage_id: string;
  user_id: string;
  role?: 'moderator' | 'speaker' | 'audience';
  is_muted?: boolean;
  is_video_enabled?: boolean;
  is_hand_raised?: boolean;
}

// Extended types for speaker_requests with new columns
export interface ExtendedSpeakerRequest extends Database['public']['Tables']['speaker_requests']['Row'] {
  requested_at?: string;
  responded_at?: string;
  responded_by?: string;
  status: 'pending' | 'approved' | 'denied';
}

export interface ExtendedSpeakerRequestInsert {
  stage_id: string;
  user_id: string;
  status?: 'pending' | 'approved' | 'denied';
  requested_at?: string;
}

// Extended types for user_roles
export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  assigned_at?: string;
  assigned_by?: string;
  workspace_id?: string;
}

export interface UserRoleInsert {
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  assigned_by?: string;
  workspace_id?: string;
}

// Extended types for events table
export interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_by: string;
  workspace_id?: string;
  event_type?: string;
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
  visibility_level?: string;
  xp_reward?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventInsert {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_by: string;
  workspace_id?: string;
  event_type?: string;
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
  visibility_level?: string;
  xp_reward?: number;
}

// Type helpers for common operations
export type StageRole = 'moderator' | 'speaker' | 'audience';
export type StageStatus = 'scheduled' | 'live' | 'ended';
export type SpeakerRequestStatus = 'pending' | 'approved' | 'denied';
export type UserRoleType = 'admin' | 'moderator' | 'user';
