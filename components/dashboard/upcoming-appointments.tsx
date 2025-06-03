"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import type { Appointment } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Eye } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import Link from "next/link"

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single()
        if (!profile?.clinic_id) return

        const today = new Date()
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)

        const { data: appointments } = await supabase
          .from("appointments")
          .select(`
            *,
            patient:patients(full_name, phone),
            doctor:profiles!appointments_doctor_id_fkey(full_name)
          `)
          .eq("clinic_id", profile.clinic_id)
          .eq("status", "scheduled")
          .gte("appointment_date", today.toISOString())
          .lte("appointment_date", nextWeek.toISOString())
          .order("appointment_date", { ascending: true })
          .limit(5)

        setAppointments(appointments || [])
      } catch (error) {
        console.error("Error fetching upcoming appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingAppointments()
  }, [])

  const getDateLabel = (date: string) => {
    const appointmentDate = new Date(date)
    if (isToday(appointmentDate)) return "Today"
    if (isTomorrow(appointmentDate)) return "Tomorrow"
    return format(appointmentDate, "MMM dd")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Upcoming Appointments</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {appointment.patient?.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{appointment.patient?.full_name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {getDateLabel(appointment.appointment_date)} at{" "}
                      {format(new Date(appointment.appointment_date), "HH:mm")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {appointment.treatment_type && (
                    <Badge variant="outline" className="text-xs">
                      {appointment.treatment_type}
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/appointments/${appointment.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/appointments">View All Appointments</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
