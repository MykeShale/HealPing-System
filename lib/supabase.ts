import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Safe client creation that won't break during build
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are missing")
    throw new Error("Supabase environment variables are not configured")
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw new Error("Failed to create Supabase client")
  }
}

// Server-side client creation
export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase server environment variables are not configured")
  }

  try {
    return createClient(supabaseUrl, supabaseServiceRoleKey)
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    throw new Error("Failed to create server Supabase client")
  }
}

// Default export for backward compatibility (only created when needed)
let defaultClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!defaultClient && isSupabaseConfigured()) {
    try {
      defaultClient = createSupabaseClient()
    } catch (error) {
      console.error("Failed to create default Supabase client:", error)
    }
  }
  return defaultClient
}

// Export for backward compatibility
export const supabase = getSupabaseClient()
