import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { config, isSupabaseConfigured } from "./config"

// Mock client for when Supabase is not available
const createMockSupabaseClient = (): SupabaseClient => {
  const mockAuth = {
    getUser: async () => ({
      data: { user: null },
      error: { message: "Demo mode - no authentication available" },
    }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: { message: "Demo mode - authentication disabled" },
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: { message: "Demo mode - registration disabled" },
    }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  }

  const mockFrom = () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({
          data: null,
          error: { message: "Demo mode - database not available" },
        }),
        order: () => ({
          limit: async () => ({
            data: [],
            error: { message: "Demo mode - database not available" },
          }),
        }),
      }),
      order: () => ({
        limit: async () => ({
          data: [],
          error: { message: "Demo mode - database not available" },
        }),
      }),
    }),
    insert: async () => ({
      data: null,
      error: { message: "Demo mode - database writes disabled" },
    }),
    update: async () => ({
      data: null,
      error: { message: "Demo mode - database writes disabled" },
    }),
    delete: async () => ({
      data: null,
      error: { message: "Demo mode - database writes disabled" },
    }),
  })

  return {
    auth: mockAuth,
    from: mockFrom,
  } as any
}

// Real Supabase client
const createRealSupabaseClient = (): SupabaseClient => {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

// Main client factory
export const createSupabaseClient = (): SupabaseClient => {
  if (isSupabaseConfigured()) {
    try {
      return createRealSupabaseClient()
    } catch (error) {
      console.warn("Failed to create Supabase client, falling back to mock:", error)
      return createMockSupabaseClient()
    }
  }

  return createMockSupabaseClient()
}

// Singleton instance
let clientInstance: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!clientInstance) {
    clientInstance = createSupabaseClient()
  }
  return clientInstance
}
