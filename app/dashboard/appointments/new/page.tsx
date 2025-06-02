"use client"

import { Suspense } from "react"
import { AppointmentForm } from "@/components/appointments/appointment-form"

function NewAppointmentContent() {
  return <AppointmentForm />
}

export default function NewAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      }
    >
      <NewAppointmentContent />
    </Suspense>
  )
}
