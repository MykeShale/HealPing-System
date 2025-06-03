"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { useSupabase } from "@/hooks/use-supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { client, user, loading: authLoading, error: authError, isConfigured } = useSupabase()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !client || !isConfigured) {
        setLoading(false)
        return
      }

      try {
        const { data: profile, error } = await client.from("profiles").select("*").eq("id", user.id).single()

        if (error && error.message !== "Supabase not configured") {
          console.error("Error fetching profile:", error)
        } else if (profile) {
          setProfile(profile)
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      if (!user && isConfigured) {
        router.push("/auth/login")
        return
      }
      fetchProfile()
    }
  }, [user, client, authLoading, isConfigured, router])

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            The application is not properly configured. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (authLoading || loading) {
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
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header profile={profile} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
