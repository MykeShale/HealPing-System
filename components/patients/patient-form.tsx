"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import type { Patient } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, ArrowLeft } from "lucide-react"

interface PatientFormProps {
  patient?: Patient
  isEditing?: boolean
}

export function PatientForm({ patient, isEditing = false }: PatientFormProps) {
  const [formData, setFormData] = useState({
    full_name: patient?.full_name || "",
    phone: patient?.phone || "",
    email: patient?.email || "",
    date_of_birth: patient?.date_of_birth || "",
    communication_preferences: patient?.communication_preferences || {
      sms: true,
      email: true,
      whatsapp: false,
    },
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Patient name is required",
        variant: "destructive",
      })
      return false
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive",
      })
      return false
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const supabase = createSupabaseClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single()

      if (profileError || !profile?.clinic_id) {
        throw new Error("Profile not found or no clinic associated")
      }

      if (isEditing && patient) {
        const { error } = await supabase
          .from("patients")
          .update({
            full_name: formData.full_name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim() || null,
            date_of_birth: formData.date_of_birth || null,
            communication_preferences: formData.communication_preferences,
            updated_at: new Date().toISOString(),
          })
          .eq("id", patient.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Patient updated successfully",
        })
      } else {
        const { error } = await supabase.from("patients").insert({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          date_of_birth: formData.date_of_birth || null,
          communication_preferences: formData.communication_preferences,
          clinic_id: profile.clinic_id,
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "Patient added successfully",
        })
      }

      router.push("/dashboard/patients")
    } catch (error: any) {
      console.error("Error saving patient:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save patient. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "Edit Patient" : "Add New Patient"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEditing ? "Update patient information" : "Enter patient details to create a new record"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
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
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={formData.communication_preferences.sms}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      communication_preferences: {
                        ...formData.communication_preferences,
                        sms: checked as boolean,
                      },
                    })
                  }
                />
                <Label htmlFor="sms">SMS Notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email_pref"
                  checked={formData.communication_preferences.email}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      communication_preferences: {
                        ...formData.communication_preferences,
                        email: checked as boolean,
                      },
                    })
                  }
                />
                <Label htmlFor="email_pref">Email Notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={formData.communication_preferences.whatsapp}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      communication_preferences: {
                        ...formData.communication_preferences,
                        whatsapp: checked as boolean,
                      },
                    })
                  }
                />
                <Label htmlFor="whatsapp">WhatsApp Notifications</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Update Patient" : "Add Patient"}
          </Button>
        </div>
      </form>
    </div>
  )
}
