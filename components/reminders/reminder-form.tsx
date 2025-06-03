"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import type { Appointment } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Bell, Save, Loader2 } from "lucide-react"

export function ReminderForm() {
  const [formData, setFormData] = useState({
    appointment_id: "",
    reminder_type: "sms" as "sms" | "email" | "whatsapp" | "call",
    scheduled_for: "",
    message_content: "",
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const supabase = createSupabaseClient()
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
            patient:patients(full_name, phone, email)
          `)
          .eq("clinic_id", profile.clinic_id)
          .eq("status", "scheduled")
          .order("appointment_date", { ascending: true })

        setAppointments(appointments || [])
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createSupabaseClient()

      const { error } = await supabase.from("reminders").insert({
        appointment_id: formData.appointment_id,
        reminder_type: formData.reminder_type,
        scheduled_for: new Date(formData.scheduled_for).toISOString(),
        message_content: formData.message_content,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Reminder scheduled successfully",
      })

      router.push("/dashboard/reminders")
    } catch (error: any) {
      console.error("Error creating reminder:", error)
      toast({
        title: "Error",
        description: "Failed to schedule reminder. Please try again.",
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Reminder</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule a new reminder for a patient</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Reminder Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment_id">Appointment *</Label>
                <Select
                  value={formData.appointment_id}
                  onValueChange={(value) => setFormData({ ...formData, appointment_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an appointment" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        {appointment.patient?.full_name} - {new Date(appointment.appointment_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder_type">Reminder Type *</Label>
                <Select
                  value={formData.reminder_type}
                  onValueChange={(value: "sms" | "email" | "whatsapp" | "call") =>
                    setFormData({ ...formData, reminder_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="call">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_for">Schedule For *</Label>
              <Input
                id="scheduled_for"
                type="datetime-local"
                value={formData.scheduled_for}
                onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message_content">Message Content</Label>
              <Textarea
                id="message_content"
                placeholder="Enter the reminder message..."
                value={formData.message_content}
                onChange={(e) => setFormData({ ...formData, message_content: e.target.value })}
                rows={4}
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
            Schedule Reminder
          </Button>
        </div>
      </form>
    </div>
  )
}
