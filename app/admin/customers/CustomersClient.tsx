"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, Download, Eye, MessageSquare, Mail, RefreshCw, User, Calendar, DollarSign, MapPin, Phone, Clock, Star, Award, TrendingUp, FileText, Users, Building2, Globe, CreditCard, Target, BarChart3, Activity, CheckCircle, AlertCircle, Info } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  country: string
  city: string
  address: string
  totalBookings: number
  totalSpent: number
  firstBookingDate: string | null
  lastBookingDate: string | null
  status: "active" | "inactive" | "blocked"
  customerType: "regular" | "vip" | "repeat" | "new"
  loyaltyPoints: number
  preferredContactMethod: "email" | "phone" | "whatsapp"
  preferredContactTime: string
  notes: string
  joinDate: string
  updatedAt: string
  lastBooking: {
    reference: string
    date: string
    amount: number
    status: string
  } | null
  recentBookings?: Array<{
    id: number
    reference: string
    startDate: string
    endDate: string
    amount: number
    status: string
    createdAt: string
  }>
}

interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  totalRevenue: number
  avgOrderValue: number
}

interface CustomerResponse {
  success: boolean
  customers: Customer[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  stats: CustomerStats
  error?: string
}

interface FetchParams {
  page: number;
  search?: string;
  status?: string;
  customerType?: string;
  limit?: number;
}

const getStatusColor = (status: "active" | "inactive" | "blocked") => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "inactive":
      return "bg-gray-100 text-gray-800"
    case "blocked":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getCustomerTypeColor = (type: "regular" | "vip" | "repeat" | "new") => {
  switch (type) {
    case "vip":
      return "bg-purple-100 text-purple-800"
    case "repeat":
      return "bg-blue-100 text-blue-800"
    case "regular":
      return "bg-green-100 text-green-800"
    case "new":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [customerType, setCustomerType] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    template: 'custom'
  })
  const [sendingEmail, setSendingEmail] = useState(false)
  const { toast } = useToast()

  const fetchCustomers = async (params: FetchParams) => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit?.toString() || '10', // Default to 10 if not provided
        search: params.search || '',
        status: params.status || '',
        customerType: params.customerType || ''
      })

      const response = await fetch(`/api/admin/customers?${searchParams}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          // Don't throw on 401, just return null to let the middleware handle the redirect
          return null
        }
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch customers')
      }

      setCustomers(data.customers)
      setTotal(data.total)
      setStats(data.stats)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch customers',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers({ page, search, status, customerType })
  }, [page, search, status, customerType])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchCustomers({ page, search, status, customerType })
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    setPage(1)
  }

  const handleCustomerTypeChange = (newType: string) => {
    setCustomerType(newType)
    setPage(1)
  }

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/customers/export")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "customers.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Success",
        description: "Customers exported successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export customers",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount)
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer({
      ...customer,
      recentBookings: customer.recentBookings ?? []
    })
    setShowViewDialog(true)
  }

  const handleEmailCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEmailData({
      subject: '',
      message: '',
      template: 'custom'
    })
    setShowEmailDialog(true)
  }

  const handleSendEmail = async () => {
    if (!selectedCustomer || !emailData.subject || !emailData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setSendingEmail(true)
      // Map frontend template to backend template key
      let templateKey = emailData.template;
      if (emailData.template === 'welcome' || emailData.template === 'promotion') templateKey = 'custom';
      // Real API call
      let templateData;
      if (emailData.template === 'custom' || emailData.template === 'welcome' || emailData.template === 'promotion') {
        templateData = { customMessage: emailData.message, subject: emailData.subject };
      } else {
        templateData = { name: selectedCustomer.name, subject: emailData.subject, message: emailData.message };
      }
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedCustomer.email,
          subject: emailData.subject,
          template: templateKey,
          data: templateData
        })
      })
      if (!response.ok) throw new Error('Failed to send email')
      toast({
        title: "Success",
        description: `Email sent to ${selectedCustomer.email}`
      })
      setShowEmailDialog(false)
      setEmailData({ subject: '', message: '', template: 'custom' })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleTemplateChange = (template: string) => {
    setEmailData(prev => ({ ...prev, template }))
    
    // Pre-fill templates
    switch (template) {
      case 'welcome':
        setEmailData(prev => ({
          ...prev,
          subject: 'Welcome to Samba Tours!',
          message: `Dear ${selectedCustomer?.name},\n\nWelcome to Samba Tours! We're excited to have you as part of our community.\n\nBest regards,\nThe Samba Tours Team`
        }))
        break
      case 'promotion':
        setEmailData(prev => ({
          ...prev,
          subject: 'Special Offer Just for You!',
          message: `Dear ${selectedCustomer?.name},\n\nAs a valued customer, we have a special offer just for you!\n\nBest regards,\nThe Samba Tours Team`
        }))
        break
      case 'custom':
        setEmailData(prev => ({ ...prev, subject: '', message: '' }))
        break
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-10">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {search ? "Try adjusting your search or filters" : "Get started by adding a new customer"}
        </p>
        <div className="mt-6">
          <Button onClick={() => {
            setSearch("")
            setStatus("all")
            setCustomerType("all")
            setPage(1)
          }}>
            Clear filters
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="section-padding">
        <div className="container-max">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-earth-900 mb-2">Customer Management</h1>
              <p className="text-earth-600">Manage customer accounts and profiles</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fetchCustomers({ page, search, status, customerType })}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Customers
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-earth-900">{(stats.totalCustomers ?? 0).toLocaleString()}</div>
                <p className="text-sm text-earth-600">Total Customers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">{(stats.activeCustomers ?? 0).toLocaleString()}</div>
                <p className="text-sm text-earth-600">Active Customers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-forest-600">{formatCurrency(stats.totalRevenue ?? 0)}</div>
                <p className="text-sm text-earth-600">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.avgOrderValue ?? 0)}</div>
                <p className="text-sm text-earth-600">Avg. Order Value</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search customers..." 
                      className="pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                  <select 
                    value={customerType}
                    onChange={(e) => handleCustomerTypeChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-500"
                  >
                    <option value="all">All Types</option>
                    <option value="new">New</option>
                    <option value="regular">Regular</option>
                    <option value="repeat">Repeat</option>
                    <option value="vip">VIP</option>
                  </select>
                  <Button type="submit" variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Customers List */}
          <div className="space-y-4">
            {customers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={customer.name} />
                        <AvatarFallback>
                          {customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-earth-900">{customer.name}</h3>
                          <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                          <Badge className={getCustomerTypeColor(customer.customerType)}>{customer.customerType}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-earth-600">
                          <div>
                            <p className="font-medium">Contact</p>
                            <p>{customer.email}</p>
                            <p>{customer.phone || "No phone"}</p>
                          </div>
                          <div>
                            <p className="font-medium">Location</p>
                            <p>{customer.country || "Not specified"}</p>
                            <p>{customer.city || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="font-medium">Bookings</p>
                            <p>{customer.totalBookings} total</p>
                            <p>Last: {customer.lastBooking ? formatDate(customer.lastBooking.date) : "No bookings"}</p>
                          </div>
                          <div>
                            <p className="font-medium">Total Spent</p>
                            <p className="text-lg font-semibold text-forest-600">
                              {formatCurrency(customer.totalSpent)}
                            </p>
                            <p className="text-xs text-gray-500">{customer.loyaltyPoints} loyalty points</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEmailCustomer(customer)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {!loading && customers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 text-lg">No customers found</p>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {total > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-forest-600 text-white">
                  {page}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={!hasMore}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Customer Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details - {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <p className="text-gray-900 font-medium">{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email Address</label>
                        <p className="text-gray-900">{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Phone Number</label>
                        <p className="text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Preferred Contact Method</label>
                        <p className="text-gray-900 capitalize">{selectedCustomer.preferredContactMethod}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Country</label>
                        <p className="text-gray-900">{selectedCustomer.country || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">City</label>
                        <p className="text-gray-900">{selectedCustomer.city || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Address</label>
                        <p className="text-gray-900">{selectedCustomer.address || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Preferred Contact Time</label>
                        <p className="text-gray-900">{selectedCustomer.preferredContactTime || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Customer Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedCustomer.totalBookings}</div>
                      <p className="text-sm text-blue-600">Total Bookings</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.totalSpent)}</div>
                      <p className="text-sm text-green-600">Total Spent</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedCustomer.loyaltyPoints}</div>
                      <p className="text-sm text-purple-600">Loyalty Points</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{selectedCustomer.customerType}</div>
                      <p className="text-sm text-orange-600">Customer Type</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCustomer.recentBookings && selectedCustomer.recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {selectedCustomer.recentBookings.map((booking) => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">Booking #{booking.reference}</h4>
                              <p className="text-sm text-gray-600">
                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                              </p>
                            </div>
                            <Badge className={getStatusColor(booking.status as any)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-green-600">
                              {formatCurrency(booking.amount)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(booking.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent bookings</p>
                  )}
                </CardContent>
              </Card>

              {/* Customer Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Customer Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Customer Joined</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedCustomer.joinDate)}</p>
                      </div>
                    </div>
                    {selectedCustomer.firstBookingDate && (
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">First Booking</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedCustomer.firstBookingDate)}</p>
                        </div>
                      </div>
                    )}
                    {selectedCustomer.lastBookingDate && (
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Last Booking</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedCustomer.lastBookingDate)}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Last Updated</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedCustomer.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedCustomer.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedCustomer.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Email to {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Template</label>
              <Select 
                value={emailData.template} 
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Message</SelectItem>
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                  <SelectItem value="promotion">Promotional Offer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <Input 
                placeholder="Enter email subject..."
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <Textarea 
                placeholder="Enter your message..."
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                rows={8}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSendEmail} 
                disabled={sendingEmail || !emailData.subject || !emailData.message}
                className="flex-1"
              >
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowEmailDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
} 
