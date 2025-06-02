"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Patient, Appointment } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Phone, Mail, Calendar, Clock, Plus } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface PatientDetailPageProps {
  params: {
    id: string
  }
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // Fetch patient details
        const { data: patientData } = await supabase.from("patients").select("*").eq("id", params.id).single()

        setPatient(patientData)

        // Fetch patient appointments
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select(`
            *,
            doctor:profiles!appointments_doctor_id_fkey(full_name)
          `)
          .eq("patient_id", params.id)
          .order("appointment_date", { ascending: false })

        setAppointments(appointmentsData || [])
      } catch (error) {
        console.error("Error fetching patient data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Patient not found</h2>
        <Button onClick={() => router.push("/dashboard/patients")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
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
              Edit
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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{patient.full_name.charAt(0).toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{patient.phone}</span>
                </div>

                {patient.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                )}

                {patient.date_of_birth && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{format(new Date(patient.date_of_birth), "MMMM dd, yyyy")}</span>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Registered {format(new Date(patient.created_at), "MMMM dd, yyyy")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patient.communication_preferences?.sms && (
                  <Badge variant="secondary" className="mr-2">
                    SMS
                  </Badge>
                )}
                {patient.communication_preferences?.email && (
                  <Badge variant="secondary" className="mr-2">
                    Email
                  </Badge>
                )}
                {patient.communication_preferences?.whatsapp && (
                  <Badge variant="secondary" className="mr-2">
                    WhatsApp
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Appointment History</CardTitle>
              <Button size="sm" asChild>
                <Link href={`/dashboard/appointments/new?patient=${patient.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Schedule the first appointment for this patient
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/appointments/new?patient=${patient.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Appointment
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
                              <div className="text-gray-500">
                                {format(new Date(appointment.appointment_date), "HH:mm")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{appointment.doctor?.full_name}</span>
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
                                    : "secondary"
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {appointment.follow_up_date ? (
                              <span className="text-sm">
                                {format(new Date(appointment.follow_up_date), "MMM dd, yyyy")}
                              </span>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
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
