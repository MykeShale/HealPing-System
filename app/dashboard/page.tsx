"use client"

import { useEffect, useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { RecentReminders } from "@/components/dashboard/recent-reminders"
import { isSupabaseConfigured } from "@/lib/env"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setError("Supabase is not configured. Please check your environment variables.")
          setIsLoading(false)
          return
        }

        const { createSupabaseClient } = await import("@/lib/supabase")
        const supabase = createSupabaseClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("User not authenticated")
          setIsLoading(false)
          return
        }

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        setUserData({ user, profile })
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (isLoading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {userData?.profile?.name || "Doctor"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Here's an overview of your practice today</p>
      </div>
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointments />
        <RecentReminders />
      </div>
    </div>
  )
}
