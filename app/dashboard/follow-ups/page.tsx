"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import type { Appointment } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Clock, Calendar, User, Phone, Eye, Bell } from "lucide-react"
import { format, isBefore, addDays } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<Appointment[]>([])
  const [filteredFollowUps, setFilteredFollowUps] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single()

        if (!profile?.clinic_id) return

        const { data: appointments } = await supabase
          .from("appointments")
          .select(`
            *,
            patient:patients(full_name, phone, email),
            doctor:profiles!appointments_doctor_id_fkey(full_name)
          `)
          .eq("clinic_id", profile.clinic_id)
          .not("follow_up_date", "is", null)
          .order("follow_up_date", { ascending: true })

        setFollowUps(appointments || [])
        setFilteredFollowUps(appointments || [])
      } catch (error) {
        console.error("Error fetching follow-ups:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFollowUps()
  }, [])

  useEffect(() => {
    const filtered = followUps.filter(
      (followUp) =>
        followUp.patient?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        followUp.patient?.phone.includes(searchQuery) ||
        followUp.treatment_type?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredFollowUps(filtered)
  }, [searchQuery, followUps])

  const getFollowUpStatus = (followUpDate: string) => {
    const now = new Date()
    const followUp = new Date(followUpDate)
    const threeDaysFromNow = addDays(now, 3)

    if (isBefore(followUp, now)) {
      return { status: "overdue", variant: "destructive" as const, label: "Overdue" }
    } else if (isBefore(followUp, threeDaysFromNow)) {
      return { status: "upcoming", variant: "default" as const, label: "Due Soon" }
    } else {
      return { status: "scheduled", variant: "secondary" as const, label: "Scheduled" }
    }
  }

  const sendReminder = async (appointmentId: string) => {
    try {
      const supabase = createSupabaseClient()

      // Create a reminder for this follow-up
      const { error } = await supabase.from("reminders").insert({
        appointment_id: appointmentId,
        reminder_type: "sms",
        scheduled_for: new Date().toISOString(),
        message_content: "This is a reminder for your upcoming follow-up appointment.",
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Reminder sent successfully",
      })
    } catch (error) {
      console.error("Error sending reminder:", error)
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      })
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Follow-ups</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage patient follow-up appointments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredFollowUps.filter((f) => getFollowUpStatus(f.follow_up_date!).status === "overdue").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredFollowUps.filter((f) => getFollowUpStatus(f.follow_up_date!).status === "upcoming").length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredFollowUps.filter((f) => getFollowUpStatus(f.follow_up_date!).status === "scheduled").length}
                </p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Follow-up Schedule</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search follow-ups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFollowUps.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No follow-ups found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? "Try adjusting your search criteria" : "No follow-up appointments scheduled"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Original Appointment</TableHead>
                    <TableHead>Follow-up Date</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFollowUps.map((followUp) => {
                    const statusInfo = getFollowUpStatus(followUp.follow_up_date!)
                    return (
                      <TableRow key={followUp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {followUp.patient?.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{followUp.patient?.full_name}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {followUp.patient?.phone}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(followUp.appointment_date), "MMM dd, yyyy")}
                            </div>
                            <div className="text-gray-500">{format(new Date(followUp.appointment_date), "HH:mm")}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(followUp.follow_up_date!), "MMM dd, yyyy")}
                            </div>
                            <div className="text-gray-500">{format(new Date(followUp.follow_up_date!), "HH:mm")}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {followUp.treatment_type ? (
                            <Badge variant="outline">{followUp.treatment_type}</Badge>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{followUp.doctor?.full_name}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendReminder(followUp.id)}
                              title="Send Reminder"
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/appointments/${followUp.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
