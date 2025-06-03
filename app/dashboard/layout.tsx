import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Check for auth cookie to determine if user is logged in
  const cookieStore = cookies()
  const hasAuthCookie =
    cookieStore.has("sb-auth-token") || cookieStore.has("supabase-auth-token") || cookieStore.has("sb:token")

  if (!hasAuthCookie) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
      </main>
    </div>
  )
}
