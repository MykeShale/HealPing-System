"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        throw new Error("Application is not properly configured. Please contact support.")
      }

      const supabase = createSupabaseClient()

      // Validate inputs
      if (!email.trim()) {
        throw new Error("Email is required")
      }

      if (!password.trim()) {
        throw new Error("Password is required")
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      console.log("Attempting to sign in with:", email)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      console.log("Auth response:", { data, error: authError })

      if (authError) {
        console.error("Auth error:", authError)

        // Handle specific auth errors
        switch (authError.message) {
          case "Invalid login credentials":
            setError("Invalid email or password. Please check your credentials and try again.")
            break
          case "Email not confirmed":
            setError("Please check your email and click the confirmation link before signing in.")
            break
          case "Too many requests":
            setError("Too many login attempts. Please wait a few minutes before trying again.")
            break
          default:
            setError(authError.message || "Login failed. Please try again.")
        }
        return
      }

      if (!data.user) {
        throw new Error("Login failed - no user data received")
      }

      console.log("Login successful, user:", data.user.id)

      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      console.log("Profile check:", { profile, error: profileError })

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile error:", profileError)
        throw new Error("Failed to load user profile")
      }

      if (!profile) {
        console.log("No profile found, redirecting to register")
        router.push("/auth/register")
        return
      }

      console.log("Profile found, redirecting to dashboard")
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="doctor@clinic.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>

      <div className="text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
        <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
          Sign up
        </Link>
      </div>
    </form>
  )
}
