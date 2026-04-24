"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Eye, Download, Users, MapPin, Star, MessageSquare, Mail, Phone } from "lucide-react"
import { saveAs } from 'file-saver'
import AnalyticsCharts from './AnalyticsCharts'

interface AnalyticsData {
  stats: Array<{
    title: string
    value: string
    change: string
    changeType: "positive" | "negative"
  }>
  topToursWithDetails: Array<{
    name: string
    bookings: number
    revenue: number
  }>
  recentBookings: any[]
  processedActivity: Array<{
    action: string
    details: string
    time: string
    type: string
  }>
  revenueByMonth: Array<{
    createdAt: Date
    _sum: { finalAmount: number }
  }>
  bookingsByMonth: Array<{
    createdAt: Date
    _count: { id: number }
  }>
  customerStats: {
    totalCustomers: number
    avgOrderValue: number
    totalRevenue: number
  }
  tourStats: {
    totalTours: number
    avgRating: number
    avgPrice: number
  }
  contactStats: {
    totalInquiries: number
  }
  emailStats: {
    totalEmails: number
  }
}

interface AnalyticsClientProps {
  period: string
  analyticsData: AnalyticsData
}

function analyticsToCSV(data: AnalyticsData) {
  let csv = 'Metric,Value\n';
  data.stats.forEach(stat => {
    csv += `${stat.title},${stat.value}\n`;
  });
  csv += '\nTop Tours\nName,Bookings,Revenue\n';
  data.topToursWithDetails.forEach((tour) => {
    csv += `${tour.name},${tour.bookings},${tour.revenue}\n`;
  });
  return csv;
}

export default function AnalyticsClient({ period, analyticsData }: AnalyticsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  const handleExport = () => {
    const csv = analyticsToCSV(analyticsData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'analytics.csv');
  };

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod)
    // In a real app, you would trigger a refetch here
    // For now, we'll just update the local state
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-earth-900 mb-2">Analytics Dashboard</h1>
          <p className="text-earth-600">View detailed analytics and reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analyticsData.stats.map((stat, index) => {
          const icons = [DollarSign, Calendar, Users, Eye]
          const Icon = icons[index] || DollarSign
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-earth-600">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-earth-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-earth-900">{stat.value}</div>
                <div className="flex items-center mt-1">
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <p className={`text-xs ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change} from last period
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <AnalyticsCharts
        totalRevenue={analyticsData.customerStats.totalRevenue}
        totalBookings={analyticsData.stats[1]?.value.replace(/,/g, '') || '0'}
        totalCustomers={analyticsData.customerStats.totalCustomers}

        topToursWithDetails={analyticsData.topToursWithDetails}
        revenueByMonth={analyticsData.revenueByMonth}
        bookingsByMonth={analyticsData.bookingsByMonth}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Tours */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topToursWithDetails.map((tour, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-earth-900">{tour.name}</h4>
                    <p className="text-sm text-earth-600">{tour.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-forest-600">${tour.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.processedActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-forest-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-earth-900">{activity.action}</p>
                    <p className="text-sm text-earth-600">{activity.details}</p>
                    <p className="text-xs text-earth-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-earth-600">Total Tours</CardTitle>
            <MapPin className="h-4 w-4 text-earth-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-earth-900">{analyticsData.tourStats.totalTours}</div>
            <p className="text-xs text-earth-600">Active tours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-earth-600">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-earth-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-earth-900">
              {analyticsData.tourStats.avgRating.toFixed(1)}
            </div>
            <p className="text-xs text-earth-600">Overall tour rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-earth-600">Contact Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-earth-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-earth-900">{analyticsData.contactStats.totalInquiries}</div>
            <p className="text-xs text-earth-600">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-earth-600">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-earth-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-earth-900">{analyticsData.emailStats.totalEmails}</div>
            <p className="text-xs text-earth-600">This period</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
} 
