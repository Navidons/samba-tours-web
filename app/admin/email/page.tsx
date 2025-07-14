"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { 
  Mail, 
  BarChart3, 
  Users, 
  Send, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  User,
  BookOpen,
  ShoppingCart,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  RefreshCw,
  Target,
  Zap,
  Clock3,
  MailCheck,
  MailX,
  MailOpen,
  MailPlus,
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
  Trash2,
  Type,
  Palette
} from 'lucide-react'
import { useRef } from 'react'

interface EmailStats {
  totalEmails: number
  totalCampaigns: number
  templateCount: number
  statusStats: Record<string, number>
  recentEmails: any[]
}

interface EmailAnalytics {
  period: string
  totalSent: number
  emailsLast30Days: number
  openRate: string
  clickRate: string
  bounceRate: string
  deliveryRate: string
  topTemplates: any[]
  emailTrends: any[]
}

interface User {
  id: number
  email: string
  profile?: {
    fullName: string
    firstName: string
    lastName: string
  }
  createdAt: string
  lastSignInAt?: string
}

interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  country?: string
  city?: string
  totalBookings: number
  totalSpent: number
  status: string
  customerType: string
  loyaltyPoints: number
  joinDate: string
  updatedAt: string
}

interface Booking {
  id: number
  bookingReference: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  startDate: string
  endDate: string
  guestCount: number
  totalAmount: number
  finalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
  tour: {
    id: number
    title: string
    slug: string
  }
}

interface NewsletterSubscriber {
  id: number
  email: string
  name?: string
  interests?: any
  isActive: boolean
  source?: string
  subscribedAt: string
  unsubscribedAt?: string
}

interface ContactInquiry {
  id: number
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  tourInterest?: string
  priority: string
  status: string
  assignedTo?: number
  repliedAt?: string
  createdAt: string
  updatedAt: string
  assignedUser?: {
    id: number
    email: string
    profile?: {
      fullName: string
    }
  }
}

interface BlogComment {
  id: number
  authorName: string
  authorEmail?: string
  content: string
  status: string
  likes: number
  createdAt: string
  updatedAt: string
  post: {
    id: number
    title: string
    slug: string
  }
  user?: {
    id: number
    email: string
    profile?: {
      fullName: string
    }
  }
}

interface EmailTemplate {
  id: number
  name: string
  slug: string
  description?: string
  subject: string
  isSystem: boolean
  _count: { sentEmails: number }
}

interface ComposeEmailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipients: Array<{ email: string; name?: string }>
  defaultSubject?: string
  defaultTemplate?: string
}

function ComposeEmailModal({ open, onOpenChange, recipients, defaultSubject = '', defaultTemplate = '' }: ComposeEmailModalProps) {
  const [formData, setFormData] = useState({
    to: '',
    subject: defaultSubject,
    template: defaultTemplate,
    message: '',
    htmlMessage: '',
    attachments: [] as File[]
  })
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // Auto-fill email when modal opens
  useEffect(() => {
    if (open && recipients.length > 0) {
      setFormData(prev => ({
        ...prev,
        to: recipients.map(r => r.email).join(', ')
      }))
    }
  }, [open, recipients])

  // Initialize HTML editor content when switching to HTML mode
  useEffect(() => {
    if (isHtmlMode && editorRef.current) {
      // Only set content if the editor is empty or if we have new content
      if (!editorRef.current.innerHTML || formData.htmlMessage !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = formData.htmlMessage || ''
      }
    }
  }, [isHtmlMode, formData.htmlMessage])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email?action=templates')
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const handleSend = async () => {
    if (!formData.to || !formData.subject) {
      toast({
        title: "Error",
        description: "Recipient and subject are required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('action', 'send-single')
      formDataToSend.append('to', formData.to)
      formDataToSend.append('subject', formData.subject)
      formDataToSend.append('template', formData.template)
      
      // Add message content based on mode
      const messageContent = isHtmlMode ? formData.htmlMessage : formData.message
      formDataToSend.append('customData', JSON.stringify({ 
        message: messageContent,
        isHtml: isHtmlMode 
      }))
      
      // Add attachments
      formData.attachments.forEach(file => {
        formDataToSend.append('attachments', file)
      })

      const response = await fetch('/api/admin/email', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()
      if (result.success) {
        toast({
          title: "Success",
          description: "Email sent successfully"
        })
        onOpenChange(false)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Compose Email</span>
          </DialogTitle>
          <DialogDescription>
            Send email to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">To:</label>
            <Input
              value={formData.to}
              onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
              placeholder="Recipient emails (comma separated)"
              disabled={recipients.length > 0}
              className={recipients.length > 0 ? "bg-gray-50" : ""}
            />
            {recipients.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Email address{recipients.length > 1 ? 'es' : ''} pre-filled from selected recipient{recipients.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Subject:</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Template (optional):</label>
            <Select value={formData.template || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value === "none" ? "" : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No template</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.slug}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Message:</label>
              <div className="flex items-center space-x-2">
                                <Button
                  type="button"
                  variant={isHtmlMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isHtmlMode) {
                      // Switching from HTML to plain text - get current HTML content
                      const currentHtmlContent = editorRef.current?.innerHTML || formData.htmlMessage || ''
                      setFormData(prev => ({
                        ...prev,
                        message: editorRef.current?.innerText || '',
                        htmlMessage: currentHtmlContent
                      }))
      } else {
                      // Switching from plain text to HTML - convert plain text to HTML
                      const plainTextContent = formData.message || ''
                      const htmlContent = plainTextContent.replace(/\n/g, '<br>')
                      setFormData(prev => ({
                        ...prev,
                        htmlMessage: htmlContent
                      }))
                      // Update the editor content
                      if (editorRef.current) {
                        editorRef.current.innerHTML = htmlContent
                      }
                    }
                    setIsHtmlMode(!isHtmlMode)
                  }}
                >
                  {isHtmlMode ? "Plain Text" : "HTML"}
                </Button>
                {isHtmlMode && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </Button>
                )}
              </div>
            </div>
            
            {isHtmlMode ? (
              <div className="border rounded-lg">
                {/* HTML Editor Toolbar */}
                <div className="flex items-center space-x-1 p-2 border-b bg-gray-50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.execCommand('bold', false)}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.execCommand('italic', false)}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.execCommand('underline', false)}
                    title="Underline"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  
                  {/* Font Size */}
                  <select 
                    className="text-xs border rounded px-2 py-1"
                    onChange={(e) => document.execCommand('fontSize', false, e.target.value)}
                    title="Font Size"
                  >
                    <option value="">Size</option>
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Extra Large</option>
                  </select>
                  
                  {/* Font Color */}
                  <input
                    type="color"
                    className="w-8 h-8 border rounded-full cursor-pointer"
                    onChange={(e) => document.execCommand('foreColor', false, e.target.value)}
                    title="Font Color"
                  />
                  
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.execCommand('insertUnorderedList', false)}
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.execCommand('insertOrderedList', false)}
                    title="Numbered List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.execCommand('justifyLeft', false)}
                    title="Align Left"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.execCommand('justifyCenter', false)}
                    title="Align Center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => document.execCommand('justifyRight', false)}
                    title="Align Right"
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = prompt('Enter URL:')
                      if (url) document.execCommand('createLink', false, url)
                    }}
                    title="Insert Link"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* HTML Editor Content */}
                <div
                  ref={editorRef}
                  contentEditable
                  className="p-3 min-h-[200px] focus:outline-none"
                  onInput={(e) => {
                    const htmlContent = e.currentTarget?.innerHTML || ''
                    setFormData(prev => ({ 
                      ...prev, 
                      htmlMessage: htmlContent
                    }))
                  }}
                  suppressContentEditableWarning={true}
                  style={{ 
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                />
              </div>
            ) : (
              <Textarea
                value={formData.message}
                onChange={(e) => {
                  const plainText = e.target.value
                  setFormData(prev => ({ 
                    ...prev, 
                    message: plainText,
                    // Also update HTML content to keep in sync
                    htmlMessage: plainText.replace(/\n/g, '<br>')
                  }))
                }}
                placeholder="Your message..."
                rows={8}
              />
            )}
            
            {/* HTML Preview */}
            {isHtmlMode && showPreview && (
              <div className="mt-4 border rounded-lg">
                <div className="p-2 border-b bg-gray-50">
                  <h4 className="text-sm font-medium">Email Preview</h4>
                </div>
                <div 
                  className="p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: formData.htmlMessage }}
                  style={{ 
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                />
              </div>
            )}
          </div>

          {/* File Attachments */}
          <div>
            <label className="text-sm font-medium">Attachments:</label>
            <div className="mt-2 space-y-3">
              {/* File Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <Paperclip className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {isDragOver ? 'Drop files here' : 'Click to upload attachments or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 10MB each)
                    </p>
                  </div>
                </label>
              </div>
              
              {/* Attachments List */}
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected Files:</p>
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={loading}>
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminEmailPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState<Array<{ email: string; name?: string }>>([])
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [composeData, setComposeData] = useState<{
    recipients: Array<{ email: string; name?: string }>
    subject: string
    template: string
  }>({ recipients: [], subject: '', template: '' })

  // Data states for different user groups
  const [users, setUsers] = useState<User[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([])
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([])
  const [blogComments, setBlogComments] = useState<BlogComment[]>([])

  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, analyticsRes, templatesRes, usersRes, customersRes, bookingsRes, newsletterRes, contactsRes, commentsRes] = await Promise.all([
        fetch('/api/admin/email'),
        fetch('/api/admin/email?action=analytics'),
        fetch('/api/admin/email?action=templates'),
        fetch('/api/admin/users'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/bookings'),
        fetch('/api/admin/newsletter/subscribers'),
        fetch('/api/admin/contact?limit=100'),
        fetch('/api/blog/comments')
      ])

      const [dashboard, analyticsData, templatesData, usersData, customersData, bookingsData, newsletterData, contactsData, commentsData] = await Promise.all([
        dashboardRes.json(),
        analyticsRes.json(),
        templatesRes.json(),
        usersRes.json(),
        customersRes.json(),
        bookingsRes.json(),
        newsletterRes.json(),
        contactsRes.json(),
        commentsRes.json()
      ])

      setEmailStats(dashboard.dashboard || null)
      setAnalytics(analyticsData.analytics || null)
      setTemplates(templatesData.templates || [])
      setUsers(usersData.users || [])
      setCustomers(customersData.customers || [])
      setBookings(bookingsData.bookings || [])
      setNewsletterSubscribers(newsletterData.subscribers || [])
      setContactInquiries(contactsData.inquiries || [])
      setBlogComments(commentsData.comments || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = (recipients: Array<{ email: string; name?: string }>, subject: string = '', template: string = '') => {
    setComposeData({ recipients, subject, template })
    setShowComposeModal(true)
  }

  const handleBulkEmail = () => {
    if (selectedRecipients.length === 0) {
        toast({
        title: "No Recipients Selected",
        description: "Please select recipients to send bulk email",
        variant: "destructive"
      })
      return
    }
    handleSendEmail(selectedRecipients)
  }

  const handleSelectAll = (checked: boolean, data: Array<{ email: string; name?: string }>) => {
    if (checked) {
      setSelectedRecipients(data)
    } else {
      setSelectedRecipients([])
    }
  }

  const handleSelectRecipient = (recipient: { email: string; name?: string }, checked: boolean) => {
    if (checked) {
      setSelectedRecipients(prev => [...prev, recipient])
    } else {
      setSelectedRecipients(prev => prev.filter(r => r.email !== recipient.email))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'new': return 'bg-gray-100 text-gray-800'
      case 'read': return 'bg-blue-100 text-blue-800'
      case 'replied': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">
            Professional email marketing and communication system
          </p>
          </div>
        <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          {selectedRecipients.length > 0 && (
            <Button onClick={handleBulkEmail}>
              <Send className="w-4 h-4 mr-2" />
              Send to {selectedRecipients.length} Recipients
            </Button>
          )}
          </div>
        </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats?.totalEmails || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.emailsLast30Days || 0} this month
            </p>
                </CardContent>
              </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.openRate || '0'}%</div>
            <p className="text-xs text-muted-foreground">
              Industry average: 21.5%
            </p>
                </CardContent>
              </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.clickRate || '0'}%</div>
            <p className="text-xs text-muted-foreground">
              Industry average: 2.3%
            </p>
                </CardContent>
              </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {templates.filter(t => t.isSystem).length} system templates
            </p>
                </CardContent>
              </Card>
            </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Email Performance</span>
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Open Rate</span>
                  <span className="font-bold">{analytics?.openRate || '0'}%</span>
                        </div>
                <Progress value={parseFloat(analytics?.openRate || '0')} />
                
                <div className="flex items-center justify-between">
                  <span>Click Rate</span>
                  <span className="font-bold">{analytics?.clickRate || '0'}%</span>
                      </div>
                <Progress value={parseFloat(analytics?.clickRate || '0')} />
                
                <div className="flex items-center justify-between">
                  <span>Bounce Rate</span>
                  <span className="font-bold">{analytics?.bounceRate || '0'}%</span>
                  </div>
                <Progress value={parseFloat(analytics?.bounceRate || '0')} />
                </CardContent>
              </Card>

            <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                    <div className="text-sm text-blue-600">Registered Users</div>
                        </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{customers.length}</div>
                    <div className="text-sm text-green-600">Customers</div>
                      </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{newsletterSubscribers.filter(s => s.isActive).length}</div>
                    <div className="text-sm text-purple-600">Active Subscribers</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{bookings.length}</div>
                    <div className="text-sm text-orange-600">Total Bookings</div>
                  </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
              <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Registered Users</span>
              </CardTitle>
              <CardDescription>
                Send emails to registered users of the system
              </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true, users.map(u => ({ email: u.email, name: u.profile?.fullName })))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecipients([])}
                >
                  Clear Selection
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecipients.length === users.length && users.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean, users.map(u => ({ email: u.email, name: u.profile?.fullName })))}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter(user => 
                      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.profile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecipients.some(r => r.email === user.email)}
                          onCheckedChange={(checked) => handleSelectRecipient({ email: user.email, name: user.profile?.fullName }, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.profile?.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                          <span className="font-medium">{user.profile?.fullName || 'No Name'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendEmail([{ email: user.email, name: user.profile?.fullName }])}
                          title="Send email to this user"
                        >
                          <Mail className="h-4 w-4" />
                </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </CardContent>
            </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
              <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Customers</span>
              </CardTitle>
              <CardDescription>
                Send emails to customers with booking history
              </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true, customers.map(c => ({ email: c.email, name: c.name })))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecipients([])}
                >
                  Clear Selection
                </Button>
                        </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecipients.length === customers.length && customers.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean, customers.map(c => ({ email: c.email, name: c.name })))}
                      />
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers
                    .filter(customer => 
                      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecipients.some(r => r.email === customer.email)}
                          onCheckedChange={(checked) => handleSelectRecipient({ email: customer.email, name: customer.name }, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.totalBookings}</TableCell>
                      <TableCell>${Number(customer.totalSpent).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendEmail([{ email: customer.email, name: customer.name }])}
                          title="Send email to this customer"
                        >
                          <Mail className="h-4 w-4" />
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </CardContent>
            </Card>
          </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <Card>
              <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Bookings</span>
              </CardTitle>
              <CardDescription>
                Send emails to customers with active bookings
              </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true, bookings.map(b => ({ email: b.customerEmail, name: b.customerName })))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecipients([])}
                >
                  Clear Selection
                </Button>
                </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecipients.length === bookings.length && bookings.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean, bookings.map(b => ({ email: b.customerEmail, name: b.customerName })))}
                      />
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Tour</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings
                    .filter(booking => 
                      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      booking.tour.title.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecipients.some(r => r.email === booking.customerEmail)}
                          onCheckedChange={(checked) => handleSelectRecipient({ email: booking.customerEmail, name: booking.customerName }, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                      </div>
                      </TableCell>
                      <TableCell>{booking.tour.title}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(booking.startDate).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">to {new Date(booking.endDate).toLocaleDateString()}</div>
                  </div>
                      </TableCell>
                      <TableCell>${Number(booking.totalAmount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                          onClick={() => handleSendEmail([{ email: booking.customerEmail, name: booking.customerName }], `Booking Update - ${booking.tour.title}`)}
                          title="Send email about this booking"
                          >
                          <Mail className="h-4 w-4" />
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </CardContent>
            </Card>
          </TabsContent>

        {/* Newsletter Tab */}
        <TabsContent value="newsletter" className="space-y-6">
          <Card>
              <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Newsletter Subscribers</span>
              </CardTitle>
              <CardDescription>
                Send newsletters to subscribers
              </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true, newsletterSubscribers.filter(s => s.isActive).map(s => ({ email: s.email, name: s.name })))}
                >
                  Select Active
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecipients([])}
                >
                  Clear Selection
                </Button>
                      </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecipients.length === newsletterSubscribers.filter(s => s.isActive).length && newsletterSubscribers.filter(s => s.isActive).length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean, newsletterSubscribers.filter(s => s.isActive).map(s => ({ email: s.email, name: s.name })))}
                      />
                    </TableHead>
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsletterSubscribers
                    .filter(subscriber => 
                      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecipients.some(r => r.email === subscriber.email)}
                          onCheckedChange={(checked) => handleSelectRecipient({ email: subscriber.email, name: subscriber.name }, checked as boolean)}
                          disabled={!subscriber.isActive}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{subscriber.name || 'Anonymous'}</TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>{new Date(subscriber.subscribedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={subscriber.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {subscriber.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendEmail([{ email: subscriber.email, name: subscriber.name }], 'Newsletter Update')}
                          title="Send newsletter to this subscriber"
                          disabled={!subscriber.isActive}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </CardContent>
            </Card>
          </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <Card>
                <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Contact Inquiries</span>
              </CardTitle>
              <CardDescription>
                Send follow-up emails to contact form submissions
              </CardDescription>
                </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true, contactInquiries.map(c => ({ email: c.email, name: c.name })))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecipients([])}
                >
                  Clear Selection
                </Button>
                  </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecipients.length === contactInquiries.length && contactInquiries.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean, contactInquiries.map(c => ({ email: c.email, name: c.name })))}
                      />
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactInquiries
                    .filter(inquiry => 
                      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      inquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecipients.some(r => r.email === inquiry.email)}
                          onCheckedChange={(checked) => handleSelectRecipient({ email: inquiry.email, name: inquiry.name }, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inquiry.name}</div>
                          <div className="text-sm text-muted-foreground">{inquiry.email}</div>
                  </div>
                      </TableCell>
                      <TableCell>{inquiry.subject || 'No subject'}</TableCell>
                      <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(inquiry.status)}>
                          {inquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendEmail([{ email: inquiry.email, name: inquiry.name }], `Re: ${inquiry.subject || 'Your Inquiry'}`)}
                          title="Send follow-up email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </CardContent>
              </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-6">
          <Card>
                <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Blog Commenters</span>
              </CardTitle>
              <CardDescription>
                Send emails to blog commenters
              </CardDescription>
                </CardHeader>
                <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(true, blogComments.filter(c => c.authorEmail).map(c => ({ email: c.authorEmail!, name: c.authorName })))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecipients([])}
                >
                  Clear Selection
                </Button>
                      </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecipients.length === blogComments.filter(c => c.authorEmail).length && blogComments.filter(c => c.authorEmail).length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean, blogComments.filter(c => c.authorEmail).map(c => ({ email: c.authorEmail!, name: c.authorName })))}
                      />
                    </TableHead>
                    <TableHead>Commenter</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogComments
                    .filter(comment => 
                      comment.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      comment.authorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      comment.post.title.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecipients.some(r => r.email === comment.authorEmail)}
                          onCheckedChange={(checked) => handleSelectRecipient({ email: comment.authorEmail!, name: comment.authorName }, checked as boolean)}
                          disabled={!comment.authorEmail}
                        />
                      </TableCell>
                      <TableCell>
                  <div>
                          <div className="font-medium">{comment.authorName}</div>
                          <div className="text-sm text-muted-foreground">{comment.authorEmail || 'No email'}</div>
                  </div>
                      </TableCell>
                      <TableCell>{comment.post?.title || "Unknown Post"}</TableCell>
                      <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
                      <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSendEmail([{ email: comment.authorEmail!, name: comment.authorName }], `Re: Your comment on "${comment.post?.title || 'Unknown Post'}"`)}
                          title="Send email to commenter"
                          disabled={!comment.authorEmail}
                        >
                          <Mail className="h-4 w-4" />
                </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Compose Email Modal */}
      <ComposeEmailModal
        open={showComposeModal}
        onOpenChange={setShowComposeModal}
        recipients={composeData.recipients}
        defaultSubject={composeData.subject}
        defaultTemplate={composeData.template}
      />
    </div>
  )
} 