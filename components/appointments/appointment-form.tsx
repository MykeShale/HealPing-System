"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import type { Appointment, Patient, Profile } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Save, Loader2, UserPlus } from "lucide-react"

interface AppointmentFormProps {
  appointment?: Appointment
  isEditing?: boolean
}

export function AppointmentForm({ appointment, isEditing = false }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    patient_id: appointment?.patient_id || "",
    doctor_id: appointment?.doctor_id || "",
    appointment_date: appointment?.appointment_date
      ? new Date(appointment.appointment_date).toISOString().slice(0, 16)
      : "",
    follow_up_date: appointment?.follow_up_date ? new Date(appointment.follow_up_date).toISOString().slice(0, 16) : "",
    status: appointment?.status || "scheduled",
    treatment_type: appointment?.treatment_type || "",
    notes: appointment?.notes || "",
  })
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          throw new Error("User not authenticated")
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("clinic_id")
          .eq("id", user.id)
          .single()

        if (profileError || !profile?.clinic_id) {
          throw new Error("Profile not found or no clinic associated")
        }

        // Fetch patients
        const { data: patientsData, error: patientsError } = await supabase
          .from("patients")
          .select("*")
          .eq("clinic_id", profile.clinic_id)
          .order("full_name")

        if (patientsError) {
          console.error("Error fetching patients:", patientsError)
        } else {
          setPatients(patientsData || [])
        }

        // Fetch doctors
        const { data: doctorsData, error: doctorsError } = await supabase
          .from("profiles")
          .select("*")
          .eq("clinic_id", profile.clinic_id)
          .in("role", ["doctor", "staff"])
          .order("full_name")

        if (doctorsError) {
          console.error("Error fetching doctors:", doctorsError)
        } else {
          setDoctors(doctorsData || [])

          // Set default doctor to current user if they're a doctor
          if (!isEditing && user.id) {
            const currentUserProfile = doctorsData?.find((doc) => doc.id === user.id)
            if (currentUserProfile) {
              setFormData((prev) => ({ ...prev, doctor_id: user.id }))
            }
          }
        }

        // Set patient from URL params if provided
        const patientId = searchParams.get("patient")
        if (patientId && !isEditing) {
          setFormData((prev) => ({ ...prev, patient_id: patientId }))
        }
      } catch (error: any) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load form data",
          variant: "destructive",
        })
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [isEditing, searchParams, toast])

  const validateForm = () => {
    if (!formData.patient_id) {
      toast({
        title: "Validation Error",
        description: "Please select a patient",
        variant: "destructive",
      })
      return false
    }

    if (!formData.doctor_id) {
      toast({
        title: "Validation Error",
        description: "Please select a doctor",
        variant: "destructive",
      })
      return false
    }

    if (!formData.appointment_date) {
      toast({
        title: "Validation Error",
        description: "Please select an appointment date and time",
        variant: "destructive",
      })
      return false
    }

    // Check if appointment date is in the past
    const appointmentDate = new Date(formData.appointment_date)
    const now = new Date()
    if (appointmentDate < now && !isEditing) {
      toast({
        title: "Validation Error",
        description: "Appointment date cannot be in the past",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const supabase = createSupabaseClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single()

      if (profileError || !profile?.clinic_id) {
        throw new Error("Profile not found or no clinic associated")
      }

      const appointmentData = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        clinic_id: profile.clinic_id,
        appointment_date: new Date(formData.appointment_date).toISOString(),
        follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : null,
        status: formData.status,
        treatment_type: formData.treatment_type.trim() || null,
        notes: formData.notes.trim() || null,
      }

      if (isEditing && appointment) {
        const { error } = await supabase
          .from("appointments")
          .update({
            ...appointmentData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", appointment.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Appointment updated successfully",
        })
      } else {
        const { error } = await supabase.from("appointments").insert(appointmentData)

        if (error) throw error

        toast({
          title: "Success",
          description: "Appointment scheduled successfully",
        })
      }

      router.push("/dashboard/appointments")
    } catch (error: any) {
      console.error("Error saving appointment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">No Patients Available</h1>
            <p className="text-gray-600 dark:text-gray-400">You need to add patients before scheduling appointments</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please add at least one patient before creating an appointment.
            </p>
            <Button onClick={() => router.push("/dashboard/patients/new")}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "Edit Appointment" : "Schedule New Appointment"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEditing ? "Update appointment details" : "Create a new appointment for your patient"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_id">Patient *</Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name} - {patient.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor_id">Doctor *</Label>
                <Select
                  value={formData.doctor_id}
                  onValueChange={(value) => setFormData({ ...formData, doctor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name} ({doctor.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment_date">Appointment Date & Time *</Label>
                <Input
                  id="appointment_date"
                  type="datetime-local"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow_up_date">Follow-up Date & Time</Label>
                <Input
                  id="follow_up_date"
                  type="datetime-local"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="treatment_type">Treatment Type</Label>
                <Input
                  id="treatment_type"
                  type="text"
                  placeholder="e.g., Consultation, Follow-up, Surgery"
                  value={formData.treatment_type}
                  onChange={(e) => setFormData({ ...formData, treatment_type: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the appointment..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Update Appointment" : "Schedule Appointment"}
          </Button>
        </div>
      </form>
    </div>
  )
}
