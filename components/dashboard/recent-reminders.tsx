"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import type { Reminder } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageSquare, Mail, Phone, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export function RecentReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentReminders = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: reminders } = await supabase
          .from("reminders")
          .select(`
            *,
            appointment:appointments(
              patient:patients(full_name, phone)
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        setReminders(reminders || [])
      } catch (error) {
        console.error("Error fetching recent reminders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentReminders()
  }, [])

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Recent Reminders</CardTitle>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No reminders sent yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(reminder.reminder_type)}
                    {getStatusIcon(reminder.status)}
                  </div>
                  <div>
                    <p className="font-medium">{reminder.appointment?.patient?.full_name}</p>
                    <p className="text-sm text-gray-500">{format(new Date(reminder.scheduled_for), "MMM dd, HH:mm")}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    reminder.status === "delivered"
                      ? "default"
                      : reminder.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {reminder.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/reminders">View All Reminders</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
