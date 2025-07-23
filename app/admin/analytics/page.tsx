import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import AnalyticsClient from './AnalyticsClient'
import React from "react"

function AnalyticsSkeleton() {
    return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
                    <div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>
      
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-4" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function Analytics() {
  const period = "30days";
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
    // Fetch all analytics data in parallel with error handling
    const [
      totalRevenue,
      previousRevenue,
      totalBookings,
      previousBookings,
      totalCustomers,
      previousCustomers,
      topTours,
      recentBookings,
      recentReviews,
      recentContacts,
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
      }).catch(() => ({ _sum: { finalAmount: null } })),

      // Previous period revenue
      prisma.booking.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          status: { in: ['confirmed', 'completed'] }
        },
        _sum: { finalAmount: true }
      }).catch(() => ({ _sum: { finalAmount: null } })),

      // Current period bookings
      prisma.booking.count({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['confirmed', 'completed'] }
        }
      }).catch(() => 0),

      // Previous period bookings
      prisma.booking.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          status: { in: ['confirmed', 'completed'] }
        }
      }).catch(() => 0),

      // Current period customers
      prisma.customer.count({
        where: {
          joinDate: { gte: startDate }
        }
      }).catch(() => 0),

      // Previous period customers
      prisma.customer.count({
        where: {
          joinDate: { gte: previousStartDate, lt: startDate }
        }
      }).catch(() => 0),



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
      }).catch(() => []),

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
      }).catch(() => []),

      // Recent reviews
      prisma.tourReview.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          reviewerName: true,
          rating: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }).catch(() => []),

      // Recent contacts
      prisma.contactInquiry.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          name: true,
          subject: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }).catch(() => []),

      // Revenue by month (last 12 months)
      prisma.booking.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) },
          status: { in: ['confirmed', 'completed'] }
        },
        _sum: { finalAmount: true }
      }).catch(() => []),

      // Bookings by month
      prisma.booking.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) },
          status: { in: ['confirmed', 'completed'] }
        },
        _count: { id: true }
      }).catch(() => []),

      // Customer statistics
      prisma.customer.aggregate({
        _count: { id: true },
        _avg: { totalSpent: true },
        _sum: { totalSpent: true }
      }).catch(() => ({ _count: { id: 0 }, _avg: { totalSpent: null }, _sum: { totalSpent: null } })),

      // Tour statistics
      prisma.tour.aggregate({
        _count: { id: true },
        _avg: { rating: true, price: true }
      }).catch(() => ({ _count: { id: 0 }, _avg: { rating: null, price: null } })),

      // Contact inquiry statistics
      prisma.contactInquiry.aggregate({
        where: { createdAt: { gte: startDate } },
        _count: { id: true }
      }).catch(() => ({ _count: { id: 0 } })),

      // Email statistics
      prisma.emailSent.aggregate({
        where: { sentAt: { gte: startDate } },
        _count: { id: true }
      }).catch(() => ({ _count: { id: 0 } }))
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

    // Get tour details for top tours
    const topToursWithDetails = await Promise.all(
      topTours.map(async (tour) => {
        try {
        const tourDetails = await prisma.tour.findUnique({
          where: { id: tour.tourId },
          select: { title: true, price: true }
        })
        return {
          name: tourDetails?.title || 'Unknown Tour',
          bookings: tour._count.id,
          revenue: Number(tour._sum.finalAmount || 0)
          }
        } catch (error) {
          return {
            name: 'Unknown Tour',
            bookings: tour._count.id,
            revenue: Number(tour._sum.finalAmount || 0)
          }
        }
      })
    )

    // Process recent activity by combining bookings, reviews, and contacts
    const processedActivity = [
      ...recentBookings.slice(0, 3).map((booking) => ({
        action: 'New booking',
        details: `${booking.customerName} - ${booking.bookingReference}`,
        time: new Date(booking.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: 'booking'
      })),
      ...recentReviews.slice(0, 3).map((review) => ({
        action: 'New review',
        details: `${review.reviewerName} - ${review.rating} stars`,
        time: new Date(review.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: 'review'
      })),
      ...recentContacts.slice(0, 3).map((contact) => ({
        action: 'New inquiry',
        details: `${contact.name} - ${contact.subject || 'General inquiry'}`,
        time: new Date(contact.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
        type: 'contact'
    }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

    const stats = [
      {
        title: "Total Revenue",
        value: `$${Number(totalRevenue._sum.finalAmount || 0).toLocaleString()}`,
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
        changeType: revenueChange >= 0 ? "positive" as const : "negative" as const,
      },
      {
        title: "Total Bookings",
        value: totalBookings.toLocaleString(),
        change: `${bookingsChange >= 0 ? '+' : ''}${bookingsChange.toFixed(1)}%`,
        changeType: bookingsChange >= 0 ? "positive" as const : "negative" as const,
      },
      {
        title: "New Customers",
        value: totalCustomers.toLocaleString(),
        change: `${customersChange >= 0 ? '+' : ''}${customersChange.toFixed(1)}%`,
        changeType: customersChange >= 0 ? "positive" as const : "negative" as const,
      },

    ]

    // Convert Decimal objects to plain numbers for client components
    const safeRevenueByMonth = revenueByMonth.map(r => ({
      ...r,
      _sum: { finalAmount: r._sum.finalAmount ? Number(r._sum.finalAmount) : 0 },
      createdAt: r.createdAt
    }));
    const safeBookingsByMonth = bookingsByMonth.map(b => ({
      ...b,
      _count: { id: b._count.id ? Number(b._count.id) : 0 },
      createdAt: b.createdAt
    }));
    const safeTopToursWithDetails = topToursWithDetails.map(t => ({
      ...t,
      revenue: t.revenue ? Number(t.revenue) : 0,
      bookings: t.bookings ? Number(t.bookings) : 0
    }));

    // Convert recentBookings Decimal objects to plain numbers
    const safeRecentBookings = recentBookings.map(booking => ({
      ...booking,
      totalAmount: booking.totalAmount ? Number(booking.totalAmount) : 0,
      discountAmount: booking.discountAmount ? Number(booking.discountAmount) : 0,
      finalAmount: booking.finalAmount ? Number(booking.finalAmount) : 0
    }));

    const analyticsData = {
      stats,
      topToursWithDetails: safeTopToursWithDetails,
      recentBookings: safeRecentBookings,
      processedActivity,
      revenueByMonth: safeRevenueByMonth,
      bookingsByMonth: safeBookingsByMonth,
      customerStats: {
        totalCustomers: customerStats._count.id,
        avgOrderValue: customerStats._avg.totalSpent ? Number(customerStats._avg.totalSpent) : 0,
        totalRevenue: customerStats._sum.totalSpent ? Number(customerStats._sum.totalSpent) : 0
      },
      tourStats: {
        totalTours: tourStats._count.id,
        avgRating: tourStats._avg.rating ? Number(tourStats._avg.rating) : 0,
        avgPrice: tourStats._avg.price ? Number(tourStats._avg.price) : 0
      },
      contactStats: {
        totalInquiries: contactStats._count.id
      },
      emailStats: {
        totalEmails: emailStats._count.id
      }
    };

    return (
      <main className="min-h-screen bg-gray-50">
        <div className="section-padding">
          <div className="container-max">
            <Suspense fallback={<AnalyticsSkeleton />}>
              <AnalyticsClient 
                period={period}
                analyticsData={analyticsData}
              />
            </Suspense>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading analytics data. Please try again.</p>
        <p className="text-sm text-gray-500 mt-2">Error details: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    )
  }
}
