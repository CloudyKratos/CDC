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
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          id: string
          start_time: string
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          title?: string
          updated_at?: string
          workspace_id?: string | null
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
      get_user_role: {
        Args: { _user_id: string; _workspace_id?: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      is_workspace_owner: {
        Args: { workspace_id: string }
        Returns: boolean
      }
      setup_cdc_account: {
        Args: { cdc_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "member"
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
      speaker_request_status: ["pending", "approved", "rejected"],
      stage_role: ["moderator", "speaker", "audience"],
      stage_status: ["scheduled", "live", "ended"],
    },
  },
} as const
