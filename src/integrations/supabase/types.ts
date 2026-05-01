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
      academic_resources: {
        Row: {
          created_at: string
          file_url: string
          id: string
          resource_type: string
          subject: string
          title: string | null
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          resource_type?: string
          subject: string
          title?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          resource_type?: string
          subject?: string
          title?: string | null
        }
        Relationships: []
      }
      answer_keys: {
        Row: {
          created_at: string
          file_url: string
          id: string
          paper_name: string
          year: number
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          paper_name: string
          year: number
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          paper_name?: string
          year?: number
        }
        Relationships: []
      }
      college_departments: {
        Row: {
          college_id: string
          created_at: string
          department_id: string
          id: string
        }
        Insert: {
          college_id: string
          created_at?: string
          department_id: string
          id?: string
        }
        Update: {
          college_id?: string
          created_at?: string
          department_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "college_departments_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "college_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone_number: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone_number?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone_number?: string | null
          role?: string
        }
        Relationships: []
      }
      cutoff_ranks: {
        Row: {
          branch: string
          created_at: string
          general_rank: number | null
          id: string
          obc_rank: number | null
          sc_rank: number | null
          st_rank: number | null
          year: number
        }
        Insert: {
          branch: string
          created_at?: string
          general_rank?: number | null
          id?: string
          obc_rank?: number | null
          sc_rank?: number | null
          st_rank?: number | null
          year: number
        }
        Update: {
          branch?: string
          created_at?: string
          general_rank?: number | null
          id?: string
          obc_rank?: number | null
          sc_rank?: number | null
          st_rank?: number | null
          year?: number
        }
        Relationships: []
      }
      cutoffs: {
        Row: {
          category: Database["public"]["Enums"]["cutoff_category"]
          college_department_id: string
          created_at: string
          id: string
          rank: number | null
          year: number
        }
        Insert: {
          category: Database["public"]["Enums"]["cutoff_category"]
          college_department_id: string
          created_at?: string
          id?: string
          rank?: number | null
          year?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["cutoff_category"]
          college_department_id?: string
          created_at?: string
          id?: string
          rank?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cutoffs_college_department_id_fkey"
            columns: ["college_department_id"]
            isOneToOne: false
            referencedRelation: "college_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          image_url: string | null
          registration_link: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          registration_link?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          registration_link?: string | null
          title?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          icon_identifier: string | null
          id: string
          platform_name: string
          url: string
        }
        Insert: {
          created_at?: string
          icon_identifier?: string | null
          id?: string
          platform_name: string
          url: string
        }
        Update: {
          created_at?: string
          icon_identifier?: string | null
          id?: string
          platform_name?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      cutoff_category:
        | "SM"
        | "EZ"
        | "MU"
        | "BH"
        | "LA"
        | "BX"
        | "KU"
        | "SC"
        | "ST"
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
      app_role: ["admin", "user"],
      cutoff_category: ["SM", "EZ", "MU", "BH", "LA", "BX", "KU", "SC", "ST"],
    },
  },
} as const
