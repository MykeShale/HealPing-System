import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Users, Calendar, Bell, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">HealPing</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Smart Healthcare
            <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
              {" "}
              Follow-up System
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Streamline patient care with automated reminders, intelligent follow-ups, and comprehensive health tracking.
            Never miss a patient interaction again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need for patient care
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive tools designed to enhance patient relationships and improve health outcomes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="glass-card">
            <CardHeader>
              <Users className="w-12 h-12 text-blue-500 mb-4" />
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>
                Comprehensive patient profiles with medical history, contact information, and treatment plans.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <Calendar className="w-12 h-12 text-green-500 mb-4" />
              <CardTitle>Smart Scheduling</CardTitle>
              <CardDescription>
                Intelligent appointment scheduling with automated reminders and conflict detection.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <Bell className="w-12 h-12 text-purple-500 mb-4" />
              <CardTitle>Automated Reminders</CardTitle>
              <CardDescription>
                Customizable reminder system for appointments, medications, and follow-up care.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-orange-500 mb-4" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Comprehensive insights into patient care patterns and clinic performance metrics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <Shield className="w-12 h-12 text-red-500 mb-4" />
              <CardTitle>HIPAA Compliant</CardTitle>
              <CardDescription>
                Enterprise-grade security ensuring patient data privacy and regulatory compliance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <Heart className="w-12 h-12 text-pink-500 mb-4" />
              <CardTitle>Care Coordination</CardTitle>
              <CardDescription>
                Seamless communication between healthcare providers and patients for better outcomes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="glass-card text-center">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to transform your practice?
            </CardTitle>
            <CardDescription className="text-xl mb-8">
              Join thousands of healthcare providers using HealPing to deliver exceptional patient care.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-3">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 HealPing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
