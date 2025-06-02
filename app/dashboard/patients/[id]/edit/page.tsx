"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Patient } from "@/types"
import { PatientForm } from "@/components/patients/patient-form"

interface EditPatientPageProps {
  params: {
    id: string
  }
}

export default function EditPatientPage({ params }: EditPatientPageProps) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data } = await supabase.from("patients").select("*").eq("id", params.id).single()

        setPatient(data)
      } catch (error) {
        console.error("Error fetching patient:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
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

  return <PatientForm patient={patient} isEditing />
}
