"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { RecentReminders } from "@/components/dashboard/recent-reminders"
import { getConfigStatus } from "@/lib/config"
import { createSupabaseClient } from "@/lib/supabase-client"
import { demoData } from "@/lib/demo-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState(demoData.stats)
  const [loading, setLoading] = useState(true)
  const configStatus = getConfigStatus()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (configStatus.mode === "demo") {
          // Use demo data
          setStats(demoData.stats)
        } else {
          // Try to fetch real data
          const supabase = createSupabaseClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single()

            if (profile?.clinic_id) {
              const [patientsResult, appointmentsResult] = await Promise.all([
                supabase.from("patients").select("id", { count: "exact" }).eq("clinic_id", profile.clinic_id),
                supabase.from("appointments").select("id", { count: "exact" }).eq("clinic_id", profile.clinic_id),
              ])

              setStats({
                totalPatients: patientsResult.count || 0,
                todayAppointments: appointmentsResult.count || 0,
                pendingFollowUps: 5,
                completionRate: 85,
              })
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        // Fallback to demo data
        setStats(demoData.stats)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [configStatus.mode])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your practice today.
        </p>
      </div>

      {configStatus.mode === "demo" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> You're viewing sample data. Connect your Supabase database to see real patient
            information.
          </AlertDescription>
        </Alert>
      )}

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointments />
        <RecentReminders />
      </div>
    </div>
  )
}
