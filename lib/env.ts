export const ENV = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
}

export const isSupabaseConfigured = () => {
  return !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY)
}

export const validateEnvironment = () => {
  const missing = []

  if (!ENV.SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!ENV.SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`)
    return false
  }

  return true
}
