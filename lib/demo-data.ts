// Demo data for when Supabase is not configured
export const demoData = {
  user: {
    id: "demo-user-1",
    email: "demo@healping.com",
    name: "Dr. Demo User",
  },

  profile: {
    id: "demo-user-1",
    full_name: "Dr. Demo User",
    role: "doctor",
    phone: "+1 (555) 123-4567",
    clinic_id: "demo-clinic-1",
  },

  clinic: {
    id: "demo-clinic-1",
    name: "Demo Medical Center",
    address: "123 Healthcare Ave, Medical City, MC 12345",
    phone: "+1 (555) 987-6543",
    email: "info@demomedical.com",
  },

  patients: [
    {
      id: "demo-patient-1",
      full_name: "John Smith",
      phone: "+1 (555) 111-2222",
      email: "john.smith@email.com",
      date_of_birth: "1985-06-15",
      communication_preferences: { sms: true, email: true, whatsapp: false },
      created_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "demo-patient-2",
      full_name: "Sarah Johnson",
      phone: "+1 (555) 333-4444",
      email: "sarah.j@email.com",
      date_of_birth: "1990-03-22",
      communication_preferences: { sms: true, email: false, whatsapp: true },
      created_at: "2024-01-20T14:30:00Z",
    },
    {
      id: "demo-patient-3",
      full_name: "Michael Brown",
      phone: "+1 (555) 555-6666",
      email: "m.brown@email.com",
      date_of_birth: "1978-11-08",
      communication_preferences: { sms: false, email: true, whatsapp: false },
      created_at: "2024-02-01T09:15:00Z",
    },
  ],

  appointments: [
    {
      id: "demo-appointment-1",
      patient_id: "demo-patient-1",
      doctor_id: "demo-user-1",
      appointment_date: "2024-12-20T10:00:00Z",
      status: "scheduled",
      treatment_type: "Consultation",
      notes: "Regular checkup",
      patient: { full_name: "John Smith", phone: "+1 (555) 111-2222" },
      doctor: { full_name: "Dr. Demo User" },
    },
    {
      id: "demo-appointment-2",
      patient_id: "demo-patient-2",
      doctor_id: "demo-user-1",
      appointment_date: "2024-12-21T14:00:00Z",
      status: "completed",
      treatment_type: "Follow-up",
      notes: "Post-surgery checkup",
      patient: { full_name: "Sarah Johnson", phone: "+1 (555) 333-4444" },
      doctor: { full_name: "Dr. Demo User" },
    },
  ],

  reminders: [
    {
      id: "demo-reminder-1",
      appointment_id: "demo-appointment-1",
      reminder_type: "sms",
      scheduled_for: "2024-12-19T18:00:00Z",
      status: "sent",
      message_content: "Reminder: You have an appointment tomorrow at 10:00 AM",
      appointment: {
        patient: { full_name: "John Smith", phone: "+1 (555) 111-2222" },
      },
    },
  ],

  stats: {
    totalPatients: 156,
    todayAppointments: 8,
    pendingFollowUps: 12,
    completionRate: 87,
  },
}
