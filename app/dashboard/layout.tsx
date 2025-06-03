"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { getConfigStatus } from "@/lib/config"
import { createSupabaseClient } from "@/lib/supabase-client"
import { demoData } from "@/lib/demo-data"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const configStatus = getConfigStatus()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (configStatus.mode === "demo") {
          // Demo mode authentication
          const demoUser = localStorage.getItem("demo-user")
          if (demoUser) {
            const user = JSON.parse(demoUser)
            setUser(user)
            setProfile(demoData.profile)
          } else {
            router.push("/auth/login")
            return
          }
        } else {
          // Real Supabase authentication
          const supabase = createSupabaseClient()
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser()

          if (error || !user) {
            router.push("/auth/login")
            return
          }

          setUser(user)

          // Fetch user profile
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          setProfile(profile)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [configStatus.mode, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar profile={profile || demoData.profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header profile={profile || demoData.profile} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
