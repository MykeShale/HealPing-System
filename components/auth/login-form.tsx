"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useSupabase } from "@/hooks/use-supabase"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { client, isConfigured } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!isConfigured) {
        throw new Error("Application is not properly configured. Please contact support.")
      }

      if (!client) {
        throw new Error("Unable to connect to authentication service.")
      }

      if (!email.trim() || !password.trim()) {
        throw new Error("Please enter both email and password.")
      }

      const { data, error: authError } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (authError) {
        if (authError.message === "Supabase not configured") {
          throw new Error("Application is not properly configured. Please contact support.")
        }
        throw new Error(authError.message || "Login failed. Please check your credentials.")
      }

      if (data.user) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Alert variant="destructive">
          <AlertDescription>
            The application is not properly configured. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

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
    </div>
  )
}
