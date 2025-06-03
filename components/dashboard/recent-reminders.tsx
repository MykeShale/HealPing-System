"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import type { Reminder } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageSquare, Mail, Phone, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

export function RecentReminders() {
  const router = useRouter()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single()

        if (!profile?.clinic_id) return

        const { data: reminders } = await supabase
          .from("reminders")
          .select(`
            *,
            appointment:appointments(
              patient:patients(full_name),
              appointment_date
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        setReminders(reminders || [])
      } catch (error) {
        console.error("Error fetching reminders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sms":
        return <MessageSquare className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2 text-orange-600" />
          Recent Reminders
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/reminders")}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent reminders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      {getTypeIcon(reminder.reminder_type)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {reminder.appointment?.patient?.full_name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="capitalize">{reminder.reminder_type}</span>
                      <span>•</span>
                      <span>{format(new Date(reminder.scheduled_for), "MMM dd, HH:mm")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(reminder.status)}
                  <Badge
                    variant={
                      reminder.status === "delivered"
                        ? "default"
                        : reminder.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs capitalize"
                  >
                    {reminder.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
