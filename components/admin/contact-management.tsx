"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MessageSquare,
  Search,
  Filter,
  MoreHorizontal,
  Reply,
  Trash2,
  Clock,
  CheckCircle,
  RefreshCw,
  Eye,
  Edit,
} from "lucide-react"

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  tourType: string
  travelDate: string
  groupSize: string
  message: string
  status: "pending" | "replied" | "resolved"
  priority: "low" | "medium" | "high"
  source: string
  createdAt: string
  updatedAt: string
  notes?: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "replied":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "resolved":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200"
    case "medium":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function ContactManagement() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/contact")
      const result = await response.json()

      if (result.success) {
        setSubmissions(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSubmission = async (id: string, updates: Partial<ContactSubmission>) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const result = await response.json()

      if (result.success) {
        await fetchSubmissions()
        setSelectedSubmission(null)
      }
    } catch (error) {
      console.error("Error updating submission:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteSubmission = async (id: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        await fetchSubmissions()
      }
    } catch (error) {
      console.error("Error deleting submission:", error)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const filteredSubmissions = submissions.filter(
    (submission) =>
      submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.tourType.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    resolved: submissions.filter((s) => s.status === "resolved").length,
    avgResponseTime: "2.4h",
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Contact Management
          </h1>
          <p className="text-gray-600 mt-2">Manage customer inquiries and communications</p>
        </div>
        <Button onClick={fetchSubmissions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Replies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Reply className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger
            value="messages"
            className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
          >
            Messages
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 bg-transparent">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 bg-transparent">
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Contact Submissions</CardTitle>
              <CardDescription>Customer inquiries and contact form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-orange-500" />
                  <span className="ml-2 text-gray-600">Loading submissions...</span>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    No contact submissions found. {searchQuery && "Try adjusting your search terms."}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Tour Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((submission) => (
                        <TableRow key={submission.id} className="hover:bg-orange-50/50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{submission.name}</div>
                              <div className="text-sm text-gray-500">{submission.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-orange-200 text-orange-700">
                              {submission.tourType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(submission.priority)}>{submission.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(submission.createdAt).toLocaleDateString()}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{submission.source}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedSubmission(submission)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateSubmission(submission.id, { status: "replied" })}
                                >
                                  <Reply className="h-4 w-4 mr-2" />
                                  Mark as Replied
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateSubmission(submission.id, { status: "resolved" })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteSubmission(submission.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Contact Analytics</CardTitle>
              <CardDescription>Insights into customer communication patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Popular Tour Types</h3>
                  <div className="space-y-3">
                    {["Gorilla Trekking", "Wildlife Safari", "Cultural Tours", "Adventure Tours"].map((type, index) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-gray-700">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full"
                              style={{ width: `${[65, 45, 30, 20][index]}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600">{[65, 45, 30, 20][index]}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Response Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Average Response Time</span>
                      <span className="font-medium text-gray-900">2.4 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Resolution Rate</span>
                      <span className="font-medium text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Customer Satisfaction</span>
                      <span className="font-medium text-green-600">4.8/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Conversion Rate</span>
                      <span className="font-medium text-orange-600">68%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submission Detail Dialog */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-900">Contact Submission Details</DialogTitle>
              <DialogDescription>
                From {selectedSubmission.name} • {new Date(selectedSubmission.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-900">{selectedSubmission.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{selectedSubmission.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{selectedSubmission.phone || "Not provided"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tour Type:</span>
                  <p className="text-gray-900">{selectedSubmission.tourType}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Travel Date:</span>
                  <p className="text-gray-900">{selectedSubmission.travelDate || "Not specified"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Group Size:</span>
                  <p className="text-gray-900">{selectedSubmission.groupSize || "Not specified"}</p>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700">Message:</span>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                  {selectedSubmission.message || "No message provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <div className="mt-1">
                    <Select
                      value={selectedSubmission.status}
                      onValueChange={(value) => updateSubmission(selectedSubmission.id, { status: value as any })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <div className="mt-1">
                    <Select
                      value={selectedSubmission.priority}
                      onValueChange={(value) => updateSubmission(selectedSubmission.id, { priority: value as any })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700">Internal Notes:</span>
                <Textarea
                  placeholder="Add internal notes about this submission..."
                  value={selectedSubmission.notes || ""}
                  onChange={(e) => setSelectedSubmission({ ...selectedSubmission, notes: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() =>
                    updateSubmission(selectedSubmission.id, {
                      status: selectedSubmission.status,
                      priority: selectedSubmission.priority,
                      notes: selectedSubmission.notes,
                    })
                  }
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Submission
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
