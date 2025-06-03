"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import type { Patient } from "@/types"
import { PatientForm } from "@/components/patients/patient-form"
import { useToast } from "@/hooks/use-toast"

export default function EditPatientPage() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const supabase = createSupabaseClient()
        const patientId = params.id as string

        const { data, error } = await supabase.from("patients").select("*").eq("id", patientId).single()

        if (error) {
          throw error
        }

        setPatient(data)
      } catch (error: any) {
        console.error("Error fetching patient:", error)
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
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
      </div>
    )
  }

  return <PatientForm patient={patient} isEditing={true} />
}
