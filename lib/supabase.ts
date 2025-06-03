import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Safe client creation that won't break during build
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured")
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Server-side client creation
export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase server environment variables are not configured")
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

// Default export for backward compatibility (only created when needed)
let defaultClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!defaultClient && isSupabaseConfigured()) {
    defaultClient = createSupabaseClient()
  }
  return defaultClient
}

// Export for backward compatibility
export const supabase = getSupabaseClient()
