"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Eye, 
  Archive, 
  Trash2, 
  Reply, 
  Search, 
  Filter,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Calendar,
  MessageSquare,
  Send,
  X,
  Paperclip,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  FileText,
  Type
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContactInquiry {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  tourInterest: string | null
  priority: "Low" | "Normal" | "High" | "Urgent"
  status: "new" | "read" | "replied" | "archived"
  createdAt: string
  updatedAt: string
  repliedAt?: string | null
  assignedUser?: {
    id: number
    email: string
    profile?: {
      fullName: string | null
      firstName: string | null
      lastName: string | null
    }
  } | null
}

interface Attachment {
  id: string
  name: string
  size: number
  type: string
  file: File
}

export default function ContactManagementClient() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<ContactInquiry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
  const [replyData, setReplyData] = useState({
    subject: "",
    message: "",
    isHtml: true
  })
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isHtmlMode, setIsHtmlMode] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    archived: 0
  })
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchInquiries()
  }, [])

  useEffect(() => {
    filterInquiries()
  }, [inquiries, searchTerm, statusFilter])

  const fetchInquiries = async () => {
    try {
      const response = await fetch("/api/admin/contact")
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Authentication issue - redirect to login
          window.location.href = '/signin'
          return
        }
        
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("Non-JSON Response:", textResponse)
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      
      if (!data.inquiries || !Array.isArray(data.inquiries)) {
        console.error("Invalid data structure:", data)
        throw new Error("Invalid response structure from server")
      }

      setInquiries(data.inquiries)
      
      // Calculate stats
      const stats = {
        total: data.inquiries.length,
        new: data.inquiries.filter((i: ContactInquiry) => i.status === "new").length,
        read: data.inquiries.filter((i: ContactInquiry) => i.status === "read").length,
        replied: data.inquiries.filter((i: ContactInquiry) => i.status === "replied").length,
        archived: data.inquiries.filter((i: ContactInquiry) => i.status === "archived").length
      }
      setStats(stats)
    } catch (error) {
      console.error("Fetch inquiries error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch contact inquiries",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterInquiries = () => {
    let filtered = inquiries

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(inquiry =>
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.tourInterest?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter)
    }

    setFilteredInquiries(filtered)
  }

  const updateInquiryStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/signin'
        return
      }

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Inquiry marked as ${status}`,
        })
        fetchInquiries() // Refresh the list
      } else {
        const errorText = await response.text()
        console.error("Update status error:", errorText)
        toast({
          title: "Update Failed",
          description: "Failed to update inquiry status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Update inquiry status error:", error)
      toast({
        title: "Error",
        description: "Failed to update inquiry",
        variant: "destructive",
      })
    }
  }

  const updateInquiryPriority = async (id: number, priority: string) => {
    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priority }),
      })

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/signin'
        return
      }

      if (response.ok) {
        toast({
          title: "Priority Updated",
          description: `Inquiry priority set to ${priority}`,
        })
        fetchInquiries() // Refresh the list
      } else {
        const errorText = await response.text()
        console.error("Update priority error:", errorText)
        toast({
          title: "Update Failed",
          description: "Failed to update inquiry priority",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Update inquiry priority error:", error)
      toast({
        title: "Error",
        description: "Failed to update inquiry priority",
        variant: "destructive",
      })
    }
  }

  const handleViewInquiry = async (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry)
    setIsViewModalOpen(true)
    
    // Mark as read if it's new
    if (inquiry.status === "new") {
      await updateInquiryStatus(inquiry.id, "read")
    }
  }

  const handleReplyToInquiry = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry)
    setReplyData({
      subject: `Re: ${inquiry.subject || "Your inquiry"}`,
      message: "",
      isHtml: true
    })
    setAttachments([])
    setIsHtmlMode(true)
    setIsReplyModalOpen(true)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }))
      setAttachments(prev => [...prev, ...newAttachments])
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const getEditorContent = () => {
    if (isHtmlMode && editorRef.current) {
      return editorRef.current.innerHTML
    }
    return replyData.message
  }

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML
    setReplyData({ ...replyData, message: content })
  }

  const handleHtmlModeToggle = () => {
    if (isHtmlMode && editorRef.current) {
      // Convert HTML to plain text when switching from HTML to plain
      const plainText = editorRef.current.innerText || editorRef.current.textContent || ''
      setReplyData({ ...replyData, message: plainText })
    }
    setIsHtmlMode(!isHtmlMode)
  }

  const sendReply = async () => {
    if (!selectedInquiry || !replyData.subject.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const messageContent = getEditorContent()
    if (!messageContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setIsSendingReply(true)

    try {
      const formData = new FormData()
      formData.append('action', 'send-single')
      formData.append('to', selectedInquiry.email || '')
      formData.append('subject', replyData.subject)
      formData.append('customMessage', messageContent)
      formData.append('hasCustomData', 'true')
      formData.append('hasAttachments', attachments.length > 0 ? 'true' : 'false')

      // Add attachments
      attachments.forEach(attachment => {
        formData.append('attachments', attachment.file)
      })

      const response = await fetch("/api/admin/email", {
        method: "POST",
        body: formData,
      })

      if (response.status === 401 || response.status === 403) {
        window.location.href = '/signin'
        return
      }

      if (response.ok) {
        // Update inquiry status to replied
        await updateInquiryStatus(selectedInquiry.id, "replied")
        
        toast({
          title: "Reply Sent",
          description: "Email reply sent successfully",
        })
        
        setIsReplyModalOpen(false)
        setReplyData({ subject: "", message: "", isHtml: true })
        setAttachments([])
        setSelectedInquiry(null)
      } else {
        let errorMessage = "Failed to send reply"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (jsonError) {
          // If response is not JSON, use the status text
          const errorText = await response.text()
          console.error("Non-JSON error response:", errorText)
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reply",
        variant: "destructive",
      })
    } finally {
      setIsSendingReply(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "read":
        return "bg-gray-100 text-gray-800"
      case "replied":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Normal":
        return "bg-blue-100 text-blue-800"
      case "Low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return <div>Loading contact inquiries...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.read}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <Archive className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.archived}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Inquiries ({filteredInquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Tour Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No inquiries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {inquiry.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{inquiry.name}</div>
                          <div className="text-sm text-muted-foreground">{inquiry.email}</div>
                          {inquiry.phone && (
                            <div className="text-sm text-muted-foreground">{inquiry.phone}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={inquiry.subject || ""}>
                        {inquiry.subject || "No subject"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={inquiry.tourInterest || ""}>
                        {inquiry.tourInterest || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(inquiry.priority)}>
                        {inquiry.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(inquiry.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInquiry(inquiry)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReplyToInquiry(inquiry)}
                          title="Reply to inquiry"
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateInquiryStatus(inquiry.id, "archived")}
                          disabled={inquiry.status === "archived"}
                          title="Archive inquiry"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inquiry View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Inquiry Details</span>
            </DialogTitle>
            <DialogDescription>
              View and manage this contact inquiry
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedInquiry.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedInquiry.email}</span>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedInquiry.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Submitted: {formatDate(selectedInquiry.createdAt)}</span>
                  </div>
                  {selectedInquiry.repliedAt && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Replied: {formatDate(selectedInquiry.repliedAt)}</span>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(selectedInquiry.status)}>
                      {selectedInquiry.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedInquiry.priority)}>
                      {selectedInquiry.priority}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Subject and Tour Interest */}
              <div className="space-y-4">
                {selectedInquiry.subject && (
                  <div>
                    <h3 className="font-medium mb-2">Subject</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded-md">{selectedInquiry.subject}</p>
                  </div>
                )}
                
                {selectedInquiry.tourInterest && (
                  <div>
                    <h3 className="font-medium mb-2">Tour Interest</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded-md">{selectedInquiry.tourInterest}</p>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <h3 className="font-medium mb-2">Message</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleReplyToInquiry(selectedInquiry)
                  }}
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateInquiryStatus(selectedInquiry.id, "archived")}
                  disabled={selectedInquiry.status === "archived"}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Gmail-Style Reply Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="border-b pb-4 flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2">
              <Reply className="h-5 w-5" />
              <span>Reply to Inquiry</span>
            </DialogTitle>
            <DialogDescription>
              Send a professional reply to {selectedInquiry?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Email Header */}
              <div className="border-b p-4 space-y-3 flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">To:</label>
                                         <div className="flex items-center space-x-2 mt-1 p-2 bg-gray-50 rounded-md">
                       <User className="h-4 w-4 text-muted-foreground" />
                       <span className="text-sm">{selectedInquiry.name} ({selectedInquiry.email || 'No email'})</span>
                     </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Subject:</label>
                  <Input
                    value={replyData.subject}
                    onChange={(e) => setReplyData({ ...replyData, subject: e.target.value })}
                    className="mt-1"
                    placeholder="Enter subject..."
                  />
                </div>
              </div>

              {/* Editor Toolbar */}
              <div className="border-b bg-gray-50 p-2 flex-shrink-0">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleHtmlModeToggle}
                    className="text-xs"
                  >
                    <Type className="h-3 w-3 mr-1" />
                    {isHtmlMode ? "HTML" : "Plain"}
                  </Button>
                  
                  {isHtmlMode && (
                    <>
                      <div className="w-px h-4 bg-gray-300 mx-2" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => executeCommand('bold')}
                        className="text-xs"
                      >
                        <Bold className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => executeCommand('italic')}
                        className="text-xs"
                      >
                        <Italic className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => executeCommand('underline')}
                        className="text-xs"
                      >
                        <Underline className="h-3 w-3" />
                      </Button>
                      <div className="w-px h-4 bg-gray-300 mx-2" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => executeCommand('insertUnorderedList')}
                        className="text-xs"
                      >
                        <List className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => executeCommand('justifyLeft')}
                        className="text-xs"
                      >
                        <AlignLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => executeCommand('justifyCenter')}
                        className="text-xs"
                      >
                        <AlignCenter className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => executeCommand('justifyRight')}
                        className="text-xs"
                      >
                        <AlignRight className="h-3 w-3" />
                      </Button>
                      <div className="w-px h-4 bg-gray-300 mx-2" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = prompt('Enter URL:')
                          if (url) executeCommand('createLink', url)
                        }}
                        className="text-xs"
                      >
                        <Link className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto">
              {/* Message Editor */}
                <div className="p-4">
                {isHtmlMode ? (
                  <div
                    ref={editorRef}
                    contentEditable
                      className="min-h-[400px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ 
                      fontFamily: 'Arial, sans-serif',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}
                    onInput={handleEditorInput}
                    suppressContentEditableWarning={true}
                    data-placeholder="Type your reply message..."
                  />
                ) : (
                  <Textarea
                    value={replyData.message}
                    onChange={(e) => setReplyData({ ...replyData, message: e.target.value })}
                    placeholder="Type your reply message..."
                      className="min-h-[400px] resize-none"
                  />
                )}
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                  <div className="px-4 pb-4">
                  <h4 className="text-sm font-medium mb-2">Attachments ({attachments.length})</h4>
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{attachment.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>

              {/* Footer Actions - Fixed at bottom */}
              <div className="border-t p-4 bg-gray-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach Files
                  </Button>
                  {attachments.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {attachments.length} file(s) attached
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsReplyModalOpen(false)}
                    disabled={isSendingReply}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendReply}
                    disabled={isSendingReply || !replyData.subject.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSendingReply ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 
