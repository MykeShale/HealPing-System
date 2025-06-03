"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import type { Patient, Appointment } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Calendar, Phone, Mail, User, Clock, Plus } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function PatientDetailPage() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const supabase = createSupabaseClient()
        const patientId = params.id as string

        // Fetch patient details
        const { data: patientData, error: patientError } = await supabase
          .from("patients")
          .select("*")
          .eq("id", patientId)
          .single()

        if (patientError) {
          throw patientError
        }

        setPatient(patientData)

        // Fetch patient appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select(`
            *,
            doctor:profiles!appointments_doctor_id_fkey(full_name)
          `)
          .eq("patient_id", patientId)
          .order("appointment_date", { ascending: false })

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError)
        } else {
          setAppointments(appointmentsData || [])
        }
      } catch (error: any) {
        console.error("Error fetching patient data:", error)
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [params.id, toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient not found</h2>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{patient.full_name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Patient Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/patients/${patient.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Patient
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/appointments/new?patient=${patient.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{patient.full_name.charAt(0).toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-medium">{patient.full_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <p>{patient.phone}</p>
                  </div>
                </div>

                {patient.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <p>{patient.email}</p>
                    </div>
                  </div>
                )}

                {patient.date_of_birth && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <p>{format(new Date(patient.date_of_birth), "MMMM dd, yyyy")}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Communication Preferences</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {patient.communication_preferences?.sms && <Badge variant="secondary">SMS</Badge>}
                    {patient.communication_preferences?.email && <Badge variant="secondary">Email</Badge>}
                    {patient.communication_preferences?.whatsapp && <Badge variant="secondary">WhatsApp</Badge>}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Registered</label>
                  <p>{format(new Date(patient.created_at), "MMMM dd, yyyy")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This patient hasn't had any appointments scheduled.
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/appointments/new?patient=${patient.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule First Appointment
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Treatment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {format(new Date(appointment.appointment_date), "MMM dd, yyyy")}
                              </div>
                              <div className="text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {format(new Date(appointment.appointment_date), "HH:mm")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{appointment.doctor?.full_name}</span>
                          </TableCell>
                          <TableCell>
                            {appointment.treatment_type ? (
                              <Badge variant="outline">{appointment.treatment_type}</Badge>
                            ) : (
                              <span className="text-gray-400">Not specified</span>
                            )}
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            {appointment.follow_up_date ? (
                              <div className="text-sm">
                                <div className="font-medium">
                                  {format(new Date(appointment.follow_up_date), "MMM dd, yyyy")}
                                </div>
                                <div className="text-gray-500">
                                  {format(new Date(appointment.follow_up_date), "HH:mm")}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/appointments/${appointment.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
