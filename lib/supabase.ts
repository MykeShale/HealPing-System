import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Global client instance
let supabaseClient: SupabaseClient | null = null

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("https://"))
}

// Safe client creation that never throws during build
export const createSupabaseClient = (): SupabaseClient => {
  // If we already have a client, return it
  if (supabaseClient) {
    return supabaseClient
  }

  // Check if Supabase is properly configured
  if (!isSupabaseConfigured()) {
    // Return a mock client for build time or when not configured
    return createMockClient()
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: isBrowser,
        persistSession: isBrowser,
        detectSessionInUrl: isBrowser,
      },
      global: {
        headers: {
          "X-Client-Info": "healping-app",
        },
      },
    })

    return supabaseClient
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return createMockClient()
  }
}

// Create a mock client for when Supabase is not available
function createMockClient(): SupabaseClient {
  const mockClient = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: new Error("Supabase not configured"),
      }),
      signUp: async () => ({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error("Supabase not configured") }),
          order: () => ({
            limit: async () => ({ data: [], error: new Error("Supabase not configured") }),
          }),
        }),
        order: () => ({
          limit: async () => ({ data: [], error: new Error("Supabase not configured") }),
        }),
      }),
      insert: async () => ({ data: null, error: new Error("Supabase not configured") }),
      update: async () => ({ data: null, error: new Error("Supabase not configured") }),
      delete: async () => ({ data: null, error: new Error("Supabase not configured") }),
    }),
  } as any

  return mockClient
}

// Get the singleton client instance
export const getSupabaseClient = (): SupabaseClient => {
  return createSupabaseClient()
}

// Default export
export const supabase = getSupabaseClient()
