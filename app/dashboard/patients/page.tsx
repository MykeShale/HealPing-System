"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase"
import type { Patient } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserPlus, Phone, Mail, Calendar, Edit, Eye } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const fetchPatients = async () => {
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

      const { data: patients, error: patientsError } = await supabase
        .from("patients")
        .select("*")
        .eq("clinic_id", profile.clinic_id)
        .order("created_at", { ascending: false })

      if (patientsError) {
        throw patientsError
      }

      setPatients(patients || [])
      setFilteredPatients(patients || [])
    } catch (error: any) {
      console.error("Error fetching patients:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load patients. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.includes(searchQuery) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredPatients(filtered)
  }, [searchQuery, patients])

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your patient records and information</p>
        </div>
        <Button onClick={() => router.push("/dashboard/patients/new")}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Patient Directory ({patients.length} patients)</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? "No patients found" : "No patients yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery ? "Try adjusting your search criteria" : "Get started by adding your first patient"}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push("/dashboard/patients/new")}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Communication</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {patient.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{patient.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3 w-3 mr-1" />
                            {patient.phone}
                          </div>
                          {patient.email && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-3 w-3 mr-1" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.date_of_birth ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {format(new Date(patient.date_of_birth), "MMM dd, yyyy")}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {patient.communication_preferences?.sms && (
                            <Badge variant="secondary" className="text-xs">
                              SMS
                            </Badge>
                          )}
                          {patient.communication_preferences?.email && (
                            <Badge variant="secondary" className="text-xs">
                              Email
                            </Badge>
                          )}
                          {patient.communication_preferences?.whatsapp && (
                            <Badge variant="secondary" className="text-xs">
                              WhatsApp
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(patient.created_at), "MMM dd, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/patients/${patient.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/patients/${patient.id}/edit`}>
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
