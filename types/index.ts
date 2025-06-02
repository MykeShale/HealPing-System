export interface Profile {
  id: string
  role: "doctor" | "staff" | "patient"
  full_name: string
  phone?: string
  avatar_url?: string
  clinic_id?: string
  preferences?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  settings?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  clinic_id: string
  full_name: string
  phone: string
  email?: string
  date_of_birth?: string
  medical_history?: Record<string, any>
  communication_preferences?: {
    sms: boolean
    email: boolean
    whatsapp: boolean
  }
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  clinic_id: string
  appointment_date: string
  follow_up_date?: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  treatment_type?: string
  notes?: string
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: Profile
}

export interface Reminder {
  id: string
  appointment_id: string
  reminder_type: "sms" | "whatsapp" | "email" | "call"
  scheduled_for: string
  sent_at?: string
  status: "pending" | "sent" | "delivered" | "failed"
  message_content?: string
  created_at: string
  updated_at: string
  appointment?: Appointment
}

export interface DashboardStats {
  totalPatients: number
  pendingFollowUps: number
  todayAppointments: number
  completionRate: number
}
