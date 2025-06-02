"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Reminder } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Bell, Plus, MessageSquare, Mail, Phone, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchReminders = async () => {
      try {
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
              patient:patients(full_name, phone),
              appointment_date,
              treatment_type
            )
          `)
          .order("scheduled_for", { ascending: false })

        setReminders(reminders || [])
        setFilteredReminders(reminders || [])
      } catch (error) {
        console.error("Error fetching reminders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [])

  useEffect(() => {
    let filtered = reminders

    if (searchQuery) {
      filtered = filtered.filter(
        (reminder) =>
          reminder.appointment?.patient?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reminder.appointment?.patient?.phone.includes(searchQuery) ||
          reminder.message_content?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((reminder) => reminder.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((reminder) => reminder.reminder_type === typeFilter)
    }

    setFilteredReminders(filtered)
  }, [searchQuery, statusFilter, typeFilter, reminders])

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
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reminders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage patient reminders and notifications</p>
        </div>
        <Button onClick={() => router.push("/dashboard/reminders/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Reminder
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle>Reminder History</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search reminders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReminders.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reminders found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "Get started by creating your first reminder"}
              </p>
              {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
                <Button onClick={() => router.push("/dashboard/reminders/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Reminder
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReminders.map((reminder) => (
                    <TableRow key={reminder.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {reminder.appointment?.patient?.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {reminder.appointment?.patient?.full_name}
                            </p>
                            <p className="text-sm text-gray-500">{reminder.appointment?.patient?.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(reminder.reminder_type)}
                          <span className="capitalize">{reminder.reminder_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{format(new Date(reminder.scheduled_for), "MMM dd, yyyy")}</div>
                          <div className="text-gray-500">{format(new Date(reminder.scheduled_for), "HH:mm")}</div>
                        </div>
                      </TableCell>
                      <TableCell>
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
                            className="capitalize"
                          >
                            {reminder.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {reminder.sent_at ? (
                          <div className="text-sm">
                            <div>{format(new Date(reminder.sent_at), "MMM dd, yyyy")}</div>
                            <div className="text-gray-500">{format(new Date(reminder.sent_at), "HH:mm")}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not sent</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">
                          {reminder.message_content || "No message"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
