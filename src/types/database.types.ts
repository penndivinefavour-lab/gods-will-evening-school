export type Database = {
  public: {
    Tables: {
      platforms: {
        Row: {
          platform_id: string
          name: string
          settings: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          platform_id?: string
          name: string
          settings?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          settings?: Record<string, unknown>
          updated_at?: string
        }
      }
      schools: {
        Row: {
          school_id: string
          platform_id: string
          name: string
          code: string
          branding: Record<string, unknown>
          settings: Record<string, unknown>
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          school_id?: string
          platform_id: string
          name: string
          code: string
          branding?: Record<string, unknown>
          settings?: Record<string, unknown>
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          code?: string
          branding?: Record<string, unknown>
          settings?: Record<string, unknown>
          status?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          user_id: string
          email: string
          full_name: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string
          email: string
          full_name: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          status?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          role_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          role_id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
        }
      }
      permissions: {
        Row: {
          permission_id: string
          name: string
          description: string | null
          module: string
          action: string
          created_at: string
        }
        Insert: {
          permission_id?: string
          name: string
          description?: string | null
          module: string
          action: string
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          module?: string
          action?: string
        }
      }
      role_permissions: {
        Row: {
          role_permission_id: string
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          role_permission_id?: string
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          role_id?: string
          permission_id?: string
        }
      }
      user_roles: {
        Row: {
          user_role_id: string
          user_id: string
          role_id: string
          school_id: string | null
          assigned_by: string | null
          created_at: string
        }
        Insert: {
          user_role_id?: string
          user_id: string
          role_id: string
          school_id?: string | null
          assigned_by?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          role_id?: string
          school_id?: string | null
          assigned_by?: string | null
        }
      }
      academic_years: {
        Row: {
          academic_year_id: string
          school_id: string
          name: string
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string
          school_id: string
          name: string
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      branding: {
        Row: {
          branding_id: string
          school_id: string
          theme: Record<string, unknown>
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          branding_id?: string
          school_id: string
          theme?: Record<string, unknown>
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          theme?: Record<string, unknown>
          logo_url?: string | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          audit_log_id: string
          school_id: string | null
          user_id: string | null
          action: string
          entity: string
          changes: Record<string, unknown>
          source: string
          created_at: string
        }
        Insert: {
          audit_log_id?: string
          school_id?: string | null
          user_id?: string | null
          action: string
          entity: string
          changes?: Record<string, unknown>
          source: string
          created_at?: string
        }
        Update: never
      }
      feature_flags: {
        Row: {
          feature_flag_id: string
          school_id: string | null
          key: string
          enabled: boolean
          updated_at: string
        }
        Insert: {
          feature_flag_id?: string
          school_id?: string | null
          key: string
          enabled?: boolean
          updated_at?: string
        }
        Update: {
          key?: string
          enabled?: boolean
          updated_at?: string
        }
      }
      system_settings: {
        Row: {
          system_setting_id: string
          key: string
          value: Record<string, unknown>
          updated_at: string
        }
        Insert: {
          system_setting_id?: string
          key: string
          value?: Record<string, unknown>
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Record<string, unknown>
          updated_at?: string
        }
      }
      students: {
        Row: {
          student_id: string
          school_id: string
          user_id: string | null
          admission_number: string
          first_name: string
          middle_name: string | null
          last_name: string
          preferred_name: string | null
          gender: string
          date_of_birth: string | null
          place_of_birth: string | null
          nationality: string | null
          region: string | null
          division: string | null
          residential_address: string | null
          phone: string | null
          email: string | null
          status: string
          previous_school: string | null
          gce_level: string | null
          candidate_status: string | null
          health_notes: string | null
          emergency_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          student_id?: string
          school_id: string
          user_id?: string | null
          admission_number: string
          first_name: string
          middle_name?: string | null
          last_name: string
          preferred_name?: string | null
          gender: string
          date_of_birth?: string | null
          place_of_birth?: string | null
          nationality?: string | null
          region?: string | null
          division?: string | null
          residential_address?: string | null
          phone?: string | null
          email?: string | null
          status?: string
          previous_school?: string | null
          gce_level?: string | null
          candidate_status?: string | null
          health_notes?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          user_id?: string | null
          admission_number?: string
          first_name?: string
          middle_name?: string | null
          last_name?: string
          preferred_name?: string | null
          gender?: string
          date_of_birth?: string | null
          place_of_birth?: string | null
          nationality?: string | null
          region?: string | null
          division?: string | null
          residential_address?: string | null
          phone?: string | null
          email?: string | null
          status?: string
          previous_school?: string | null
          gce_level?: string | null
          candidate_status?: string | null
          health_notes?: string | null
          emergency_contact?: string | null
          updated_at?: string
        }
      }
      guardians: {
        Row: {
          guardian_id: string
          school_id: string
          user_id: string | null
          first_name: string
          last_name: string
          relationship: string | null
          phone: string
          alternative_phone: string | null
          email: string | null
          occupation: string | null
          address: string | null
          emergency_contact: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          guardian_id?: string
          school_id: string
          user_id?: string | null
          first_name: string
          last_name: string
          relationship?: string | null
          phone: string
          alternative_phone?: string | null
          email?: string | null
          occupation?: string | null
          address?: string | null
          emergency_contact?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          relationship?: string | null
          phone?: string
          alternative_phone?: string | null
          email?: string | null
          occupation?: string | null
          address?: string | null
          emergency_contact?: boolean
          updated_at?: string
        }
      }
      student_guardians: {
        Row: {
          student_guardian_id: string
          student_id: string
          guardian_id: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          student_guardian_id?: string
          student_id: string
          guardian_id: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          student_id?: string
          guardian_id?: string
          is_primary?: boolean
        }
      }
      teachers: {
        Row: {
          teacher_id: string
          school_id: string
          user_id: string | null
          staff_id: string
          first_name: string
          last_name: string
          qualifications: string | null
          specialization: string | null
          phone: string | null
          email: string | null
          employment_status: string
          date_joined: string | null
          emergency_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          teacher_id?: string
          school_id: string
          user_id?: string | null
          staff_id: string
          first_name: string
          last_name: string
          qualifications?: string | null
          specialization?: string | null
          phone?: string | null
          email?: string | null
          employment_status?: string
          date_joined?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          user_id?: string | null
          staff_id?: string
          first_name?: string
          last_name?: string
          qualifications?: string | null
          specialization?: string | null
          phone?: string | null
          email?: string | null
          employment_status?: string
          date_joined?: string | null
          emergency_contact?: string | null
          updated_at?: string
        }
      }
      teacher_assignments: {
        Row: {
          teacher_assignment_id: string
          school_id: string
          teacher_id: string
          class_id: string
          subject_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          teacher_assignment_id?: string
          school_id: string
          teacher_id: string
          class_id: string
          subject_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          teacher_id?: string
          class_id?: string
          subject_id?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          class_id: string
          school_id: string
          academic_year_id: string | null
          name: string
          stream: string | null
          display_name: string | null
          capacity: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          class_id?: string
          school_id: string
          academic_year_id?: string | null
          name: string
          stream?: string | null
          display_name?: string | null
          capacity?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          academic_year_id?: string | null
          name?: string
          stream?: string | null
          display_name?: string | null
          capacity?: number | null
          status?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          subject_id: string
          school_id: string
          name: string
          code: string | null
          description: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          subject_id?: string
          school_id: string
          name: string
          code?: string | null
          description?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          name?: string
          code?: string | null
          description?: string | null
          active?: boolean
          updated_at?: string
        }
      }
      fee_structures: {
        Row: {
          fee_structure_id: string
          school_id: string
          academic_year_id: string | null
          class_id: string | null
          name: string
          description: string | null
          amount: number
          currency: string
          frequency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          fee_structure_id?: string
          school_id: string
          academic_year_id?: string | null
          class_id?: string | null
          name: string
          description?: string | null
          amount?: number
          currency?: string
          frequency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          academic_year_id?: string | null
          class_id?: string | null
          name?: string
          description?: string | null
          amount?: number
          currency?: string
          frequency?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          invoice_id: string
          school_id: string
          student_id: string
          fee_structure_id: string
          amount: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          invoice_id?: string
          school_id: string
          student_id: string
          fee_structure_id: string
          amount?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          student_id?: string
          fee_structure_id?: string
          amount?: number
          status?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          payment_id: string
          school_id: string
          invoice_id: string
          amount: number
          method: string
          reference: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          payment_id?: string
          school_id: string
          invoice_id: string
          amount: number
          method: string
          reference?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          invoice_id?: string
          amount?: number
          method?: string
          reference?: string | null
          status?: string
          updated_at?: string
        }
      }
      receipts: {
        Row: {
          receipt_id: string
          school_id: string
          payment_id: string
          invoice_id: string
          student_id: string
          receipt_number: string | null
          amount: number
          method: string | null
          paid_by: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          receipt_id?: string
          school_id: string
          payment_id: string
          invoice_id: string
          student_id: string
          receipt_number?: string | null
          amount: number
          method?: string | null
          paid_by?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          payment_id?: string
          invoice_id?: string
          student_id?: string
          receipt_number?: string | null
          amount?: number
          method?: string | null
          paid_by?: string | null
          paid_at?: string | null
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          enrollment_id: string
          school_id: string
          student_id: string
          class_id: string
          academic_year_id: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          enrollment_id?: string
          school_id: string
          student_id: string
          class_id: string
          academic_year_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          student_id?: string
          class_id?: string
          academic_year_id?: string | null
          status?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          file_id: string
          school_id: string
          user_id: string | null
          entity: string | null
          entity_id: string | null
          filename: string
          mime_type: string | null
          size: number | null
          url: string
          path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          file_id?: string
          school_id: string
          user_id?: string | null
          entity?: string | null
          entity_id?: string | null
          filename: string
          mime_type?: string | null
          size?: number | null
          url: string
          path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          user_id?: string | null
          entity?: string | null
          entity_id?: string | null
          filename?: string
          mime_type?: string | null
          size?: number | null
          url?: string
          path?: string
          updated_at?: string
        }
      }
      attendance_worksheets: {
        Row: {
          attendance_worksheet_id: string
          school_id: string
          class_id: string
          teacher_id: string | null
          academic_year_id: string | null
          worksheet_date: string
          file_id: string | null
          extraction_status: string
          extraction_result: unknown
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          attendance_worksheet_id?: string
          school_id: string
          class_id: string
          teacher_id?: string | null
          academic_year_id?: string | null
          worksheet_date: string
          file_id?: string | null
          extraction_status?: string
          extraction_result?: unknown
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          class_id?: string
          teacher_id?: string | null
          academic_year_id?: string | null
          worksheet_date?: string
          file_id?: string | null
          extraction_status?: string
          extraction_result?: unknown
          approved_at?: string | null
          reviewed_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance_records: {
        Row: {
          attendance_record_id: string
          school_id: string
          student_id: string
          class_id: string
          enrollment_id: string | null
          teacher_id: string | null
          academic_year_id: string | null
          attendance_worksheet_id: string | null
          attendance_date: string
          status: 'present' | 'absent' | 'late' | 'excused'
          reason: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          attendance_record_id?: string
          school_id: string
          student_id: string
          class_id: string
          enrollment_id?: string | null
          teacher_id?: string | null
          academic_year_id?: string | null
          attendance_worksheet_id?: string | null
          attendance_date: string
          status: 'present' | 'absent' | 'late' | 'excused'
          reason?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          school_id?: string
          student_id?: string
          class_id?: string
          enrollment_id?: string | null
          teacher_id?: string | null
          academic_year_id?: string | null
          attendance_worksheet_id?: string | null
          attendance_date?: string
          status?: 'present' | 'absent' | 'late' | 'excused'
          reason?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
    }
  }
}
