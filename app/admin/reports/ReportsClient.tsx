"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Download,
  CalendarIcon,
  FileText,
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  Eye,
  Trash2,
  Plus,
  Clock,
  Mail,
  Settings,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

const reportTypes = [
  {
    id: "revenue",
    name: "Revenue Report",
    description: "Detailed revenue analysis and trends",
    icon: DollarSign,
    color: "bg-green-100 text-green-800",
    fields: ["Total Revenue", "Revenue by Month", "Revenue by Tour", "Payment Methods"]
  },
  {
    id: "bookings",
    name: "Bookings Report",
    description: "Booking statistics and patterns",
    icon: CalendarIcon,
    color: "bg-blue-100 text-blue-800",
    fields: ["Total Bookings", "Bookings by Status", "Bookings by Tour", "Customer Patterns"]
  },
  {
    id: "customers",
    name: "Customer Report",
    description: "Customer demographics and behavior",
    icon: Users,
    color: "bg-purple-100 text-purple-800",
    fields: ["Total Customers", "New Customers", "Customer Demographics", "Top Customers"]
  },
  {
    id: "tours",
    name: "Tours Performance",
    description: "Tour popularity and performance metrics",
    icon: MapPin,
    color: "bg-orange-100 text-orange-800",
    fields: ["Total Tours", "Popular Tours", "Tour Performance", "Customer Reviews"]
  },
]

interface RecentReport {
  id: string
  name: string
  type: string
  generated: string
  size: string
  format: string
  status: string
}

interface ScheduledReport {
  id: string
  name: string
  frequency: string
  nextRun: string
  recipients: string[]
  status: string
}

export default function ReportsClient() {
  const [selectedReportType, setSelectedReportType] = useState("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [reportName, setReportName] = useState("")
  const [formatType, setFormatType] = useState("csv")
  const [loading, setLoading] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    name: "",
    frequency: "daily",
    recipients: "",
    time: "08:00"
  })
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const { toast } = useToast()

  // Fetch recent and scheduled reports
  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoadingReports(true)
    try {
      // Fetch recent reports
      const recentRes = await fetch("/api/admin/reports/recent")
      if (recentRes.ok) {
        const recentData = await recentRes.json()
        setRecentReports(recentData.reports || [])
      }

      // Fetch scheduled reports
      const scheduledRes = await fetch("/api/admin/reports/scheduled")
      if (scheduledRes.ok) {
        const scheduledData = await scheduledRes.json()
        setScheduledReports(scheduledData.reports || [])
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive"
      })
    } finally {
      setLoadingReports(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!selectedReportType || !reportName) {
      toast({ 
        title: "Validation Error", 
        description: "Please select a report type and enter a report name", 
        variant: "destructive" 
      })
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedReportType,
          dateFrom: dateFrom ? dateFrom.toISOString().split("T")[0] : undefined,
          dateTo: dateTo ? dateTo.toISOString().split("T")[0] : undefined,
          format: formatType,
        }),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to generate report")
      }
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${reportName || selectedReportType}-report.${formatType}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      
      toast({ 
        title: "Success", 
        description: "Report generated and downloaded successfully!" 
      })
      
      // Refresh reports list
      await fetchReports()
      
      // Reset form
      setReportName("")
      setDateFrom(undefined)
      setDateTo(undefined)
      
    } catch (err) {
      console.error("Report generation error:", err)
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : "Failed to generate report", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleReport = async () => {
    if (!scheduleData.name || !scheduleData.recipients) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      })
      return
    }

    try {
      const res = await fetch("/api/admin/reports/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: scheduleData.name,
          frequency: scheduleData.frequency,
          recipients: scheduleData.recipients.split(",").map(email => email.trim()),
          time: scheduleData.time
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to schedule report")
      }

      toast({ 
        title: "Success", 
        description: "Report scheduled successfully!" 
      })
      setShowScheduleDialog(false)
      setScheduleData({ name: "", frequency: "daily", recipients: "", time: "08:00" })
      
      // Refresh scheduled reports
      await fetchReports()
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to schedule report", 
        variant: "destructive" 
      })
    }
  }

  const handleDeleteReport = async (reportId: string, type: 'recent' | 'scheduled') => {
    try {
      const endpoint = type === 'recent' 
        ? `/api/admin/reports/recent?id=${reportId}` 
        : `/api/admin/reports/scheduled?id=${reportId}`
      const res = await fetch(endpoint, { method: "DELETE" })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete report")
      }

      toast({ 
        title: "Success", 
        description: "Report deleted successfully!" 
      })
      
      // Refresh reports
      await fetchReports()
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to delete report", 
        variant: "destructive" 
      })
    }
  }

  const handleReportTypeSelect = (typeId: string) => {
    setSelectedReportType(typeId)
    // Auto-generate report name based on type and date
    const type = reportTypes.find(t => t.id === typeId)
    const dateRange = dateFrom && dateTo 
      ? `${format(dateFrom, 'MMM dd')} - ${format(dateTo, 'MMM dd, yyyy')}`
      : format(new Date(), 'MMMM yyyy')
    
    setReportName(`${type?.name} - ${dateRange}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 mb-2">Reports</h1>
          <p className="text-earth-600">Generate and manage business reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReports} disabled={loadingReports}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingReports ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button className="bg-forest-600 hover:bg-forest-700">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="schedule-name">Report Name</Label>
                  <Input
                    id="schedule-name"
                    value={scheduleData.name}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select value={scheduleData.frequency} onValueChange={(value) => setScheduleData(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Recipients (comma-separated)</Label>
                  <Textarea
                    value={scheduleData.recipients}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, recipients: e.target.value }))}
                    placeholder="email1@example.com, email2@example.com"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleScheduleReport} className="flex-1">
                    Schedule Report
                  </Button>
                  <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Generate Report */}
        <TabsContent value="generate">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Types */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Report Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reportTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedReportType === type.id
                          ? "border-forest-600 bg-forest-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleReportTypeSelect(type.id)}
                    >
                      <div className="flex items-center gap-3">
                        <type.icon className="h-5 w-5 text-forest-600" />
                        <div>
                          <h4 className="font-medium text-earth-900">{type.name}</h4>
                          <p className="text-sm text-earth-600">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Report Configuration */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input
                      id="report-name"
                      placeholder="Enter report name"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date From</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Date To</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select value={formatType} onValueChange={setFormatType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedReportType && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-earth-900 mb-2">Report will include:</h4>
                      <ul className="text-sm text-earth-600 space-y-1">
                        {reportTypes.find(t => t.id === selectedReportType)?.fields.map((field, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-forest-600 rounded-full"></div>
                            {field}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateReport}
                    disabled={!selectedReportType || !reportName || loading}
                    className="w-full bg-forest-600 hover:bg-forest-700"
                  >
                    {loading ? (
                      <span>Generating...</span>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Recent Reports */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingReports ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading reports...
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-8 text-earth-600">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No recent reports found</p>
                  <p className="text-sm">Generate your first report to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <FileText className="h-8 w-8 text-forest-600" />
                        <div>
                          <h4 className="font-medium text-earth-900">{report.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{report.type}</Badge>
                            <Badge variant="outline">{report.format}</Badge>
                            <span className="text-sm text-earth-600">{report.size}</span>
                          </div>
                          <p className="text-sm text-earth-500">Generated: {report.generated}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteReport(report.id, 'recent')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports */}
        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingReports ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading scheduled reports...
                </div>
              ) : scheduledReports.length === 0 ? (
                <div className="text-center py-8 text-earth-600">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No scheduled reports found</p>
                  <p className="text-sm">Schedule your first report to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-earth-900">{report.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-earth-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {report.frequency}
                          </span>
                          <span>Next run: {report.nextRun}</span>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-earth-500 mt-1 flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Recipients: {report.recipients.join(", ")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteReport(report.id, 'scheduled')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
