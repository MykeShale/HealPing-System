"use client"

import type { DashboardStats } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Clock, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toLocaleString(),
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      change: "+5%",
      changeType: "positive" as const,
    },
    {
      title: "Pending Follow-ups",
      value: stats.pendingFollowUps.toLocaleString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      change: "-8%",
      changeType: "negative" as const,
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      change: "+3%",
      changeType: "positive" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={card.title} className="glass-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span className={`${card.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                {card.change}
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
