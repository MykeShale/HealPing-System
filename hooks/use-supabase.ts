"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import type { SupabaseClient, User } from "@supabase/supabase-js"

export function useSupabase() {
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setError("Supabase is not configured. Please check your environment variables.")
          setLoading(false)
          return
        }

        const supabaseClient = createSupabaseClient()
        setClient(supabaseClient)

        // Get initial user
        const {
          data: { user },
          error: userError,
        } = await supabaseClient.auth.getUser()

        if (userError && userError.message !== "Supabase not configured") {
          console.error("Error getting user:", userError)
        } else {
          setUser(user)
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null)
        })

        setLoading(false)

        return () => {
          subscription.unsubscribe()
        }
      } catch (err) {
        console.error("Error initializing Supabase:", err)
        setError("Failed to initialize Supabase client")
        setLoading(false)
      }
    }

    initializeSupabase()
  }, [])

  return { client, user, loading, error, isConfigured: isSupabaseConfigured() }
}
