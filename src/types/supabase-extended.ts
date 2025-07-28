
// User and Role types
export type UserRole = 'admin' | 'moderator' | 'user';

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isHidden: boolean;
  profile?: {
    id: string;
    full_name?: string;
    email?: string;
    username?: string;
    created_at?: string;
  };
}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  moderatorCount: number;
  memberCount: number;
  activeUsers: number;
}

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalStages: number;
  activeStages: number;
  totalMessages: number;
  userGrowth: number;
}

// Stage types
export type StageStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
export type StageRole = 'moderator' | 'speaker' | 'audience';

export interface ExtendedStage {
  id: string;
  title: string;
  name: string; // Required by database
  description?: string;
  topic?: string;
  status: StageStatus;
  creator_id: string;
  host_id: string;
  workspace_id?: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  participant_count?: number;
  max_speakers?: number;
  max_audience?: number;
  max_participants?: number;
  scheduled_start_time?: string;
  actual_start_time?: string;
  end_time?: string;
  allow_hand_raising?: boolean;
  recording_enabled?: boolean;
}

export interface ExtendedStageInsert {
  title: string;
  name: string; // Required by database
  description?: string;
  topic?: string;
  status?: StageStatus;
  creator_id: string;
  host_id: string;
  workspace_id?: string;
  is_active?: boolean;
  max_speakers?: number;
  max_audience?: number;
  max_participants?: number;
  scheduled_start_time?: string;
  actual_start_time?: string;
  allow_hand_raising?: boolean;
  recording_enabled?: boolean;
}

// Stage Participant types
export interface StageParticipant {
  id: string;
  stage_id: string;
  user_id: string;
  role: StageRole;
  joined_at: string;
  left_at?: string;
  created_at: string;
  updated_at: string;
  is_muted?: boolean;
  is_video_enabled?: boolean;
  is_hand_raised?: boolean;
  profiles?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface StageParticipantInsert {
  stage_id: string;
  user_id: string;
  role: StageRole;
  is_muted?: boolean;
  is_video_enabled?: boolean;
  is_hand_raised?: boolean;
}

// Speaker Request types
export interface ExtendedSpeakerRequest {
  id: string;
  stage_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'denied';
  message?: string;
  requested_at: string;
  responded_at?: string;
  responded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExtendedSpeakerRequestInsert {
  stage_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'denied';
  message?: string;
  requested_at: string;
}

// Calendar and Event types
export interface EnhancedEventData {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_by: string;
  workspace_id?: string;
  event_type: 'mission_call' | 'workshop' | 'meeting' | 'social';
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  max_attendees?: number;
  is_recurring: boolean;
  recurrence_pattern?: any;
  cohort_id?: string;
  coach_id?: string;
  resources?: any;
  xp_reward?: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
  replay_url?: string;
  meeting_url?: string;
  visibility_level: 'public' | 'private' | 'restricted';
}

export type CalendarEventType = 'mission_call' | 'workshop' | 'meeting' | 'social';

// Messaging types
export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  is_deleted: boolean;
  reply_to_id?: string;
  sender?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  participant_ids: string[];
  unread_count?: number;
  last_message?: DirectMessage;
  other_participant?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}
