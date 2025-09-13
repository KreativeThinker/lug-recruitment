"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const departments = [
  { id: "tech", name: "Technology", description: "Programming, Linux systems, and technical projects" },
  { id: "cont", name: "Content", description: "Writing, documentation, and content creation" },
  { id: "media", name: "Media", description: "Design, photography, and multimedia content" },
  { id: "management", name: "Management", description: "Event planning, coordination, and leadership" },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Verify panelist role
      const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

      if (!userData || userData.role !== "panelist") {
        router.push("/auth/unauthorized")
        return
      }

      setUser(user)
      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const selectDepartment = (departmentId: string) => {
    router.push(`/dashboard/department/${departmentId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-white">Linux Club Recruitment Panel</h1>
              <p className="text-sm text-gray-400">Welcome, {user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Select Department</h2>
          <p className="text-gray-400">Choose a department to review applicants</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept) => (
            <Card
              key={dept.id}
              className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition-colors cursor-pointer"
              onClick={() => selectDepartment(dept.id)}
            >
              <CardHeader>
                <CardTitle className="text-white">{dept.name}</CardTitle>
                <CardDescription className="text-gray-400">{dept.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium">
                  View Applicants
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
