import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  Eye, 
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Activity
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = {
  title: "Admin Dashboard - Samba Tours",
  description: "Welcome to the Samba Tours admin dashboard.",
}

// Dashboard Data Fetcher Component
async function DashboardData() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const data = await (async () => {
    try {
      // Fetch all dashboard data in parallel
      const [
        todayRevenue,
        yesterdayRevenue,
        todayBookings,
        yesterdayBookings,
        todayCustomers,
        yesterdayCustomers,
        pendingBookings,
        recentBookings,
        recentActivity,
        topTours,
        contactInquiries,
        systemStats
      ] = await Promise.all([
        // Today's revenue
        prisma.booking.aggregate({
          where: {
            createdAt: { gte: today },
            status: { in: ['confirmed', 'completed'] }
          },
          _sum: { finalAmount: true }
        }),

        // Yesterday's revenue
        prisma.booking.aggregate({
          where: {
            createdAt: { gte: yesterday, lt: today },
            status: { in: ['confirmed', 'completed'] }
          },
          _sum: { finalAmount: true }
        }),

        // Today's bookings
        prisma.booking.count({
          where: {
            createdAt: { gte: today },
            status: { in: ['confirmed', 'completed'] }
          }
        }),

        // Yesterday's bookings
        prisma.booking.count({
          where: {
            createdAt: { gte: yesterday, lt: today },
            status: { in: ['confirmed', 'completed'] }
          }
        }),

        // Today's new customers
        prisma.customer.count({
          where: {
            joinDate: { gte: today }
          }
        }),

        // Yesterday's new customers
        prisma.customer.count({
          where: {
            joinDate: { gte: yesterday, lt: today }
          }
        }),



        // Pending bookings
        prisma.booking.count({
          where: {
            status: 'pending'
          }
        }),

        // Recent bookings
        prisma.booking.findMany({
          where: {
            createdAt: { gte: lastWeek }
          },
          include: {
            tour: { select: { title: true, price: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),

        // Recent activity
        prisma.$queryRaw`
          (SELECT 'booking' as type, customer_name as title, 'New booking' as action, created_at as date, booking_reference as reference, final_amount as amount
           FROM bookings 
           WHERE created_at >= ${lastWeek}
           ORDER BY created_at DESC LIMIT 3)
          UNION ALL
          (SELECT 'review' as type, reviewer_name as title, 'New review' as action, created_at as date, CONCAT(rating, ' stars') as reference, NULL as amount
           FROM tour_reviews 
           WHERE created_at >= ${lastWeek}
           ORDER BY created_at DESC LIMIT 3)
          UNION ALL
          (SELECT 'contact' as type, name as title, 'New inquiry' as action, created_at as date, subject as reference, NULL as amount
           FROM contact_inquiries 
           WHERE created_at >= ${lastWeek}
           ORDER BY created_at DESC LIMIT 3)
          ORDER BY date DESC LIMIT 8
        `,

        // Top performing tours
        prisma.booking.groupBy({
          by: ['tourId'],
          where: {
            createdAt: { gte: lastMonth },
            status: { in: ['confirmed', 'completed'] }
          },
          _count: { id: true },
          _sum: { finalAmount: true },
          orderBy: { _sum: { finalAmount: 'desc' } },
          take: 5
        }),

        // Recent contact inquiries
        prisma.contactInquiry.findMany({
          where: {
            createdAt: { gte: lastWeek },
            status: 'new'
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),

        // System statistics
        Promise.all([
          prisma.tour.count(),
          prisma.customer.count(),
          prisma.booking.count(),
          prisma.tourReview.aggregate({
            _avg: { rating: true }
          })
        ])
      ])

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
      }

      const revenueChange = calculateChange(
        Number(todayRevenue._sum.finalAmount || 0),
        Number(yesterdayRevenue._sum.finalAmount || 0)
      )

      const bookingsChange = calculateChange(todayBookings, yesterdayBookings)
      const customersChange = calculateChange(todayCustomers, yesterdayCustomers)

      // Get tour details for top tours
      const topToursWithDetails = await Promise.all(
        topTours.map(async (tour) => {
          const tourDetails = await prisma.tour.findUnique({
            where: { id: tour.tourId },
            select: { title: true, price: true, rating: true }
          })
          return {
            name: tourDetails?.title || 'Unknown Tour',
            bookings: tour._count.id,
            revenue: Number(tour._sum.finalAmount || 0),
            rating: Number(tourDetails?.rating || 0)
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
        type: item.type,
        amount: item.amount ? Number(item.amount) : null
      }))

      const stats = [
        {
          title: "Today's Revenue",
          value: `$${Number(todayRevenue._sum.finalAmount || 0).toLocaleString()}`,
          change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
          changeType: revenueChange >= 0 ? "positive" as const : "negative" as const,
          icon: DollarSign,
          color: "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        },
        {
          title: "Today's Bookings",
          value: todayBookings.toString(),
          change: `${bookingsChange >= 0 ? '+' : ''}${bookingsChange.toFixed(1)}%`,
          changeType: bookingsChange >= 0 ? "positive" as const : "negative" as const,
          icon: Calendar,
          color: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        },
        {
          title: "New Customers",
          value: todayCustomers.toString(),
          change: `${customersChange >= 0 ? '+' : ''}${customersChange.toFixed(1)}%`,
          changeType: customersChange >= 0 ? "positive" as const : "negative" as const,
          icon: Users,
          color: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        },

      ]

      return {
        stats,
        pendingBookings,
        recentBookings,
        processedActivity,
        topToursWithDetails,
        contactInquiries,
        systemStats: {
          totalTours: systemStats[0],
          totalCustomers: systemStats[1],
          totalBookings: systemStats[2],
          averageRating: Number(systemStats[3]._avg.rating || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      return {
        stats: [],
        pendingBookings: 0,
        recentBookings: [],
        processedActivity: [],
        topToursWithDetails: [],
        contactInquiries: [],
        systemStats: {
          totalTours: 0,
          totalCustomers: 0,
          totalBookings: 0,
          averageRating: 0
        }
      }
    }
  })();
  return data
}

// Dashboard Content Component
function DashboardContent({ data }: { data: any }) {
  const { stats, pendingBookings, recentBookings, processedActivity, topToursWithDetails, contactInquiries, systemStats } = data

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, index: number) => (
          <Card key={index} className={`${stat.color} border-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-earth-700">{stat.title}</CardTitle>
              <div className="p-2 rounded-full bg-white/50">
                <stat.icon className="h-4 w-4 text-earth-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-earth-900 mb-1">{stat.value}</div>
              <div className="flex items-center">
                {stat.changeType === "positive" ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <p className={`text-xs font-medium ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                  {stat.change} from yesterday
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity & Top Tours */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <Card className="border-2 border-earth-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-earth-50 to-earth-100 border-b border-earth-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-earth-900">Recent Activity</CardTitle>
                <Badge variant="secondary" className="bg-earth-200 text-earth-800">
                  Live Updates
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-earth-100">
                {processedActivity.length > 0 ? (
                  processedActivity.map((activity: any, index: number) => (
                    <div key={index} className="p-4 hover:bg-earth-50 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            activity.type === 'booking' ? 'bg-green-100 text-green-600' :
                            activity.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {activity.type === 'booking' ? <Calendar className="h-4 w-4" /> :
                             activity.type === 'review' ? <Star className="h-4 w-4" /> :
                             <Mail className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-earth-900">{activity.action}</p>
                            <p className="text-sm text-earth-600">{activity.details}</p>
                            <p className="text-xs text-earth-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                        {activity.amount && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">
                              ${activity.amount.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-earth-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-earth-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Tours */}
          <Card className="border-2 border-earth-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-earth-50 to-earth-100 border-b border-earth-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-earth-900">Top Performing Tours</CardTitle>
                <Link href="/admin/tours">
                  <Button variant="ghost" size="sm" className="text-earth-600 hover:text-earth-800">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-earth-100">
                {topToursWithDetails.length > 0 ? (
                  topToursWithDetails.map((tour: any, index: number) => (
                    <div key={index} className="p-4 hover:bg-earth-50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-earth-500 to-earth-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-earth-900">{tour.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                <span className="text-xs text-earth-600">{tour.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-xs text-earth-500">•</span>
                              <span className="text-xs text-earth-600">{tour.bookings} bookings</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${tour.revenue.toLocaleString()}</p>
                          <p className="text-xs text-earth-500">Revenue</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-earth-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-earth-300" />
                    <p>No tour data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Pending Bookings Alert */}
          {pendingBookings > 0 && (
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-lg font-semibold text-yellow-800">Action Required</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-800 mb-2">{pendingBookings}</p>
                  <p className="text-sm text-yellow-700 mb-4">Pending bookings need attention</p>
                  <Link href="/admin/bookings">
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                      Review Bookings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Overview */}
          <Card className="border-2 border-earth-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-earth-50 to-earth-100 border-b border-earth-200">
              <CardTitle className="text-lg font-semibold text-earth-900">System Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{systemStats.totalTours}</p>
                  <p className="text-xs text-blue-700">Total Tours</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{systemStats.totalCustomers}</p>
                  <p className="text-xs text-green-700">Customers</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{systemStats.totalBookings}</p>
                  <p className="text-xs text-purple-700">Bookings</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{systemStats.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-yellow-700">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Contact Inquiries */}
          <Card className="border-2 border-earth-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-earth-50 to-earth-100 border-b border-earth-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-earth-900">New Inquiries</CardTitle>
                <Link href="/admin/contact">
                  <Button variant="ghost" size="sm" className="text-earth-600 hover:text-earth-800">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-earth-100">
                {contactInquiries.length > 0 ? (
                  contactInquiries.map((inquiry: any, index: number) => (
                    <div key={index} className="p-4 hover:bg-earth-50 transition-colors duration-200">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-earth-900 truncate">{inquiry.name}</p>
                          <p className="text-sm text-earth-600 truncate">{inquiry.subject || 'No subject'}</p>
                          <p className="text-xs text-earth-500 mt-1">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-earth-500">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-earth-300" />
                    <p className="text-sm">No new inquiries</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2 border-earth-100 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-earth-50 to-earth-100 border-b border-earth-200">
              <CardTitle className="text-lg font-semibold text-earth-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/tours/new">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Add New Tour
                </Button>
              </Link>
              <Link href="/admin/bookings">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Bookings
                </Button>
              </Link>
              <Link href="/admin/email">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  const data = await DashboardData();
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="section-padding">
        <div className="container-max">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-earth-900 to-earth-700 bg-clip-text text-transparent mb-2">
                  Welcome back, Admin! 👋
                </h1>
                <p className="text-earth-600 text-lg">
                  Here's what's happening with your business today
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Activity className="h-5 w-5 text-earth-500 animate-pulse" />
                <span className="text-sm text-earth-600">Live Dashboard</span>
              </div>
            </div>
          </div>
          <DashboardContent data={data} />
        </div>
      </div>
    </main>
  )
}
