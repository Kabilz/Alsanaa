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
      announcements: {
        Row: {
          id: string
          title: string
          title_ar: string | null
          content: string
          content_ar: string | null
          image_url: string | null
          target_audience: 'all' | 'students' | 'teachers'
          is_active: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          title_ar?: string | null
          content: string
          content_ar?: string | null
          image_url?: string | null
          target_audience?: 'all' | 'students' | 'teachers'
          is_active?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          title_ar?: string | null
          content?: string
          content_ar?: string | null
          image_url?: string | null
          target_audience?: 'all' | 'students' | 'teachers'
          is_active?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      colleges: {
        Row: {
          id: string
          name: string
          name_ar: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_ar: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_ar?: string
          slug?: string
          created_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          subject: string | null
          message: string
          status: 'new' | 'in_progress' | 'resolved' | 'closed'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          subject?: string | null
          message: string
          status?: 'new' | 'in_progress' | 'resolved' | 'closed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          subject?: string | null
          message?: string
          status?: 'new' | 'in_progress' | 'resolved' | 'closed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      course_purchases: {
        Row: {
          id: string
          user_id: string
          course_id: string
          price_paid: number
          created_at: string
          transaction_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          price_paid: number
          created_at?: string
          transaction_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          price_paid?: number
          created_at?: string
          transaction_id?: string | null
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
            foreignKeyName: "course_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string | null
          created_at: string
          price: number
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_url?: string | null
          created_at?: string
          price?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_url?: string | null
          created_at?: string
          price?: number
        }
      }
      courses_new: {
        Row: {
          id: string
          teacher_id: string | null
          title: string
          title_ar: string | null
          description: string | null
          description_ar: string | null
          price: number
          is_free: boolean
          educational_year_id: string | null
          subject_id: string | null
          department_id: string | null
          video_url: string | null
          pdf_url: string | null
          thumbnail_url: string | null
          duration_minutes: number | null
          status: 'draft' | 'published' | 'archived'
          view_count: number
          enrollment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id?: string | null
          title: string
          title_ar?: string | null
          description?: string | null
          description_ar?: string | null
          price?: number
          is_free?: boolean
          educational_year_id?: string | null
          subject_id?: string | null
          department_id?: string | null
          video_url?: string | null
          pdf_url?: string | null
          thumbnail_url?: string | null
          duration_minutes?: number | null
          status?: 'draft' | 'published' | 'archived'
          view_count?: number
          enrollment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string | null
          title?: string
          title_ar?: string | null
          description?: string | null
          description_ar?: string | null
          price?: number
          is_free?: boolean
          educational_year_id?: string | null
          subject_id?: string | null
          department_id?: string | null
          video_url?: string | null
          pdf_url?: string | null
          thumbnail_url?: string | null
          duration_minutes?: number | null
          status?: 'draft' | 'published' | 'archived'
          view_count?: number
          enrollment_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_new_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
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
            foreignKeyName: "courses_new_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      departments: {
        Row: {
          id: string
          college_id: string
          name: string
          name_ar: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          college_id: string
          name: string
          name_ar: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          college_id?: string
          name?: string
          name_ar?: string
          slug?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          }
        ]
      }
      educational_levels: {
        Row: {
          id: string
          name: string
          name_ar: string
          slug: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_ar: string
          slug: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_ar?: string
          slug?: string
          order_index?: number
          created_at?: string
        }
      }
      educational_years: {
        Row: {
          id: string
          level_id: string
          name: string
          name_ar: string
          slug: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          level_id: string
          name: string
          name_ar: string
          slug: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          level_id?: string
          name?: string
          name_ar?: string
          slug?: string
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "educational_years_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "educational_levels"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          from_user_id: string | null
          to_user_id: string | null
          subject: string | null
          content: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id?: string | null
          to_user_id?: string | null
          subject?: string | null
          content: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string | null
          to_user_id?: string | null
          subject?: string | null
          content?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      prepaid_cards: {
        Row: {
          id: string
          serial_number: string
          secret_code: string
          value: number
          status: 'active' | 'used' | 'expired' | 'cancelled'
          used_by_user_id: string | null
          used_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          serial_number: string
          secret_code: string
          value: number
          status?: 'active' | 'used' | 'expired' | 'cancelled'
          used_by_user_id?: string | null
          used_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          serial_number?: string
          secret_code?: string
          value?: number
          status?: 'active' | 'used' | 'expired' | 'cancelled'
          used_by_user_id?: string | null
          used_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          role: 'customer' | 'teacher' | 'admin'
          full_name: string | null
          full_name_ar: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'customer' | 'teacher' | 'admin'
          full_name?: string | null
          full_name_ar?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'customer' | 'teacher' | 'admin'
          full_name?: string | null
          full_name_ar?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          course_id: string
          question: string
          options: Json
          correct_answer: string
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          question: string
          options: Json
          correct_answer: string
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          question?: string
          options?: Json
          correct_answer?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
      }
      subjects: {
        Row: {
          id: string
          year_id: string
          name: string
          name_ar: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          year_id: string
          name: string
          name_ar: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          year_id?: string
          name?: string
          name_ar?: string
          slug?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_year_id_fkey"
            columns: ["year_id"]
            isOneToOne: false
            referencedRelation: "educational_years"
            referencedColumns: ["id"]
          }
        ]
      }
      teacher_earnings: {
        Row: {
          id: string
          teacher_id: string
          transaction_id: string
          amount: number
          commission_rate: number
          status: 'pending' | 'available' | 'paid' | 'held'
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          transaction_id: string
          amount: number
          commission_rate: number
          status?: 'pending' | 'available' | 'paid' | 'held'
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          transaction_id?: string
          amount?: number
          commission_rate?: number
          status?: 'pending' | 'available' | 'paid' | 'held'
          paid_at?: string | null
          created_at?: string
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
          }
        ]
      }
      teachers: {
        Row: {
          id: string
          commission_rate: number
          wallet_balance: number
          bio: string | null
          bio_ar: string | null
          specializations: string[] | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          commission_rate?: number
          wallet_balance?: number
          bio?: string | null
          bio_ar?: string | null
          specializations?: string[] | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          commission_rate?: number
          wallet_balance?: number
          bio?: string | null
          bio_ar?: string | null
          specializations?: string[] | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string | null
          course_id: string | null
          amount: number
          payment_method: 'card' | 'transfer' | 'voucher' | null
          payment_service: string | null
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          course_id?: string | null
          amount: number
          payment_method?: 'card' | 'transfer' | 'voucher' | null
          payment_service?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          course_id?: string | null
          amount?: number
          payment_method?: 'card' | 'transfer' | 'voucher' | null
          payment_service?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      wallet_transactions: {
        Row: {
          id: string
          teacher_id: string
          amount: number
          type: 'earning' | 'withdrawal' | 'adjustment'
          description: string | null
          description_ar: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          amount: number
          type: 'earning' | 'withdrawal' | 'adjustment'
          description?: string | null
          description_ar?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          amount?: number
          type?: 'earning' | 'withdrawal' | 'adjustment'
          description?: string | null
          description_ar?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          }
        ]
      }
    }
  }
}
