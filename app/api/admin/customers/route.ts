import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const customerType = searchParams.get("customerType")

    // Build where clause
    const where: any = {}
    
    if (status && status !== "all") {
      where.status = status
    }

    if (customerType && customerType !== "all") {
      where.customerType = customerType
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get customers with pagination and related data
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          bookings: {
            select: {
              id: true,
              bookingReference: true,
              startDate: true,
              endDate: true,
              totalAmount: true,
              status: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5 // Get last 5 bookings
          },
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: { joinDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.customer.count({ where })
    ])

    // Get stats
    const [totalCustomers, activeCustomers, totalRevenue, avgOrderValue] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'active' } }),
      prisma.customer.aggregate({
        _sum: {
          totalSpent: true
        }
      }),
      prisma.customer.aggregate({
        _avg: {
          totalSpent: true
        },
        where: {
          totalSpent: { gt: 0 }
        }
      })
    ])

    // Transform the data
    const transformedCustomers = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      country: customer.country || '',
      city: customer.city || '',
      address: customer.address || '',
      total_bookings: customer.totalBookings,
      total_spent: Number(customer.totalSpent),
      first_booking_date: customer.firstBookingDate?.toISOString(),
      last_booking_date: customer.lastBookingDate?.toISOString(),
      status: customer.status,
      customer_type: customer.customerType,
      loyalty_points: customer.loyaltyPoints,
      preferred_contact_method: customer.preferredContactMethod,
      preferred_contact_time: customer.preferredContactTime || '',
      notes: customer.notes || '',
      join_date: customer.joinDate.toISOString(),
      updated_at: customer.updatedAt.toISOString(),
      // Calculate last booking from related bookings
      last_booking: customer.bookings.length > 0 ? {
        reference: customer.bookings[0].bookingReference,
        date: customer.bookings[0].startDate.toISOString(),
        amount: Number(customer.bookings[0].totalAmount),
        status: customer.bookings[0].status
      } : null,
      // Recent bookings
      recent_bookings: customer.bookings.map(booking => ({
        id: booking.id,
        reference: booking.bookingReference,
        start_date: booking.startDate.toISOString(),
        end_date: booking.endDate.toISOString(),
        amount: Number(booking.totalAmount),
        status: booking.status,
        created_at: booking.createdAt.toISOString()
      }))
    }))

    return NextResponse.json({
      success: true,
      customers: transformedCustomers,
      total,
      page,
      limit,
      hasMore: total > page * limit,
      stats: {
        totalCustomers,
        activeCustomers,
        totalRevenue: Number(totalRevenue._sum.totalSpent || 0),
        avgOrderValue: Number(avgOrderValue._avg.totalSpent || 0)
      }
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 