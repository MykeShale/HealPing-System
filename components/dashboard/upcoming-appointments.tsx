"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Appointment } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Phone } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchAppointments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single()

      if (!profile?.clinic_id) return

      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
            *,
            patient:patients(full_name, phone),
            doctor:profiles!appointments_doctor_id_fkey(full_name)
          `)
        .eq("clinic_id", profile.clinic_id)
        .gte("appointment_date", new Date().toISOString())
        .eq("status", "scheduled")
        .order("appointment_date", { ascending: true })
        .limit(5)

      setAppointments(appointments || [])
    } catch (error) {
      console.error("Error fetching appointments:", error)
    }
  }

  const refreshAppointments = async () => {
    setLoading(true)
    await fetchAppointments()
    setLoading(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await fetchAppointments()
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Upcoming Appointments
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/appointments")}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {appointment.patient?.full_name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(appointment.appointment_date), "MMM dd, yyyy HH:mm")}</span>
                      {appointment.treatment_type && (
                        <Badge variant="secondary" className="text-xs">
                          {appointment.treatment_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
