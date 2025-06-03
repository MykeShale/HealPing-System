"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import type { Appointment } from "@/types"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import { useToast } from "@/hooks/use-toast"

export default function EditAppointmentPage() {
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const supabase = createSupabaseClient()
        const appointmentId = params.id as string

        const { data, error } = await supabase.from("appointments").select("*").eq("id", appointmentId).single()

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
      </div>
    )
  }

  return <AppointmentForm appointment={appointment} isEditing={true} />
}
