
// Extended types for Supabase database tables
export interface ExtendedStage {
  id: string;
  title: string;
  description?: string;
  topic?: string;
  status: StageStatus;
  creator_id: string;
  host_id: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  participant_count?: number;
  max_speakers?: number;
  max_audience?: number;
  scheduled_start_time?: string;
  actual_start_time?: string;
  end_time?: string;
  allow_hand_raising?: boolean;
  recording_enabled?: boolean;
}

export interface ExtendedStageInsert {
  title: string;
  description?: string;
  topic?: string;
  status?: StageStatus;
  creator_id: string;
  host_id: string;
  is_active?: boolean;
  max_speakers?: number;
  max_audience?: number;
  scheduled_start_time?: string;
  actual_start_time?: string;
  allow_hand_raising?: boolean;
  recording_enabled?: boolean;
}

export type StageStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export interface StageParticipant {
  id: string;
  stage_id: string;
  user_id: string;
  role: 'moderator' | 'speaker' | 'audience';
  joined_at: string;
  left_at?: string;
  is_muted?: boolean;
  hand_raised?: boolean;
}
