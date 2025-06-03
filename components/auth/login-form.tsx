"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2, Info } from "lucide-react"
import { getConfigStatus } from "@/lib/config"
import { createSupabaseClient } from "@/lib/supabase-client"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const configStatus = getConfigStatus()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (configStatus.mode === "demo") {
        // Demo mode - simulate login
        if (email.includes("demo") || email === "admin@healping.com") {
          // Simulate successful login
          localStorage.setItem(
            "demo-user",
            JSON.stringify({
              id: "demo-user-1",
              email: email,
              name: "Dr. Demo User",
            }),
          )
          router.push("/dashboard")
          return
        } else {
          throw new Error("In demo mode, use 'demo@healping.com' or 'admin@healping.com' to login")
        }
      }

      // Real Supabase authentication
      const supabase = createSupabaseClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (data.user) {
        router.push("/dashboard")
      }
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail("demo@healping.com")
    setPassword("demo123")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In to HealPing</CardTitle>
        <CardDescription>
          {configStatus.mode === "demo"
            ? "Demo Mode - Use demo credentials to explore"
            : "Enter your credentials to access your account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {configStatus.mode === "demo" && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Running in demo mode. Database features are simulated.</p>
                <Button variant="outline" size="sm" onClick={handleDemoLogin} className="w-full">
                  Use Demo Credentials
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
              placeholder={configStatus.mode === "demo" ? "demo@healping.com" : "doctor@clinic.com"}
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
                placeholder={configStatus.mode === "demo" ? "demo123" : "Enter your password"}
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
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
