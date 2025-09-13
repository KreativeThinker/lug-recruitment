"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthGuard } from "@/components/auth-guard"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

interface Applicant {
  id: number
  name: string
  email: string
  contact: string
  regno: string
  dep: string
  shortlisted: boolean | null
  created_at: string
}

const departmentNames: Record<string, string> = {
  tech: "Technology",
  cont: "Content",
  media: "Media",
  management: "Management",
}

export default function DepartmentPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([])
  const [selectedApplicants, setSelectedApplicants] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const params = useParams()
  const dept = params.dept as string

  useEffect(() => {
    const checkUserAndFetchApplicants = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Fetch applicants for the selected department
      const { data, error } = await supabase
        .from("applicants")
        .select("id, name, email, contact, regno, dep, shortlisted, created_at")
        .eq("dep", dept)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching applicants:", error)
      } else {
        setApplicants(data || [])
        setFilteredApplicants(data || [])
      }

      setLoading(false)
    }

    if (dept) {
      checkUserAndFetchApplicants()
    }
  }, [dept, router])

  useEffect(() => {
    let filtered = applicants

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (applicant) =>
          applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          applicant.regno.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "shortlisted") {
        filtered = filtered.filter((applicant) => applicant.shortlisted === true)
      } else if (statusFilter === "rejected") {
        filtered = filtered.filter((applicant) => applicant.shortlisted === false)
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((applicant) => applicant.shortlisted === null)
      }
    }

    setFilteredApplicants(filtered)
    // Clear selection when filters change
    setSelectedApplicants(new Set())
  }, [applicants, searchTerm, statusFilter])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplicants(new Set(filteredApplicants.map((a) => a.id)))
    } else {
      setSelectedApplicants(new Set())
    }
  }

  const handleSelectApplicant = (applicantId: number, checked: boolean) => {
    const newSelected = new Set(selectedApplicants)
    if (checked) {
      newSelected.add(applicantId)
    } else {
      newSelected.delete(applicantId)
    }
    setSelectedApplicants(newSelected)
  }

  const bulkUpdateStatus = async (shortlisted: boolean | null) => {
    if (selectedApplicants.size === 0) return

    setUpdating(true)
    const supabase = createClient()

    const { error } = await supabase.from("applicants").update({ shortlisted }).in("id", Array.from(selectedApplicants))

    if (error) {
      console.error("Error updating applicants:", error)
    } else {
      // Update local state
      setApplicants((prev) =>
        prev.map((applicant) => (selectedApplicants.has(applicant.id) ? { ...applicant, shortlisted } : applicant)),
      )
      setSelectedApplicants(new Set())
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
          <p className="text-white">Loading applicants...</p>
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
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-300 hover:text-white"
                >
                  ← Back
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-white">{departmentNames[dept]} Department</h1>
                  <p className="text-sm text-gray-400">Welcome, {user?.email}</p>
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Applicants</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedApplicants.size > 0 && (
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    {selectedApplicants.size} applicant{selectedApplicants.size > 1 ? "s" : ""} selected
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => bulkUpdateStatus(true)}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updating ? "Updating..." : "Shortlist Selected"}
                    </Button>
                    <Button
                      onClick={() => bulkUpdateStatus(false)}
                      disabled={updating}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {updating ? "Updating..." : "Reject Selected"}
                    </Button>
                    <Button
                      onClick={() => bulkUpdateStatus(null)}
                      disabled={updating}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      {updating ? "Updating..." : "Reset Selected"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white">{applicants.length}</div>
                <div className="text-sm text-gray-400">Total Applicants</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-400">
                  {applicants.filter((a) => a.shortlisted === true).length}
                </div>
                <div className="text-sm text-gray-400">Shortlisted</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-400">
                  {applicants.filter((a) => a.shortlisted === false).length}
                </div>
                <div className="text-sm text-gray-400">Rejected</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-400">
                  {applicants.filter((a) => a.shortlisted === null).length}
                </div>
                <div className="text-sm text-gray-400">Pending</div>
              </CardContent>
            </Card>
          </div>

          {filteredApplicants.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={
                    filteredApplicants.length > 0 &&
                    filteredApplicants.every((applicant) => selectedApplicants.has(applicant.id))
                  }
                  onCheckedChange={handleSelectAll}
                  className="border-gray-600 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                />
                <label htmlFor="select-all" className="text-sm text-gray-300 cursor-pointer">
                  Select all visible applicants
                </label>
              </div>
            </div>
          )}

          {/* Applicants List */}
          <div className="space-y-4">
            {filteredApplicants.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-400">No applicants found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredApplicants.map((applicant) => (
                <Card key={applicant.id} className="bg-gray-900 border-gray-800 hover:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedApplicants.has(applicant.id)}
                          onCheckedChange={(checked) => handleSelectApplicant(applicant.id, checked as boolean)}
                          className="mt-1 border-gray-600 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                        />
                        <div>
                          <CardTitle className="text-white">{applicant.name}</CardTitle>
                          <div className="text-sm text-gray-400 space-y-1 mt-2">
                            <div>Email: {applicant.email}</div>
                            <div>Contact: {applicant.contact}</div>
                            <div>Registration: {applicant.regno}</div>
                            <div>Applied: {new Date(applicant.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(applicant.shortlisted)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black">
                        <Link href={`/dashboard/department/${dept}/applicant/${applicant.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
