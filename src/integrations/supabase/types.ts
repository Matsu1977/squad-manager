export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      match_stats: {
        Row: {
          assists: number
          created_at: string
          goals: number
          id: string
          match_id: string
          minutes_played: number
          player_id: string
          red_cards: number
          updated_at: string
          yellow_cards: number
        }
        Insert: {
          assists?: number
          created_at?: string
          goals?: number
          id?: string
          match_id: string
          minutes_played?: number
          player_id: string
          red_cards?: number
          updated_at?: string
          yellow_cards?: number
        }
        Update: {
          assists?: number
          created_at?: string
          goals?: number
          id?: string
          match_id?: string
          minutes_played?: number
          player_id?: string
          red_cards?: number
          updated_at?: string
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          formation: string | null
          home_or_away: string
          id: string
          location: string | null
          match_date: string
          notes: string | null
          opponent: string
          score_opponent: number | null
          score_team: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          formation?: string | null
          home_or_away?: string
          id?: string
          location?: string | null
          match_date: string
          notes?: string | null
          opponent: string
          score_opponent?: number | null
          score_team?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          formation?: string | null
          home_or_away?: string
          id?: string
          location?: string | null
          match_date?: string
          notes?: string | null
          opponent?: string
          score_opponent?: number | null
          score_team?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string | null
          first_name: string
          height_cm: number | null
          id: string
          jersey_number: number | null
          last_name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          preferred_foot: Database["public"]["Enums"]["preferred_foot"] | null
          rating_defending: number | null
          rating_dribbling: number | null
          rating_pace: number | null
          rating_passing: number | null
          rating_physical: number | null
          rating_shooting: number | null
          role: Database["public"]["Enums"]["player_role"]
          status: Database["public"]["Enums"]["player_status"]
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          height_cm?: number | null
          id?: string
          jersey_number?: number | null
          last_name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          preferred_foot?: Database["public"]["Enums"]["preferred_foot"] | null
          rating_defending?: number | null
          rating_dribbling?: number | null
          rating_pace?: number | null
          rating_passing?: number | null
          rating_physical?: number | null
          rating_shooting?: number | null
          role: Database["public"]["Enums"]["player_role"]
          status?: Database["public"]["Enums"]["player_status"]
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          height_cm?: number | null
          id?: string
          jersey_number?: number | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          preferred_foot?: Database["public"]["Enums"]["preferred_foot"] | null
          rating_defending?: number | null
          rating_dribbling?: number | null
          rating_pace?: number | null
          rating_passing?: number | null
          rating_physical?: number | null
          rating_shooting?: number | null
          role?: Database["public"]["Enums"]["player_role"]
          status?: Database["public"]["Enums"]["player_status"]
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      training_attendances: {
        Row: {
          attended: boolean
          created_at: string
          id: string
          player_id: string
          training_session_id: string
          updated_at: string
        }
        Insert: {
          attended?: boolean
          created_at?: string
          id?: string
          player_id: string
          training_session_id: string
          updated_at?: string
        }
        Update: {
          attended?: boolean
          created_at?: string
          id?: string
          player_id?: string
          training_session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_attendances_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_attendances_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          created_at: string
          id: string
          location: string | null
          notes: string | null
          session_date: string
          session_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          session_date: string
          session_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          session_date?: string
          session_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      player_role:
        | "Portiere"
        | "Difensore"
        | "Centrocampista"
        | "Attaccante"
        | "Allenatore"
      player_status: "Ativo" | "Infortunato" | "Sospeso" | "Inattivo"
      preferred_foot: "Destro" | "Sinistro" | "Ambidestro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      player_role: [
        "Portiere",
        "Difensore",
        "Centrocampista",
        "Attaccante",
        "Allenatore",
      ],
      player_status: ["Ativo", "Infortunato", "Sospeso", "Inattivo"],
      preferred_foot: ["Destro", "Sinistro", "Ambidestro"],
    },
  },
} as const
