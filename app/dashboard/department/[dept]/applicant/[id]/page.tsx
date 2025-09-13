"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"

interface ApplicantDetails {
  id: number
  name: string
  email: string
  contact: string
  regno: string
  dep: string
  shortlisted: boolean | null
  created_at: string
  formdata: {
    questions: Record<string, string>
    common_questions: Record<string, string>
  }
}

const departmentNames: Record<string, string> = {
  tech: "Technology",
  cont: "Content",
  media: "Media",
  management: "Management",
}

export default function ApplicantDetailsPage() {
  const [applicant, setApplicant] = useState<ApplicantDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const dept = params.dept as string
  const applicantId = params.id as string

  useEffect(() => {
    const checkUserAndFetchApplicant = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Fetch applicant details
      const { data, error } = await supabase
        .from("applicants")
        .select("*")
        .eq("id", applicantId)
        .eq("dep", dept)
        .single()

      if (error) {
        console.error("Error fetching applicant:", error)
        router.push(`/dashboard/department/${dept}`)
      } else {
        setApplicant(data)
      }

      setLoading(false)
    }

    if (dept && applicantId) {
      checkUserAndFetchApplicant()
    }
  }, [dept, applicantId, router])

  const updateApplicantStatus = async (shortlisted: boolean | null) => {
    if (!applicant) return

    setUpdating(true)
    const supabase = createClient()

    const { error } = await supabase.from("applicants").update({ shortlisted }).eq("id", applicant.id)

    if (error) {
      console.error("Error updating applicant:", error)
    } else {
      setApplicant({ ...applicant, shortlisted })
    }

    setUpdating(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getStatusBadge = (shortlisted: boolean | null) => {
    if (shortlisted === true) {
      return <Badge className="bg-green-600 hover:bg-green-700">Shortlisted</Badge>
    } else if (shortlisted === false) {
      return <Badge className="bg-red-600 hover:bg-red-700">Rejected</Badge>
    } else {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          Pending
        </Badge>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading applicant details...</p>
        </div>
      </div>
    )
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Applicant not found</p>
          <Button
            onClick={() => router.push(`/dashboard/department/${dept}`)}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            Back to Department
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/dashboard/department/${dept}`)}
                  className="text-gray-300 hover:text-white"
                >
                  ← Back to {departmentNames[dept]}
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-white">{applicant.name}</h1>
                  <p className="text-sm text-gray-400">Applicant Details</p>
                </div>
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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Basic Information */}
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white">Basic Information</CardTitle>
                {getStatusBadge(applicant.shortlisted)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Name</label>
                  <p className="text-white">{applicant.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <p className="text-white">{applicant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Contact</label>
                  <p className="text-white">{applicant.contact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Registration Number</label>
                  <p className="text-white">{applicant.regno}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Department</label>
                  <p className="text-white">{departmentNames[applicant.dep]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Applied On</label>
                  <p className="text-white">{new Date(applicant.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Questions */}
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Common Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(applicant.formdata.common_questions).map(([question, answer]) => (
                <div key={question}>
                  <label className="text-sm font-medium text-gray-400">{question}</label>
                  <p className="text-white mt-1">{answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Department-Specific Questions */}
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Department-Specific Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(applicant.formdata.questions).map(([question, answer]) => (
                <div key={question}>
                  <label className="text-sm font-medium text-gray-400">{question}</label>
                  <p className="text-white mt-1">{answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => updateApplicantStatus(true)}
                  disabled={updating || applicant.shortlisted === true}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {updating ? "Updating..." : "Shortlist"}
                </Button>
                <Button
                  onClick={() => updateApplicantStatus(false)}
                  disabled={updating || applicant.shortlisted === false}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {updating ? "Updating..." : "Reject"}
                </Button>
                <Button
                  onClick={() => updateApplicantStatus(null)}
                  disabled={updating || applicant.shortlisted === null}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  {updating ? "Updating..." : "Reset to Pending"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
