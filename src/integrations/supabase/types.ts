export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cohort_members: {
        Row: {
          cohort_id: string | null
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          cohort_id?: string | null
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          cohort_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          is_deleted: boolean | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          event_id: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          event_id?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          event_id?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_comments: {
        Row: {
          comment_type: string | null
          content: string
          created_at: string | null
          event_id: string | null
          id: string
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment_type?: string | null
          content: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment_type?: string | null
          content?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_comments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "event_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reminders: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          is_sent: boolean | null
          minutes_before: number
          reminder_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_sent?: boolean | null
          minutes_before: number
          reminder_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_sent?: boolean | null
          minutes_before?: number
          reminder_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          status: Database["public"]["Enums"]["rsvp_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          coach_id: string | null
          cohort_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"] | null
          id: string
          is_recurring: boolean | null
          max_attendees: number | null
          meeting_url: string | null
          recurrence_pattern: Json | null
          replay_url: string | null
          resources: Json | null
          start_time: string
          status: Database["public"]["Enums"]["event_status"] | null
          tags: string[] | null
          title: string
          updated_at: string
          visibility_level: string | null
          workspace_id: string | null
          xp_reward: number | null
        }
        Insert: {
          coach_id?: string | null
          cohort_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          event_type?: Database["public"]["Enums"]["event_type"] | null
          id?: string
          is_recurring?: boolean | null
          max_attendees?: number | null
          meeting_url?: string | null
          recurrence_pattern?: Json | null
          replay_url?: string | null
          resources?: Json | null
          start_time: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          visibility_level?: string | null
          workspace_id?: string | null
          xp_reward?: number | null
        }
        Update: {
          coach_id?: string | null
          cohort_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_type?: Database["public"]["Enums"]["event_type"] | null
          id?: string
          is_recurring?: boolean | null
          max_attendees?: number | null
          meeting_url?: string | null
          recurrence_pattern?: Json | null
          replay_url?: string | null
          resources?: Json | null
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          visibility_level?: string | null
          workspace_id?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      member_locations: {
        Row: {
          city: string | null
          country: string
          country_code: string
          created_at: string
          id: string
          is_location_visible: boolean | null
          latitude: number | null
          longitude: number | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          country: string
          country_code: string
          created_at?: string
          id?: string
          is_location_visible?: boolean | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string
          country_code?: string
          created_at?: string
          id?: string
          is_location_visible?: boolean | null
          latitude?: number | null
          longitude?: number | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      member_online_status: {
        Row: {
          is_online: boolean | null
          last_seen: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean | null
          sender_id: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          sender_id?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          sender_id?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          location?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      speaker_requests: {
        Row: {
          id: string
          requested_at: string
          responded_at: string | null
          responded_by: string | null
          stage_id: string
          status: Database["public"]["Enums"]["speaker_request_status"]
          user_id: string
        }
        Insert: {
          id?: string
          requested_at?: string
          responded_at?: string | null
          responded_by?: string | null
          stage_id: string
          status?: Database["public"]["Enums"]["speaker_request_status"]
          user_id: string
        }
        Update: {
          id?: string
          requested_at?: string
          responded_at?: string | null
          responded_by?: string | null
          stage_id?: string
          status?: Database["public"]["Enums"]["speaker_request_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_speaker_requests_stage_id"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_speaker_requests_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speaker_requests_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_participants: {
        Row: {
          id: string
          is_hand_raised: boolean | null
          is_muted: boolean | null
          is_video_enabled: boolean | null
          joined_at: string
          left_at: string | null
          role: Database["public"]["Enums"]["stage_role"]
          stage_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_hand_raised?: boolean | null
          is_muted?: boolean | null
          is_video_enabled?: boolean | null
          joined_at?: string
          left_at?: string | null
          role?: Database["public"]["Enums"]["stage_role"]
          stage_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_hand_raised?: boolean | null
          is_muted?: boolean | null
          is_video_enabled?: boolean | null
          joined_at?: string
          left_at?: string | null
          role?: Database["public"]["Enums"]["stage_role"]
          stage_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_stage_participants_stage_id"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stage_participants_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_participants_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          actual_start_time: string | null
          allow_hand_raising: boolean | null
          created_at: string
          creator_id: string
          description: string | null
          end_time: string | null
          id: string
          max_audience: number | null
          max_speakers: number | null
          recording_enabled: boolean | null
          scheduled_start_time: string | null
          status: Database["public"]["Enums"]["stage_status"]
          title: string
          topic: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          actual_start_time?: string | null
          allow_hand_raising?: boolean | null
          created_at?: string
          creator_id: string
          description?: string | null
          end_time?: string | null
          id?: string
          max_audience?: number | null
          max_speakers?: number | null
          recording_enabled?: boolean | null
          scheduled_start_time?: string | null
          status?: Database["public"]["Enums"]["stage_status"]
          title: string
          topic?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          actual_start_time?: string | null
          allow_hand_raising?: boolean | null
          created_at?: string
          creator_id?: string
          description?: string | null
          end_time?: string | null
          id?: string
          max_audience?: number | null
          max_speakers?: number | null
          recording_enabled?: boolean | null
          scheduled_start_time?: string | null
          status?: Database["public"]["Enums"]["stage_status"]
          title?: string
          topic?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          joined_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          joined_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          joined_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_user_access_events: {
        Args: { _user_id: string }
        Returns: boolean
      }
      create_admin_account: {
        Args: {
          admin_email: string
          admin_name: string
          admin_password: string
        }
        Returns: string
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_event_with_stats: {
        Args: { event_id_param: string }
        Returns: {
          id: string
          title: string
          description: string
          start_time: string
          end_time: string
          created_by: string
          workspace_id: string
          created_at: string
          updated_at: string
          event_type: Database["public"]["Enums"]["event_type"]
          status: Database["public"]["Enums"]["event_status"]
          max_attendees: number
          is_recurring: boolean
          recurrence_pattern: Json
          tags: string[]
          cohort_id: string
          coach_id: string
          replay_url: string
          meeting_url: string
          resources: Json
          visibility_level: string
          xp_reward: number
          rsvp_count: number
          attendance_count: number
          comment_count: number
          user_rsvp_status: Database["public"]["Enums"]["rsvp_status"]
        }[]
      }
      get_stage_with_counts: {
        Args: { stage_id_param: string }
        Returns: {
          id: string
          workspace_id: string
          creator_id: string
          title: string
          description: string
          topic: string
          status: Database["public"]["Enums"]["stage_status"]
          scheduled_start_time: string
          actual_start_time: string
          end_time: string
          max_speakers: number
          max_audience: number
          allow_hand_raising: boolean
          recording_enabled: boolean
          created_at: string
          updated_at: string
          speaker_count: number
          audience_count: number
          pending_requests_count: number
        }[]
      }
      get_user_events: {
        Args: { _user_id: string }
        Returns: {
          id: string
          title: string
          description: string
          start_time: string
          end_time: string
          event_type: Database["public"]["Enums"]["event_type"]
          status: Database["public"]["Enums"]["event_status"]
          max_attendees: number
          is_recurring: boolean
          recurrence_pattern: Json
          tags: string[]
          cohort_id: string
          coach_id: string
          replay_url: string
          meeting_url: string
          resources: Json
          visibility_level: string
          xp_reward: number
          created_by: string
          workspace_id: string
          created_at: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string; _workspace_id?: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_workspace_role: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _workspace_id?: string
        }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { workspace_id: string }
        Returns: boolean
      }
      is_workspace_member_safe: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      is_workspace_owner: {
        Args: { workspace_id: string }
        Returns: boolean
      }
      is_workspace_owner_safe: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      setup_cdc_account: {
        Args: { cdc_user_id: string }
        Returns: boolean
      }
      update_user_online_status: {
        Args: { is_online_param: boolean }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "member"
      event_status: "scheduled" | "live" | "completed" | "cancelled"
      event_type:
        | "mission_call"
        | "reflection_hour"
        | "wisdom_drop"
        | "tribe_meetup"
        | "office_hours"
        | "accountability_circle"
        | "solo_ritual"
        | "workshop"
        | "course_drop"
        | "challenge_sprint"
        | "deep_work_day"
      rsvp_status: "going" | "maybe" | "not_going"
      speaker_request_status: "pending" | "approved" | "rejected"
      stage_role: "moderator" | "speaker" | "audience"
      stage_status: "scheduled" | "live" | "ended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "member"],
      event_status: ["scheduled", "live", "completed", "cancelled"],
      event_type: [
        "mission_call",
        "reflection_hour",
        "wisdom_drop",
        "tribe_meetup",
        "office_hours",
        "accountability_circle",
        "solo_ritual",
        "workshop",
        "course_drop",
        "challenge_sprint",
        "deep_work_day",
      ],
      rsvp_status: ["going", "maybe", "not_going"],
      speaker_request_status: ["pending", "approved", "rejected"],
      stage_role: ["moderator", "speaker", "audience"],
      stage_status: ["scheduled", "live", "ended"],
    },
  },
} as const
