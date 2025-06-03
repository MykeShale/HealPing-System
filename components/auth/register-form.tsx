"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"
import Link from "next/link"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    role: "doctor" as "doctor" | "staff",
    clinicName: "",
    clinicAddress: "",
    clinicPhone: "",
    clinicEmail: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const validateForm = () => {
    if (!formData.email.trim()) {
      throw new Error("Email is required")
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      throw new Error("Please enter a valid email address")
    }

    if (!formData.password) {
      throw new Error("Password is required")
    }

    if (formData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long")
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error("Passwords do not match")
    }

    if (!formData.fullName.trim()) {
      throw new Error("Full name is required")
    }

    if (!formData.phone.trim()) {
      throw new Error("Phone number is required")
    }

    if (!formData.clinicName.trim()) {
      throw new Error("Clinic name is required")
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        throw new Error("Application is not properly configured. Please contact support.")
      }

      validateForm()

      const supabase = createSupabaseClient()

      console.log("Attempting to register user:", formData.email)

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            role: formData.role,
          },
        },
      })

      if (authError) {
        console.error("Auth error:", authError)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error("Registration failed - no user data received")
      }

      console.log("User registered successfully:", authData.user.id)

      // Create clinic first
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics")
        .insert({
          name: formData.clinicName.trim(),
          address: formData.clinicAddress.trim() || null,
          phone: formData.clinicPhone.trim() || null,
          email: formData.clinicEmail.trim() || null,
          owner_id: authData.user.id,
        })
        .select()
        .single()

      if (clinicError) {
        console.error("Clinic creation error:", clinicError)
        throw new Error("Failed to create clinic: " + clinicError.message)
      }

      console.log("Clinic created successfully:", clinicData.id)

      // Create user profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        clinic_id: clinicData.id,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        throw new Error("Failed to create profile: " + profileError.message)
      }

      console.log("Profile created successfully")

      // If email confirmation is required
      if (!authData.session) {
        setError("Please check your email and click the confirmation link to complete registration.")
        return
      }

      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Registration error:", error)
      setError(error.message || "Registration failed. Please try again.")
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Dr. John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="doctor@clinic.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.role}
            onValueChange={(value: "doctor" | "staff") => setFormData({ ...formData, role: value })}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={loading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-medium">Clinic Information</h3>

        <div className="space-y-2">
          <Label htmlFor="clinicName">Clinic Name *</Label>
          <Input
            id="clinicName"
            type="text"
            placeholder="ABC Medical Center"
            value={formData.clinicName}
            onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinicAddress">Clinic Address</Label>
          <Input
            id="clinicAddress"
            type="text"
            placeholder="123 Main St, City, State 12345"
            value={formData.clinicAddress}
            onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clinicPhone">Clinic Phone</Label>
            <Input
              id="clinicPhone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.clinicPhone}
              onChange={(e) => setFormData({ ...formData, clinicPhone: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicEmail">Clinic Email</Label>
            <Input
              id="clinicEmail"
              type="email"
              placeholder="info@clinic.com"
              value={formData.clinicEmail}
              onChange={(e) => setFormData({ ...formData, clinicEmail: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>

      <div className="text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
          Sign in
        </Link>
      </div>
    </form>
  )
}
