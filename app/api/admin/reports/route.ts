import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateAdminSession } from "@/lib/server-auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = validateAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, dateFrom, dateTo, format = "csv" } = body

    if (!type) {
      return NextResponse.json({ error: "Report type is required" }, { status: 400 })
    }

    // Set default date range if not provided
    const startDate = dateFrom ? new Date(dateFrom) : new Date(new Date().setMonth(new Date().getMonth() - 1))
    const endDate = dateTo ? new Date(dateTo) : new Date()

    let reportData: any = {}
    let csvContent = ""

    switch (type) {
      case "revenue":
        reportData = await generateRevenueReport(startDate, endDate)
        csvContent = generateRevenueCSV(reportData)
        break
      case "bookings":
        reportData = await generateBookingsReport(startDate, endDate)
        csvContent = generateBookingsCSV(reportData)
        break
      case "customers":
        reportData = await generateCustomersReport(startDate, endDate)
        csvContent = generateCustomersCSV(reportData)
        break
      case "tours":
        reportData = await generateToursReport(startDate, endDate)
        csvContent = generateToursCSV(reportData)
        break
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Return CSV file
    const response = new NextResponse(csvContent)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set("Content-Disposition", `attachment; filename="${type}-report-${new Date().toISOString().split('T')[0]}.csv"`)
    
    return response

  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

async function generateRevenueReport(startDate: Date, endDate: Date) {
  const [
    totalRevenue,
    revenueByMonth,
    revenueByTour,
    paymentMethods,
    revenueTrends
  ] = await Promise.all([
    // Total revenue
    prisma.booking.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['confirmed', 'completed'] }
      },
      _sum: { finalAmount: true }
    }),

    // Revenue by month
    prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['confirmed', 'completed'] }
      },
      _sum: { finalAmount: true }
    }),

    // Revenue by tour
    prisma.booking.groupBy({
      by: ['tourId'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['confirmed', 'completed'] }
      },
      _sum: { finalAmount: true },
      _count: { id: true }
    }),

    // Payment methods
    prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        paymentDate: { gte: startDate, lte: endDate },
        status: "paid"
      },
      _sum: { amount: true },
      _count: { id: true }
    }),

    // Revenue trends (daily)
    prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['confirmed', 'completed'] }
      },
      _sum: { finalAmount: true }
    })
  ])

  // Get tour details for revenue by tour
  const tourDetails = await Promise.all(
    revenueByTour.map(async (tour) => {
      const tourInfo = await prisma.tour.findUnique({
        where: { id: tour.tourId },
        select: { title: true }
      })
      return {
        tourName: tourInfo?.title || 'Unknown Tour',
        revenue: Number(tour._sum.finalAmount || 0),
        bookings: tour._count.id
      }
    })
  )

  return {
    totalRevenue: Number(totalRevenue._sum.finalAmount || 0),
    revenueByMonth: revenueByMonth.map(r => ({
      month: r.createdAt,
      revenue: Number(r._sum.finalAmount || 0)
    })),
    revenueByTour: tourDetails,
    paymentMethods: paymentMethods.map(p => ({
      method: p.paymentMethod,
      amount: Number(p._sum.amount || 0),
      count: p._count.id
    })),
    revenueTrends: revenueTrends.map(r => ({
      date: r.createdAt,
      revenue: Number(r._sum.finalAmount || 0)
    }))
  }
}

async function generateBookingsReport(startDate: Date, endDate: Date) {
  const [
    totalBookings,
    bookingsByStatus,
    bookingsByTour,
    bookingsByMonth,
    customerBookings
  ] = await Promise.all([
    // Total bookings
    prisma.booking.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    }),

    // Bookings by status
    prisma.booking.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true }
    }),

    // Bookings by tour
    prisma.booking.groupBy({
      by: ['tourId'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true }
    }),

    // Bookings by month
    prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true }
    }),

    // Customer booking patterns
    prisma.booking.groupBy({
      by: ['customerId'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      _sum: { finalAmount: true }
    })
  ])

  // Get tour details
  const tourDetails = await Promise.all(
    bookingsByTour.map(async (tour) => {
      const tourInfo = await prisma.tour.findUnique({
        where: { id: tour.tourId },
        select: { title: true }
      })
      return {
        tourName: tourInfo?.title || 'Unknown Tour',
        bookings: tour._count.id
      }
    })
  )

  return {
    totalBookings,
    bookingsByStatus: bookingsByStatus.map(b => ({
      status: b.status,
      count: b._count.id
    })),
    bookingsByTour: tourDetails,
    bookingsByMonth: bookingsByMonth.map(b => ({
      month: b.createdAt,
      count: b._count.id
    })),
    customerBookings: customerBookings.map(c => ({
      customerId: c.customerId,
      bookings: c._count.id,
      totalSpent: Number(c._sum.finalAmount || 0)
    }))
  }
}

async function generateCustomersReport(startDate: Date, endDate: Date) {
  const [
    totalCustomers,
    newCustomers,
    customersByCountry,
    customersByType,
    customerActivity
  ] = await Promise.all([
    // Total customers
    prisma.customer.count(),

    // New customers in period
    prisma.customer.count({
      where: {
        joinDate: { gte: startDate, lte: endDate }
      }
    }),

    // Customers by country
    prisma.customer.groupBy({
      by: ['country'],
      _count: { id: true }
    }),

    // Customers by type
    prisma.customer.groupBy({
      by: ['customerType'],
      _count: { id: true }
    }),

    // Customer activity
    prisma.customer.findMany({
      where: {
        lastBookingDate: { gte: startDate, lte: endDate }
      },
      select: {
        id: true,
        name: true,
        email: true,
        totalBookings: true,
        totalSpent: true,
        customerType: true,
        country: true
      },
      orderBy: { totalSpent: 'desc' },
      take: 50
    })
  ])

  return {
    totalCustomers,
    newCustomers,
    customersByCountry: customersByCountry.map(c => ({
      country: c.country || 'Unknown',
      count: c._count.id
    })),
    customersByType: customersByType.map(c => ({
      type: c.customerType,
      count: c._count.id
    })),
    customerActivity: customerActivity.map(c => ({
      ...c,
      totalSpent: Number(c.totalSpent)
    }))
  }
}

async function generateToursReport(startDate: Date, endDate: Date) {
  const [
    totalTours,
    toursByCategory,
    popularTours,
    tourPerformance,
    tourReviews
  ] = await Promise.all([
    // Total tours
    prisma.tour.count(),

    // Tours by category
    prisma.tour.groupBy({
      by: ['categoryId'],
      _count: { id: true }
    }),

    // Popular tours (by bookings)
    prisma.booking.groupBy({
      by: ['tourId'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true },
      _sum: { finalAmount: true }
    }),

    // Tour performance
    prisma.tour.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        rating: true,
        reviewCount: true,
        bookingCount: true,
        viewCount: true
      },
      orderBy: { bookingCount: 'desc' }
    }),

    // Tour reviews
    prisma.tourReview.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        tourId: true,
        rating: true,
        createdAt: true
      }
    })
  ])

  // Get category details
  const categoryDetails = await Promise.all(
    toursByCategory.map(async (cat) => {
      const category = await prisma.tourCategory.findUnique({
        where: { id: cat.categoryId || 0 },
        select: { name: true }
      })
      return {
        category: category?.name || 'Uncategorized',
        count: cat._count.id
      }
    })
  )

  // Get tour details for popular tours
  const popularTourDetails = await Promise.all(
    popularTours.map(async (tour) => {
      const tourInfo = await prisma.tour.findUnique({
        where: { id: tour.tourId },
        select: { title: true }
      })
      return {
        tourName: tourInfo?.title || 'Unknown Tour',
        bookings: tour._count.id,
        revenue: Number(tour._sum.finalAmount || 0)
      }
    })
  )

  return {
    totalTours,
    toursByCategory: categoryDetails,
    popularTours: popularTourDetails,
    tourPerformance: tourPerformance.map(t => ({
      ...t,
      price: Number(t.price),
      rating: Number(t.rating)
    })),
    tourReviews: tourReviews.map(r => ({
      ...r,
      rating: Number(r.rating)
    }))
  }
}

function generateRevenueCSV(data: any) {
  let csv = "Revenue Report\n\n"
  csv += "Total Revenue," + data.totalRevenue + "\n\n"
  
  csv += "Revenue by Month\nMonth,Revenue\n"
  data.revenueByMonth.forEach((item: any) => {
    csv += `${item.month.toISOString().split('T')[0]},${item.revenue}\n`
  })
  
  csv += "\nRevenue by Tour\nTour,Revenue,Bookings\n"
  data.revenueByTour.forEach((item: any) => {
    csv += `"${item.tourName}",${item.revenue},${item.bookings}\n`
  })
  
  csv += "\nPayment Methods\nMethod,Amount,Count\n"
  data.paymentMethods.forEach((item: any) => {
    csv += `"${item.method}",${item.amount},${item.count}\n`
  })
  
  return csv
}

function generateBookingsCSV(data: any) {
  let csv = "Bookings Report\n\n"
  csv += "Total Bookings," + data.totalBookings + "\n\n"
  
  csv += "Bookings by Status\nStatus,Count\n"
  data.bookingsByStatus.forEach((item: any) => {
    csv += `${item.status},${item.count}\n`
  })
  
  csv += "\nBookings by Tour\nTour,Bookings\n"
  data.bookingsByTour.forEach((item: any) => {
    csv += `"${item.tourName}",${item.bookings}\n`
  })
  
  csv += "\nBookings by Month\nMonth,Count\n"
  data.bookingsByMonth.forEach((item: any) => {
    csv += `${item.month.toISOString().split('T')[0]},${item.count}\n`
  })
  
  return csv
}

function generateCustomersCSV(data: any) {
  let csv = "Customers Report\n\n"
  csv += "Total Customers," + data.totalCustomers + "\n"
  csv += "New Customers," + data.newCustomers + "\n\n"
  
  csv += "Customers by Country\nCountry,Count\n"
  data.customersByCountry.forEach((item: any) => {
    csv += `"${item.country}",${item.count}\n`
  })
  
  csv += "\nCustomers by Type\nType,Count\n"
  data.customersByType.forEach((item: any) => {
    csv += `${item.type},${item.count}\n`
  })
  
  csv += "\nTop Customers\nName,Email,Bookings,Total Spent,Type,Country\n"
  data.customerActivity.forEach((item: any) => {
    csv += `"${item.name}","${item.email}",${item.totalBookings},${item.totalSpent},${item.customerType},"${item.country || ''}"\n`
  })
  
  return csv
}

function generateToursCSV(data: any) {
  let csv = "Tours Performance Report\n\n"
  csv += "Total Tours," + data.totalTours + "\n\n"
  
  csv += "Tours by Category\nCategory,Count\n"
  data.toursByCategory.forEach((item: any) => {
    csv += `"${item.category}",${item.count}\n`
  })
  
  csv += "\nPopular Tours\nTour,Bookings,Revenue\n"
  data.popularTours.forEach((item: any) => {
    csv += `"${item.tourName}",${item.bookings},${item.revenue}\n`
  })
  
  csv += "\nTour Performance\nTitle,Price,Rating,Reviews,Bookings,Views\n"
  data.tourPerformance.forEach((item: any) => {
    csv += `"${item.title}",${item.price},${item.rating},${item.reviewCount},${item.bookingCount},${item.viewCount}\n`
  })
  
  return csv
}

export async function GET() {
  // For now, return dummy recent/scheduled reports (can be extended to use DB)
  return NextResponse.json({
    recent: [],
    scheduled: [],
  })
} 
