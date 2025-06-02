"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Appointment } from "@/types"
import { AppointmentForm } from "@/components/appointments/appointment-form"

interface EditAppointmentPageProps {
  params: {
    id: string
  }
}

export default function EditAppointmentPage({ params }: EditAppointmentPageProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await supabase.from("appointments").select("*").eq("id", params.id).single()

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointment not found</h2>
      </div>
    )
  }

  return <AppointmentForm appointment={appointment} isEditing />
}
