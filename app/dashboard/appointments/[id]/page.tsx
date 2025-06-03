"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Calendar, Clock, User, Phone, Bell } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AppointmentDetailPage() {
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const supabase = createSupabaseClient()
        const appointmentId = params.id as string

        const { data, error } = await supabase
          .from("appointments")
          .select(`
            *,
            patient:patients(full_name, phone, email),
            doctor:profiles!appointments_doctor_id_fkey(full_name)
          `)
          .eq("id", appointmentId)
          .single()

        if (error) {
          throw error
        }

        setAppointment(data)
      } catch (error: any) {
        console.error("Error fetching appointment:", error)
        toast({
          title: "Error",
          description: "Failed to load appointment data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [params.id, toast])

  const sendReminder = async () => {
    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase.from("reminders").insert({
        appointment_id: appointment.id,
        reminder_type: "sms",
        scheduled_for: new Date().toISOString(),
        message_content: `Reminder: You have an appointment scheduled for ${format(new Date(appointment.appointment_date), "MMMM dd, yyyy 'at' HH:mm")}.`,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Reminder sent successfully",
      })
    } catch (error) {
      console.error("Error sending reminder:", error)
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointment not found</h2>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointment Details</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {format(new Date(appointment.appointment_date), "MMMM dd, yyyy 'at' HH:mm")}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={sendReminder}>
            <Bell className="h-4 w-4 mr-2" />
            Send Reminder
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/appointments/${appointment.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Appointment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Date & Time</label>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <p className="text-lg">{format(new Date(appointment.appointment_date), "MMMM dd, yyyy 'at' HH:mm")}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge
                  variant={
                    appointment.status === "completed"
                      ? "default"
                      : appointment.status === "cancelled"
                        ? "destructive"
                        : appointment.status === "no_show"
                          ? "destructive"
                          : "secondary"
                  }
                  className="text-sm"
                >
                  {appointment.status.replace("_", " ")}
                </Badge>
              </div>
            </div>

            {appointment.treatment_type && (
              <div>
                <label className="text-sm font-medium text-gray-500">Treatment Type</label>
                <p className="mt-1">{appointment.treatment_type}</p>
              </div>
            )}

            {appointment.follow_up_date && (
              <div>
                <label className="text-sm font-medium text-gray-500">Follow-up Date</label>
                <p className="mt-1">{format(new Date(appointment.follow_up_date), "MMMM dd, yyyy 'at' HH:mm")}</p>
              </div>
            )}

            {appointment.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {appointment.patient?.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-lg">{appointment.patient?.full_name}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="h-3 w-3 mr-1" />
                    {appointment.patient?.phone}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/patients/${appointment.patient_id}`}>View Patient</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/appointments/new?patient=${appointment.patient_id}`}>Schedule New</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{appointment.doctor?.full_name}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
