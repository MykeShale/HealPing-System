import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Calendar, Bell, Users, BarChart3, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
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
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {" "}
              Follow-up System
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Revolutionize your medical practice with intelligent patient follow-ups, automated reminders, and
            comprehensive care management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need for better patient care
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Streamline your practice with our comprehensive suite of healthcare management tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Patient Management",
              description: "Comprehensive patient profiles with medical history, preferences, and communication logs.",
            },
            {
              icon: Calendar,
              title: "Smart Scheduling",
              description: "AI-powered appointment scheduling with conflict detection and optimal time suggestions.",
            },
            {
              icon: Bell,
              title: "Multi-Channel Reminders",
              description: "Automated SMS, email, and WhatsApp reminders with delivery confirmations.",
            },
            {
              icon: BarChart3,
              title: "Analytics Dashboard",
              description: "Real-time insights into patient engagement, follow-up rates, and practice performance.",
            },
            {
              icon: Shield,
              title: "HIPAA Compliant",
              description: "Enterprise-grade security with end-to-end encryption and compliance standards.",
            },
            {
              icon: Heart,
              title: "Care Coordination",
              description: "Seamless communication between healthcare providers and patients.",
            },
          ].map((feature, index) => (
            <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your practice?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of healthcare providers who trust HealPing</p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">HealPing</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">© 2024 HealPing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
