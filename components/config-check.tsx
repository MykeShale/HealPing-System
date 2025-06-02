"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { isSupabaseConfigured } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConfigCheckProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ConfigCheck({ children, fallback }: ConfigCheckProps) {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured())
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>
              Application is not properly configured. Please contact your administrator.
            </AlertDescription>
          </Alert>
        </div>
      )
    )
  }

  return <>{children}</>
}
