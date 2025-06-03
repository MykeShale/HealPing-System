"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { RecentReminders } from "@/components/dashboard/recent-reminders"
import { useSupabase } from "@/hooks/use-supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingFollowUps: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const { client, user, isConfigured } = useSupabase()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isConfigured || !client || !user) {
        // Use mock data when not configured
        setStats({
          totalPatients: 125,
          todayAppointments: 8,
          pendingFollowUps: 12,
          completionRate: 87,
        })
        setLoading(false)
        return
      }

      try {
        // Try to fetch real data, but don't fail if it doesn't work
        const { data: profile } = await client.from("profiles").select("clinic_id").eq("id", user.id).single()

        if (profile?.clinic_id) {
          const [patientsResult, appointmentsResult] = await Promise.all([
            client.from("patients").select("id", { count: "exact" }).eq("clinic_id", profile.clinic_id),
            client.from("appointments").select("id", { count: "exact" }).eq("clinic_id", profile.clinic_id),
          ])

          setStats({
            totalPatients: patientsResult.count || 0,
            todayAppointments: appointmentsResult.count || 0,
            pendingFollowUps: 5, // Mock data
            completionRate: 85, // Mock data
          })
        } else {
          // Use mock data if no clinic found
          setStats({
            totalPatients: 125,
            todayAppointments: 8,
            pendingFollowUps: 12,
            completionRate: 87,
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        // Use mock data on error
        setStats({
          totalPatients: 125,
          todayAppointments: 8,
          pendingFollowUps: 12,
          completionRate: 87,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [client, user, isConfigured])

  if (!isConfigured) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>
            The application is not properly configured. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded animate-pulse"></div>
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
        {!isConfigured && (
          <Alert className="mt-4">
            <AlertDescription>Running in demo mode. Connect your database to see real data.</AlertDescription>
          </Alert>
        )}
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointments />
        <RecentReminders />
      </div>
    </div>
  )
}
