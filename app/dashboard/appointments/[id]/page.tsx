"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Appointment } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Calendar, Clock, User, Phone, Mail, FileText } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface AppointmentDetailPageProps {
  params: {
    id: string
  }
}

export default function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await supabase
          .from("appointments")
          .select(`
            *,
            patient:patients(full_name, phone, email),
            doctor:profiles!appointments_doctor_id_fkey(full_name)
          `)
          .eq("id", params.id)
          .single()

        setAppointment(data)
      } catch (error) {
        console.error("Error fetching appointment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointment()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Appointment not found</h2>
        <Button onClick={() => router.push("/dashboard/appointments")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
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
        <Button asChild>
          <Link href={`/dashboard/appointments/${appointment.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
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
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Status</span>
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
              >
                {appointment.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Date & Time</span>
              <div className="text-right">
                <div className="font-medium">{format(new Date(appointment.appointment_date), "MMM dd, yyyy")}</div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(appointment.appointment_date), "HH:mm")}
                </div>
              </div>
            </div>

            {appointment.follow_up_date && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Follow-up Date</span>
                <div className="text-right">
                  <div className="font-medium">{format(new Date(appointment.follow_up_date), "MMM dd, yyyy")}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(appointment.follow_up_date), "HH:mm")}
                  </div>
                </div>
              </div>
            )}

            {appointment.treatment_type && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Treatment Type</span>
                <Badge variant="outline">{appointment.treatment_type}</Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Doctor</span>
              <span className="font-medium">{appointment.doctor?.full_name}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {appointment.patient?.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{appointment.patient?.full_name}</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{appointment.patient?.phone}</span>
              </div>

              {appointment.patient?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{appointment.patient?.email}</span>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/dashboard/patients/${appointment.patient_id}`}>View Patient Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {appointment.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{appointment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
