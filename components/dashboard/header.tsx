"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import type { Profile } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, Search, UserPlus, Calendar, LogOut, User, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HeaderProps {
  profile: Profile
}

export function Header({ profile }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      const supabase = createSupabaseClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddPatient = () => {
    router.push("/dashboard/patients/new")
  }

  const handleScheduleAppointment = () => {
    router.push("/dashboard/appointments/new")
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search patients, appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleAddPatient} className="hidden sm:flex">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>

            <Button variant="outline" size="sm" onClick={handleScheduleAppointment} className="hidden sm:flex">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{profile.full_name.charAt(0).toUpperCase()}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">{profile.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
