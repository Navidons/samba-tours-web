import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Eye, Download, Users, MapPin, Star, MessageSquare, Mail, Phone } from "lucide-react"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "Analytics Dashboard - Samba Tours Admin",
  description: "View detailed analytics and reports.",
}

// Analytics Data Fetcher Component
async function AnalyticsData({ period }: { period: string }) {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case "7days":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "30days":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case "90days":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case "1year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  // Previous period for comparison
  const periodDays = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000)

  try {
    // Fetch all analytics data in parallel
    const [
      totalRevenue,
      previousRevenue,
      totalBookings,
      previousBookings,
      totalCustomers,
      previousCustomers,
      totalVisitors,
      previousVisitors,
      topTours,
      recentBookings,
      recentActivity,
      revenueByMonth,
      bookingsByMonth,
      customerStats,
      tourStats,
      contactStats,
      emailStats
    ] = await Promise.all([
      // Current period revenue
      prisma.booking.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['confirmed', 'completed'] }
        },
        _sum: { finalAmount: true }
      }),

      // Previous period revenue
      prisma.booking.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          status: { in: ['confirmed', 'completed'] }
        },
        _sum: { finalAmount: true }
      }),

      // Current period bookings
      prisma.booking.count({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['confirmed', 'completed'] }
        }
      }),

      // Previous period bookings
      prisma.booking.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          status: { in: ['confirmed', 'completed'] }
        }
      }),

      // Current period customers
      prisma.customer.count({
        where: {
          joinDate: { gte: startDate }
        }
      }),

      // Previous period customers
      prisma.customer.count({
        where: {
          joinDate: { gte: previousStartDate, lt: startDate }
        }
      }),

      // Current period visitors
      prisma.visitor.count({
        where: {
          firstVisitAt: { gte: startDate }
        }
      }),

      // Previous period visitors
      prisma.visitor.count({
        where: {
          firstVisitAt: { gte: previousStartDate, lt: startDate }
        }
      }),

      // Top performing tours
      prisma.booking.groupBy({
        by: ['tourId'],
        where: {
          createdAt: { gte: startDate },
          status: { in: ['confirmed', 'completed'] }
        },
        _count: { id: true },
        _sum: { finalAmount: true },
        orderBy: { _sum: { finalAmount: 'desc' } },
        take: 5
      }),

      // Recent bookings
      prisma.booking.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          tour: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Recent activity (mixed from different tables)
      prisma.$queryRaw`
        (SELECT 'booking' as type, customer_name as title, 'New booking' as action, created_at as date, booking_reference as reference
         FROM bookings 
         WHERE created_at >= ${startDate}
         ORDER BY created_at DESC LIMIT 3)
        UNION ALL
        (SELECT 'review' as type, reviewer_name as title, 'New review' as action, created_at as date, CONCAT(rating, ' stars') as reference
         FROM tour_reviews 
         WHERE created_at >= ${startDate}
         ORDER BY created_at DESC LIMIT 3)
        UNION ALL
        (SELECT 'contact' as type, name as title, 'New inquiry' as action, created_at as date, subject as reference
         FROM contact_inquiries 
         WHERE created_at >= ${startDate}
         ORDER BY created_at DESC LIMIT 3)
        ORDER BY date DESC LIMIT 10
      `,

      // Revenue by month (last 12 months)
      prisma.booking.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) },
          status: { in: ['confirmed', 'completed'] }
        },
        _sum: { finalAmount: true }
      }),

      // Bookings by month
      prisma.booking.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) },
          status: { in: ['confirmed', 'completed'] }
        },
        _count: { id: true }
      }),

      // Customer statistics
      prisma.customer.aggregate({
        _count: { id: true },
        _avg: { totalSpent: true },
        _sum: { totalSpent: true }
      }),

      // Tour statistics
      prisma.tour.aggregate({
        _count: { id: true },
        _avg: { rating: true, price: true }
      }),

      // Contact inquiry statistics
      prisma.contactInquiry.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      }),

      // Email statistics
      prisma.emailSent.aggregate({
        where: { sentAt: { gte: startDate } },
        _count: { id: true }
      })
    ])

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const revenueChange = calculateChange(
      Number(totalRevenue._sum.finalAmount || 0),
      Number(previousRevenue._sum.finalAmount || 0)
    )

    const bookingsChange = calculateChange(totalBookings, previousBookings)
    const customersChange = calculateChange(totalCustomers, previousCustomers)
    const visitorsChange = calculateChange(totalVisitors, previousVisitors)

    // Get tour details for top tours
    const topToursWithDetails = await Promise.all(
      topTours.map(async (tour) => {
        const tourDetails = await prisma.tour.findUnique({
          where: { id: tour.tourId },
          select: { title: true, price: true }
        })
        return {
          name: tourDetails?.title || 'Unknown Tour',
          bookings: tour._count.id,
          revenue: Number(tour._sum.finalAmount || 0)
        }
      })
    )

    // Process recent activity
    const processedActivity = (recentActivity as any[]).map((item: any) => ({
      action: item.action,
      details: `${item.title} - ${item.reference}`,
      time: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: item.type
    }))

    const stats = [
      {
        title: "Total Revenue",
        value: `$${Number(totalRevenue._sum.finalAmount || 0).toLocaleString()}`,
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
        changeType: revenueChange >= 0 ? "positive" as const : "negative" as const,
        icon: DollarSign,
      },
      {
        title: "Total Bookings",
        value: totalBookings.toLocaleString(),
        change: `${bookingsChange >= 0 ? '+' : ''}${bookingsChange.toFixed(1)}%`,
        changeType: bookingsChange >= 0 ? "positive" as const : "negative" as const,
        icon: Calendar,
      },
      {
        title: "New Customers",
        value: totalCustomers.toLocaleString(),
        change: `${customersChange >= 0 ? '+' : ''}${customersChange.toFixed(1)}%`,
        changeType: customersChange >= 0 ? "positive" as const : "negative" as const,
        icon: Users,
      },
      {
        title: "Website Visitors",
        value: totalVisitors.toLocaleString(),
        change: `${visitorsChange >= 0 ? '+' : ''}${visitorsChange.toFixed(1)}%`,
        changeType: visitorsChange >= 0 ? "positive" as const : "negative" as const,
        icon: Eye,
      },
    ]

    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-earth-600">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-earth-500" />
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
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Revenue Chart</p>
                  <p className="text-2xl font-bold text-earth-900">
                    ${Number(totalRevenue._sum.finalAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-earth-600">Total revenue this period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Bookings Chart</p>
                  <p className="text-2xl font-bold text-earth-900">{totalBookings}</p>
                  <p className="text-sm text-earth-600">Total bookings this period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Tours */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Tours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topToursWithDetails.map((tour, index) => (
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
                {processedActivity.map((activity, index) => (
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
              <div className="text-2xl font-bold text-earth-900">{tourStats._count.id}</div>
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
                {Number(tourStats._avg.rating || 0).toFixed(1)}
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
              <div className="text-2xl font-bold text-earth-900">{contactStats._count.id}</div>
              <p className="text-xs text-earth-600">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-earth-600">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-earth-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-earth-900">{emailStats._count.id}</div>
              <p className="text-xs text-earth-600">This period</p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading analytics data. Please try again.</p>
      </div>
    )
  }
}

// Loading component
function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function Analytics() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="section-padding">
        <div className="container-max">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-earth-900 mb-2">Analytics Dashboard</h1>
              <p className="text-earth-600">View detailed analytics and reports</p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="30days">
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
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Suspense fallback={<AnalyticsSkeleton />}>
            <AnalyticsData period="30days" />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
