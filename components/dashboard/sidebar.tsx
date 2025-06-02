"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Profile } from "@/types"
import { Calendar, Users, Bell, BarChart3, Settings, Heart, Home, Clock } from "lucide-react"

interface SidebarProps {
  profile: Profile
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { name: "Follow-ups", href: "/dashboard/follow-ups", icon: Clock },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">HealPing</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Healthcare System</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive
                        ? "text-blue-500 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400",
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">{profile.full_name.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{profile.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{profile.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
