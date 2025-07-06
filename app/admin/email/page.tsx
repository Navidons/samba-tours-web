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
  MoreHorizontal
} from 'lucide-react'

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

interface Campaign {
  id: number
  name: string
  description?: string
  status: string
  subject: string
  totalRecipients: number
  sentCount: number
  openCount: number
  clickCount: number
  createdAt: string
  template: { name: string }
  creator?: { profile?: { fullName: string } }
  _count: { sentEmails: number }
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

export default function AdminEmailPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [recentEmails, setRecentEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    template: '',
    customMessage: '',
    attachments: [] as File[]
  })
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    templateId: '',
    subject: '',
    customData: {},
    scheduledAt: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, analyticsRes, campaignsRes, templatesRes, emailsRes] = await Promise.all([
        fetch('/api/admin/email'),
        fetch('/api/admin/email?action=analytics'),
        fetch('/api/admin/email?action=campaigns'),
        fetch('/api/admin/email?action=templates'),
        fetch('/api/admin/email?action=recent-emails')
      ])

      const [dashboard, analyticsData, campaignsData, templatesData, emailsData] = await Promise.all([
        dashboardRes.json(),
        analyticsRes.json(),
        campaignsRes.json(),
        templatesRes.json(),
        emailsRes.json()
      ])

      setEmailStats(dashboard.dashboard || null)
      setAnalytics(analyticsData.analytics || null)
      setCampaigns(campaignsData.campaigns || [])
      setTemplates(templatesData.templates || [])
      setRecentEmails(emailsData.emails || [])
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

  const sendEmail = async () => {
    try {
      const formData = new FormData()
      formData.append('action', 'send-single')
      formData.append('to', composeForm.to)
      formData.append('subject', composeForm.subject)
      formData.append('template', composeForm.template)
      formData.append('customData', JSON.stringify({ customMessage: composeForm.customMessage }))
      
      composeForm.attachments.forEach(file => {
        formData.append('attachments', file)
      })

      const response = await fetch('/api/admin/email', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Email sent successfully"
        })
        setComposeForm({
          to: '',
          subject: '',
          template: '',
          customMessage: '',
          attachments: []
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      })
    }
  }

  const createCampaign = async () => {
    try {
      const response = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-campaign',
          ...campaignForm
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Campaign created successfully"
        })
        setCampaignForm({
          name: '',
          description: '',
          templateId: '',
          subject: '',
          customData: {},
          scheduledAt: ''
        })
        loadDashboardData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive"
      })
    }
  }

  const sendCampaign = async (campaignId: number) => {
    try {
      const response = await fetch('/api/admin/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-campaign',
          campaignId
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Campaign sent successfully"
        })
        loadDashboardData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send campaign",
        variant: "destructive"
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setComposeForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files!)]
      }))
    }
  }

  const removeAttachment = (index: number) => {
    setComposeForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'sending': return 'bg-yellow-100 text-yellow-800'
      case 'paused': return 'bg-orange-100 text-orange-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
            <p className="text-gray-600 mt-2">Enterprise-grade email marketing and automation</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={loadDashboardData}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Compose</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <MoreHorizontal className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Emails</p>
                      <p className="text-2xl font-bold text-gray-900">{emailStats?.totalEmails || 0}</p>
                    </div>
                    <Mail className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Campaigns</p>
                      <p className="text-2xl font-bold text-gray-900">{emailStats?.totalCampaigns || 0}</p>
                    </div>
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Open Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics?.openRate || '0'}%</p>
                    </div>
                    <Eye className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Click Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics?.clickRate || '0'}%</p>
                    </div>
                    <MousePointer className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Recent Emails</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(recentEmails || []).slice(0, 5).map((email) => (
                      <div key={email.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{email.recipientEmail}</p>
                          <p className="text-sm text-gray-600">{email.subject}</p>
                        </div>
                        <Badge className={getStatusColor(email.status)}>
                          {email.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Email Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.emailTrends || []).slice(0, 7).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{trend.date}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(trend.count / Math.max(...(analytics?.emailTrends || []).map(t => t.count))) * 100} className="w-20" />
                          <span className="text-sm font-medium">{trend.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Campaign Management</CardTitle>
                <CardDescription>Create and manage email campaigns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Campaign Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Campaign Name"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Subject Line"
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                  <Select value={campaignForm.templateId} onValueChange={(value) => setCampaignForm(prev => ({ ...prev, templateId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="datetime-local"
                    value={campaignForm.scheduledAt}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  />
                </div>
                <Textarea
                  placeholder="Campaign Description"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button onClick={createCampaign} className="w-full">
                  Create Campaign
                </Button>
              </CardContent>
            </Card>

            {/* Campaigns List */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {campaign.totalRecipients} recipients
                          </span>
                          <span className="text-xs text-gray-500">
                            {campaign.openCount} opens
                          </span>
                          <span className="text-xs text-gray-500">
                            {campaign.clickCount} clicks
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        {campaign.status === 'draft' && (
                          <Button size="sm" onClick={() => sendCampaign(campaign.id)}>
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compose Tab */}
          <TabsContent value="compose" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Compose Email</CardTitle>
                <CardDescription>Send individual or bulk emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Recipient Email"
                    value={composeForm.to}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
                  />
                  <Select value={composeForm.template} onValueChange={(value) => setComposeForm(prev => ({ ...prev, template: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.slug}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Subject"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                />
                <Textarea
                  placeholder="Custom Message (optional)"
                  value={composeForm.customMessage}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, customMessage: e.target.value }))}
                  rows={6}
                />
                
                {/* File Attachments */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <Mail className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click to upload attachments or drag and drop
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {composeForm.attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Attachments:</p>
                      {composeForm.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAttachment(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={sendEmail} className="w-full">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Manage your email templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        {template.isSystem && (
                          <Badge variant="secondary">System</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                      <p className="text-xs text-gray-500">
                        Used {template._count?.sentEmails || 0} times
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
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
                  
                  <div className="flex items-center justify-between">
                    <span>Delivery Rate</span>
                    <span className="font-bold">{analytics?.deliveryRate || '0'}%</span>
                  </div>
                  <Progress value={parseFloat(analytics?.deliveryRate || '0')} />
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Top Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.topTemplates || []).map((template, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">Template {template.templateId}</span>
                        <span className="font-bold">{template._count?.templateId || 0}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Manage email settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">SMTP Host</label>
                    <Input value="smtp.gmail.com" disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium">SMTP Port</label>
                    <Input value="587" disabled />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Test Email Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 