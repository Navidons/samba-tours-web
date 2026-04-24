"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Mail, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Calendar,
  Users,
  Target
} from 'lucide-react'

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
  campaignStats: any[]
  recipientStats: any[]
}

interface CampaignStats {
  id: number
  name: string
  status: string
  totalRecipients: number
  sentCount: number
  openCount: number
  clickCount: number
  bounceCount: number
  createdAt: string
}

export default function EmailAnalytics({ analytics }: { analytics: EmailAnalytics }) {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all')

  const formatPercentage = (value: string) => {
    const num = parseFloat(value)
    return `${num.toFixed(1)}%`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-blue-100 text-blue-800'
      case 'opened': return 'bg-purple-100 text-purple-800'
      case 'clicked': return 'bg-orange-100 text-orange-800'
      case 'bounced': return 'bg-red-100 text-red-800'
      case 'failed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateEngagementRate = () => {
    const opens = parseFloat(analytics.openRate)
    const clicks = parseFloat(analytics.clickRate)
    return ((opens + clicks) / 2).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Analytics</h2>
          <p className="text-gray-600">Comprehensive email performance insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Sent</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(analytics.totalSent)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {formatNumber(analytics.emailsLast30Days)} this month
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Open Rate</p>
                <p className="text-2xl font-bold text-green-900">{formatPercentage(analytics.openRate)}</p>
                <p className="text-xs text-green-600 mt-1">Industry avg: 21.5%</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Click Rate</p>
                <p className="text-2xl font-bold text-purple-900">{formatPercentage(analytics.clickRate)}</p>
                <p className="text-xs text-purple-600 mt-1">Industry avg: 2.6%</p>
              </div>
              <MousePointer className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Engagement</p>
                <p className="text-2xl font-bold text-orange-900">{calculateEngagementRate()}%</p>
                <p className="text-xs text-orange-600 mt-1">Open + Click rate</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Delivery Rate</span>
                    <span className="text-sm font-bold">{formatPercentage(analytics.deliveryRate)}</span>
                  </div>
                  <Progress value={parseFloat(analytics.deliveryRate)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className="text-sm font-bold">{formatPercentage(analytics.bounceRate)}</span>
                  </div>
                  <Progress value={parseFloat(analytics.bounceRate)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Spam Complaints</span>
                    <span className="text-sm font-bold">0.1%</span>
                  </div>
                  <Progress value={0.1} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Email Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Email Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.emailTrends.slice(0, 7).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{trend.date}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(trend.count / Math.max(...analytics.emailTrends.map(t => t.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{trend.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Active Subscribers</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">2,847</p>
                <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Successful Deliveries</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">98.2%</p>
                <p className="text-sm text-gray-500 mt-1">Above industry average</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Avg. Open Time</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">2.4h</p>
                <p className="text-sm text-gray-500 mt-1">After sending</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Detailed performance metrics for each campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.campaignStats?.map((campaign: CampaignStats) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
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
                        <span className="text-xs text-gray-500">
                          {campaign.bounceCount} bounces
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {campaign.totalRecipients > 0 
                            ? ((campaign.openCount / campaign.totalRecipients) * 100).toFixed(1)
                            : '0'
                          }%
                        </p>
                        <p className="text-xs text-gray-500">Open rate</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Performance</CardTitle>
              <CardDescription>How your email templates are performing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.topTemplates?.map((template, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Template {template.templateId}</h3>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Used {template._count.templateId} times
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Open Rate</span>
                        <span className="font-medium">24.5%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Click Rate</span>
                        <span className="font-medium">3.2%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recipients Tab */}
        <TabsContent value="recipients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipient Analytics</CardTitle>
              <CardDescription>Insights about your email recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Engagement by Time</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Morning (6AM-12PM)</span>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Afternoon (12PM-6PM)</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Evening (6PM-12AM)</span>
                      <span className="text-sm font-medium">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Device Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Desktop</span>
                      <span className="text-sm font-medium">58%</span>
                    </div>
                    <Progress value={58} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mobile</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tablet</span>
                      <span className="text-sm font-medium">7%</span>
                    </div>
                    <Progress value={7} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
