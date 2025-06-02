"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Profile, Clinic } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Save, User, Building, Bell, Shield, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    preferences: {
      email_notifications: true,
      sms_notifications: true,
      reminder_frequency: "daily",
    },
  })

  const [clinicForm, setClinicForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    settings: {
      default_appointment_duration: 30,
      reminder_advance_time: 24,
      working_hours: {
        start: "09:00",
        end: "17:00",
      },
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Fetch user profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profileData) {
          setProfile(profileData)
          setProfileForm({
            full_name: profileData.full_name || "",
            phone: profileData.phone || "",
            preferences: profileData.preferences || {
              email_notifications: true,
              sms_notifications: true,
              reminder_frequency: "daily",
            },
          })

          // Fetch clinic data
          if (profileData.clinic_id) {
            const { data: clinicData } = await supabase
              .from("clinics")
              .select("*")
              .eq("id", profileData.clinic_id)
              .single()

            if (clinicData) {
              setClinic(clinicData)
              setClinicForm({
                name: clinicData.name || "",
                address: clinicData.address || "",
                phone: clinicData.phone || "",
                email: clinicData.email || "",
                settings: clinicData.settings || {
                  default_appointment_duration: 30,
                  reminder_advance_time: 24,
                  working_hours: {
                    start: "09:00",
                    end: "17:00",
                  },
                },
              })
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          preferences: profileForm.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveClinic = async () => {
    setSaving(true)
    try {
      if (!clinic) return

      const { error } = await supabase
        .from("clinics")
        .update({
          name: clinicForm.name,
          address: clinicForm.address,
          phone: clinicForm.phone,
          email: clinicForm.email,
          settings: clinicForm.settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clinic.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Clinic settings updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update clinic settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and clinic preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="clinic" className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            Clinic
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic_name">Clinic Name</Label>
                  <Input
                    id="clinic_name"
                    value={clinicForm.name}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic_phone">Phone Number</Label>
                  <Input
                    id="clinic_phone"
                    value={clinicForm.phone}
                    onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic_email">Email Address</Label>
                  <Input
                    id="clinic_email"
                    type="email"
                    value={clinicForm.email}
                    onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment_duration">Default Appointment Duration (minutes)</Label>
                  <Input
                    id="appointment_duration"
                    type="number"
                    value={clinicForm.settings.default_appointment_duration}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        settings: {
                          ...clinicForm.settings,
                          default_appointment_duration: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic_address">Address</Label>
                <Textarea
                  id="clinic_address"
                  value={clinicForm.address}
                  onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Working Hours Start</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={clinicForm.settings?.working_hours?.start || "09:00"}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        settings: {
                          ...clinicForm.settings,
                          working_hours: {
                            ...clinicForm.settings.working_hours,
                            start: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Working Hours End</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={clinicForm.settings?.working_hours?.end || "17:00"}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        settings: {
                          ...clinicForm.settings,
                          working_hours: {
                            ...clinicForm.settings.working_hours,
                            end: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveClinic} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Clinic Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={profileForm.preferences.email_notifications}
                  onCheckedChange={(checked) =>
                    setProfileForm({
                      ...profileForm,
                      preferences: {
                        ...profileForm.preferences,
                        email_notifications: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={profileForm.preferences.sms_notifications}
                  onCheckedChange={(checked) =>
                    setProfileForm({
                      ...profileForm,
                      preferences: {
                        ...profileForm.preferences,
                        sms_notifications: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder_advance">Reminder Advance Time (hours)</Label>
                <Input
                  id="reminder_advance"
                  type="number"
                  value={clinicForm.settings.reminder_advance_time}
                  onChange={(e) =>
                    setClinicForm({
                      ...clinicForm,
                      settings: {
                        ...clinicForm.settings,
                        reminder_advance_time: Number.parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={saveProfile} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <p className="text-sm text-gray-500">Update your account password</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input id="current_password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <Input id="new_password" type="password" />
                  </div>
                </div>
                <Button variant="outline">Update Password</Button>
              </div>
              <div className="border-t pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
