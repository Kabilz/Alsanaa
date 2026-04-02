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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          content_ar: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          published_at: string | null
          target_audience: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          content_ar?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          published_at?: string | null
          target_audience?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_ar?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          published_at?: string | null
          target_audience?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      colleges: {
        Row: {
          created_at: string | null
          id: string
          name: string
          name_ar: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          name_ar: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          name_ar?: string
          slug?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      course_purchases: {
        Row: {
          course_id: string
          id: string
          price_paid: number
          purchased_at: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          price_paid: number
          purchased_at?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          price_paid?: number
          purchased_at?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_purchases_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          department_id: string | null
          educational_year_id: string | null
          id: string
          image_url: string | null
          level: string | null
          price: number
          subject_id: string | null
          teacher_id: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          department_id?: string | null
          educational_year_id?: string | null
          id?: string
          image_url?: string | null
          level?: string | null
          price?: number
          subject_id?: string | null
          teacher_id?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          department_id?: string | null
          educational_year_id?: string | null
          id?: string
          image_url?: string | null
          level?: string | null
          price?: number
          subject_id?: string | null
          teacher_id?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_educational_year_id_fkey"
            columns: ["educational_year_id"]
            isOneToOne: false
            referencedRelation: "educational_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          }
        ]
      }
      courses_new: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          description_ar: string | null
          duration_minutes: number | null
          educational_year_id: string | null
          enrollment_count: number | null
          id: string
          is_free: boolean | null
          pdf_url: string | null
          price: number
          status: string | null
          subject_id: string | null
          teacher_id: string | null
          thumbnail_url: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          description_ar?: string | null
          duration_minutes?: number | null
          educational_year_id?: string | null
          enrollment_count?: number | null
          id?: string
          is_free?: boolean | null
          pdf_url?: string | null
          price?: number
          status?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          description_ar?: string | null
          duration_minutes?: number | null
          educational_year_id?: string | null
          enrollment_count?: number | null
          id?: string
          is_free?: boolean | null
          pdf_url?: string | null
          price?: number
          status?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_new_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_new_educational_year_id_fkey"
            columns: ["educational_year_id"]
            isOneToOne: false
            referencedRelation: "educational_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_new_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_new_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          college_id: string | null
          created_at: string | null
          id: string
          name: string
          name_ar: string
          slug: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          name_ar: string
          slug: string
        }
        Update: {
          college_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          name_ar?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      educational_levels: {
        Row: {
          created_at: string | null
          id: string
          name: string
          name_ar: string
          order_index: number
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          name_ar: string
          order_index: number
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          name_ar?: string
          order_index?: number
          slug?: string
        }
        Relationships: []
      }
      educational_years: {
        Row: {
          created_at: string | null
          id: string
          level_id: string | null
          name: string
          name_ar: string
          order_index: number
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level_id?: string | null
          name: string
          name_ar: string
          order_index: number
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level_id?: string | null
          name?: string
          name_ar?: string
          order_index?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "educational_years_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "educational_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          from_user_id: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          subject: string | null
          to_user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          subject?: string | null
          to_user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          subject?: string | null
          to_user_id?: string | null
        }
        Relationships: []
      }
      pdf_lectures: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          description_ar: string | null
          download_count: number | null
          educational_year_id: string | null
          id: string
          is_free: boolean | null
          pdf_url: string
          price: number | null
          status: string | null
          subject_id: string | null
          teacher_id: string | null
          thumbnail_url: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          description_ar?: string | null
          download_count?: number | null
          educational_year_id?: string | null
          id?: string
          is_free?: boolean | null
          pdf_url: string
          price?: number | null
          status?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          description_ar?: string | null
          download_count?: number | null
          educational_year_id?: string | null
          id?: string
          is_free?: boolean | null
          pdf_url?: string
          price?: number | null
          status?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_lectures_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_lectures_educational_year_id_fkey"
            columns: ["educational_year_id"]
            isOneToOne: false
            referencedRelation: "educational_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_lectures_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_lectures_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      prepaid_cards: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          secret_code: string
          serial_number: string
          status: string | null
          used_at: string | null
          used_by_user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          secret_code: string
          serial_number: string
          status?: string | null
          used_at?: string | null
          used_by_user_id?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          secret_code?: string
          serial_number?: string
          status?: string | null
          used_at?: string | null
          used_by_user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          full_name_ar: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string | null
          wallet_balance: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          full_name_ar?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          full_name_ar?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          correct_answer: number
          course_id: string
          created_at: string
          id: string
          options: Json
          question: string
        }
        Insert: {
          correct_answer: number
          course_id: string
          created_at?: string
          id?: string
          options?: Json
          question: string
        }
        Update: {
          correct_answer?: number
          course_id?: string
          created_at?: string
          id?: string
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          name_ar: string
          slug: string
          year_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          name_ar: string
          slug: string
          year_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          name_ar?: string
          slug?: string
          year_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_year_id_fkey"
            columns: ["year_id"]
            isOneToOne: false
            referencedRelation: "educational_years"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_earnings: {
        Row: {
          amount: number
          commission_rate: number
          created_at: string | null
          id: string
          paid_at: string | null
          status: string | null
          teacher_id: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          commission_rate: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          teacher_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          teacher_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_earnings_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_earnings_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          bio: string | null
          bio_ar: string | null
          commission_rate: number
          created_at: string | null
          id: string
          is_verified: boolean | null
          specializations: string[] | null
          updated_at: string | null
          wallet_balance: number
        }
        Insert: {
          bio?: string | null
          bio_ar?: string | null
          commission_rate?: number
          created_at?: string | null
          id: string
          is_verified?: boolean | null
          specializations?: string[] | null
          updated_at?: string | null
          wallet_balance?: number
        }
        Update: {
          bio?: string | null
          bio_ar?: string | null
          commission_rate?: number
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          specializations?: string[] | null
          updated_at?: string | null
          wallet_balance?: number
        }
        Relationships: [
          {
            foreignKeyName: "teachers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_service: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_service?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_service?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          description_ar: string | null
          id: string
          reference_id: string | null
          teacher_id: string | null
          type: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          reference_id?: string | null
          teacher_id?: string | null
          type?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          reference_id?: string | null
          teacher_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          updated_at?: string | null
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
      purchase_course: {
        Args: { p_course_id: string; p_price: number; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
