// Environment configuration that works in all environments
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  app: {
    name: "HealPing",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },
}

// Check if we're in browser environment
export const isBrowser = typeof window !== "undefined"

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  const { url, anonKey } = config.supabase
  return Boolean(
    url && anonKey && url.length > 10 && anonKey.length > 10 && url.startsWith("https://") && url.includes("supabase"),
  )
}

// Get configuration status
export const getConfigStatus = () => {
  const supabaseConfigured = isSupabaseConfigured()

  return {
    supabase: supabaseConfigured,
    canUseDatabase: supabaseConfigured,
    mode: supabaseConfigured ? "production" : "demo",
  }
}
