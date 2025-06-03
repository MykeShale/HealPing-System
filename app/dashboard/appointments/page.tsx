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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, Plus, Eye, Edit, Clock } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const fetchAppointments = async () => {
    try {
      setLoading(true)

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

      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          patient:patients(full_name, phone),
          doctor:profiles!appointments_doctor_id_fkey(full_name)
        `)
        .eq("clinic_id", profile.clinic_id)
        .order("appointment_date", { ascending: false })

      if (appointmentsError) {
        throw appointmentsError
      }

      setAppointments(appointments || [])
      setFilteredAppointments(appointments || [])
    } catch (error: any) {
      console.error("Error fetching appointments:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load appointments. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    let filtered = appointments

    if (searchQuery) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.patient?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.doctor?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.treatment_type?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }, [searchQuery, statusFilter, appointments])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage patient appointments and schedules</p>
        </div>
        <Button onClick={() => router.push("/dashboard/appointments/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Appointment Schedule ({appointments.length} appointments)</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery || statusFilter !== "all" ? "No appointments found" : "No appointments yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "Get started by scheduling your first appointment"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={() => router.push("/dashboard/appointments/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {appointment.patient?.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {appointment.patient?.full_name}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.patient?.phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{appointment.doctor?.full_name}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {format(new Date(appointment.appointment_date), "MMM dd, yyyy")}
                          </div>
                          <div className="text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(appointment.appointment_date), "HH:mm")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.treatment_type ? (
                          <Badge variant="outline">{appointment.treatment_type}</Badge>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === "completed"
                              ? "default"
                              : appointment.status === "cancelled"
                                ? "destructive"
                                : appointment.status === "no_show"
                                  ? "destructive"
                                  : "secondary"
                          }
                        >
                          {appointment.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {appointment.follow_up_date ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(appointment.follow_up_date), "MMM dd, yyyy")}
                            </div>
                            <div className="text-gray-500">{format(new Date(appointment.follow_up_date), "HH:mm")}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/appointments/${appointment.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/appointments/${appointment.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
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
