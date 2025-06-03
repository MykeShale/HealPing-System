"use client"

import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Users, Calendar, TrendingUp, Clock, CheckCircle } from "lucide-react"

interface AnalyticsData {
  totalPatients: number
  totalAppointments: number
  completionRate: number
  averageFollowUpTime: number
  appointmentsByMonth: Array<{ month: string; appointments: number }>
  appointmentsByStatus: Array<{ status: string; count: number; color: string }>
  remindersByType: Array<{ type: string; count: number; color: string }>
  reminderEffectiveness: Array<{ month: string; sent: number; responded: number }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single()

        if (!profile?.clinic_id) return

        // Fetch basic statistics
        const [patientsResult, appointmentsResult, remindersResult] = await Promise.all([
          supabase.from("patients").select("id", { count: "exact" }).eq("clinic_id", profile.clinic_id),
          supabase.from("appointments").select("*").eq("clinic_id", profile.clinic_id),
          supabase.from("reminders").select("*"),
        ])

        const totalPatients = patientsResult.count || 0
        const appointments = appointmentsResult.data || []
        const reminders = remindersResult.data || []

        // Calculate completion rate
        const completedAppointments = appointments.filter((apt) => apt.status === "completed").length
        const completionRate =
          appointments.length > 0 ? Math.round((completedAppointments / appointments.length) * 100) : 0

        // Calculate average follow-up time (mock data for demo)
        const averageFollowUpTime = 7 // days

        // Appointments by month (last 6 months)
        const appointmentsByMonth = [
          { month: "Jan", appointments: 45 },
          { month: "Feb", appointments: 52 },
          { month: "Mar", appointments: 48 },
          { month: "Apr", appointments: 61 },
          { month: "May", appointments: 55 },
          { month: "Jun", appointments: 67 },
        ]

        // Appointments by status
        const statusCounts = appointments.reduce(
          (acc, apt) => {
            acc[apt.status] = (acc[apt.status] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        const appointmentsByStatus = [
          { status: "Completed", count: statusCounts.completed || 0, color: "#10B981" },
          { status: "Scheduled", count: statusCounts.scheduled || 0, color: "#3B82F6" },
          { status: "Cancelled", count: statusCounts.cancelled || 0, color: "#EF4444" },
          { status: "No Show", count: statusCounts.no_show || 0, color: "#F59E0B" },
        ]

        // Reminders by type
        const typeCounts = reminders.reduce(
          (acc, reminder) => {
            acc[reminder.reminder_type] = (acc[reminder.reminder_type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        const remindersByType = [
          { type: "SMS", count: typeCounts.sms || 0, color: "#8B5CF6" },
          { type: "Email", count: typeCounts.email || 0, color: "#06B6D4" },
          { type: "WhatsApp", count: typeCounts.whatsapp || 0, color: "#10B981" },
          { type: "Call", count: typeCounts.call || 0, color: "#F59E0B" },
        ]

        // Reminder effectiveness (mock data)
        const reminderEffectiveness = [
          { month: "Jan", sent: 120, responded: 95 },
          { month: "Feb", sent: 135, responded: 108 },
          { month: "Mar", sent: 128, responded: 102 },
          { month: "Apr", sent: 142, responded: 118 },
          { month: "May", sent: 155, responded: 128 },
          { month: "Jun", sent: 168, responded: 142 },
        ]

        setAnalytics({
          totalPatients,
          totalAppointments: appointments.length,
          completionRate,
          averageFollowUpTime,
          appointmentsByMonth,
          appointmentsByStatus,
          remindersByType,
          reminderEffectiveness,
        })
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No data available</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Insights into your practice performance and patient engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalPatients}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalAppointments}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.completionRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3% from last month
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Follow-up Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.averageFollowUpTime} days</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                  -2 days from last month
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointments by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.appointmentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.appointmentsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.appointmentsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reminder Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.remindersByType} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reminder Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.reminderEffectiveness}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} name="Sent" />
                <Line type="monotone" dataKey="responded" stroke="#10B981" strokeWidth={2} name="Responded" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
