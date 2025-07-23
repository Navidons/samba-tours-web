"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Download, 
  Search, 
  Mail, 
  Users, 
  TrendingUp, 
  Calendar,
  Filter,
  MoreHorizontal
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NewsletterSubscriber {
  id: number
  email: string
  name: string | null
  isActive: boolean
  source: string | null
  subscribedAt: string
  unsubscribedAt: string | null
  interests: any
  metadata: any
}

export default function NewsletterSubscribersClient() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<NewsletterSubscriber[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{
    total: number
    active: number
    inactive: number
    thisMonth: number
  }>({
    total: 0,
    active: 0,
    inactive: 0,
    thisMonth: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchSubscribers()
  }, [])

  useEffect(() => {
    filterSubscribers()
  }, [subscribers, searchTerm])

  const fetchSubscribers = async () => {
    try {
      setError(null)
      const response = await fetch("/api/admin/newsletter/subscribers")
      if (!response.ok) {
        throw new Error(`Failed to fetch subscribers: ${response.statusText}`)
      }
      const data = await response.json()
      if (!data.subscribers || !data.stats) {
        throw new Error("Invalid response format from server")
      }
      setSubscribers(data.subscribers)
      setStats(data.stats)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect to server"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterSubscribers = () => {
    const filtered = subscribers.filter(subscriber =>
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredSubscribers(filtered)
  }

  const exportSubscribers = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Export Successful",
          description: "Subscribers data has been exported to CSV",
        })
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export subscribers data",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading subscribers...</p>
      </div>
    </div>
  }

  if (error) {
    return <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={fetchSubscribers} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={exportSubscribers} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Subscribers ({filteredSubscribers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No subscribers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>{subscriber.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={subscriber.isActive ? "default" : "secondary"}>
                        {subscriber.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{subscriber.source || "—"}</TableCell>
                    <TableCell>{formatDate(subscriber.subscribedAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 
