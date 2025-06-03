"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import type { DashboardStats } from "@/types"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { RecentReminders } from "@/components/dashboard/recent-reminders"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const supabase = createSupabaseClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      // Get user profile to get clinic_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single()

      if (profileError || !profile?.clinic_id) {
        throw new Error("Profile not found or no clinic associated")
      }

      // Fetch dashboard statistics with proper error handling
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [patientsResult, appointmentsResult, followUpsResult] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact" }).eq("clinic_id", profile.clinic_id),

        supabase
          .from("appointments")
          .select("id", { count: "exact" })
          .eq("clinic_id", profile.clinic_id)
          .gte("appointment_date", today.toISOString().split("T")[0])
          .lt("appointment_date", tomorrow.toISOString().split("T")[0]),

        supabase
          .from("appointments")
          .select("id", { count: "exact" })
          .eq("clinic_id", profile.clinic_id)
          .not("follow_up_date", "is", null)
          .eq("status", "scheduled"),
      ])

      // Check for errors in the queries
      if (patientsResult.error) {
        console.error("Error fetching patients:", patientsResult.error)
      }
      if (appointmentsResult.error) {
        console.error("Error fetching appointments:", appointmentsResult.error)
      }
      if (followUpsResult.error) {
        console.error("Error fetching follow-ups:", followUpsResult.error)
      }

      const totalPatients = patientsResult.count || 0
      const todayAppointments = appointmentsResult.count || 0
      const pendingFollowUps = followUpsResult.count || 0

      setStats({
        totalPatients,
        todayAppointments,
        pendingFollowUps,
        completionRate: 85, // This would be calculated based on actual data
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your practice today.
        </p>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UpcomingAppointments />
        <RecentReminders />
      </div>
    </div>
  )
}
