"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/env"

const formSchema = z.object({
  patient_id: z.string().min(1, { message: "Please select a patient" }),
  reminder_type: z.string().min(1, { message: "Please select a reminder type" }),
  message: z.string().min(5, { message: "Message must be at least 5 characters" }),
  scheduled_date: z.date({ required_error: "Please select a date" }),
  status: z.string().default("pending"),
})

export function ReminderForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [patients, setPatients] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_id: "",
      reminder_type: "",
      message: "",
      status: "pending",
    },
  })

  useState(() => {
    const fetchPatients = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setError("Supabase is not configured. Please check your environment variables.")
          return
        }

        const { createSupabaseClient } = await import("@/lib/supabase")
        const supabase = createSupabaseClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("User not authenticated")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single()

        if (!profile?.clinic_id) {
          setError("Clinic not found")
          return
        }

        const { data, error: fetchError } = await supabase
          .from("patients")
          .select("id, name")
          .eq("clinic_id", profile.clinic_id)
          .order("name")

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        setPatients(data || [])
      } catch (err: any) {
        console.error("Error fetching patients:", err)
        setError(err.message || "Failed to load patients")
      }
    }

    fetchPatients()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase is not configured. Please check your environment variables.")
      }

      const { createSupabaseClient } = await import("@/lib/supabase")
      const supabase = createSupabaseClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single()

      if (!profile?.clinic_id) {
        throw new Error("Clinic not found")
      }

      const { error: insertError } = await supabase.from("reminders").insert([
        {
          patient_id: values.patient_id,
          reminder_type: values.reminder_type,
          message: values.message,
          scheduled_date: values.scheduled_date.toISOString(),
          status: values.status,
          clinic_id: profile.clinic_id,
          created_by: user.id,
        },
      ])

      if (insertError) {
        throw new Error(insertError.message)
      }

      router.push("/dashboard/reminders")
      router.refresh()
    } catch (err: any) {
      console.error("Error creating reminder:", err)
      setError(err.message || "Failed to create reminder")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Reminder</CardTitle>
        <CardDescription>Schedule a new reminder for a patient</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reminder_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reminder type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the reminder message" className="min-h-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scheduled_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Scheduled Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Reminder"}
        </Button>
      </CardFooter>
    </Card>
  )
}
