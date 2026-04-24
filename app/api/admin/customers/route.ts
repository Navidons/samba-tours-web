import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdminSession } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const session = validateAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const customerType = searchParams.get('customerType') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (customerType && customerType !== 'all') {
      where.customerType = customerType
    }

    // Get customers with their recent bookings
    const customers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        city: true,
        address: true,
        totalBookings: true,
        totalSpent: true,
        firstBookingDate: true,
        lastBookingDate: true,
        status: true,
        customerType: true,
        loyaltyPoints: true,
        preferredContactMethod: true,
        preferredContactTime: true,
        notes: true,
        joinDate: true,
        updatedAt: true,
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            bookingReference: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { joinDate: 'desc' },
      skip,
      take: limit
    })

    // Get total count
    const total = await prisma.customer.count({ where })

    // Calculate if there are more pages
    const hasMore = total > skip + limit

    // Get customer stats
    const [
      totalCustomers,
      activeCustomers,
      bookingStats
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'active' } }),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        _avg: { totalAmount: true }
      })
    ])

    // Format the response
    const formattedCustomers = customers.map(customer => ({
      ...customer,
      recentBookings: customer.bookings.map(booking => ({
        id: booking.id,
        reference: booking.bookingReference,
        startDate: booking.startDate,
        endDate: booking.endDate,
        amount: booking.totalAmount,
        status: booking.status,
        createdAt: booking.createdAt
      })),
      lastBooking: customer.bookings[0] ? {
        reference: customer.bookings[0].bookingReference,
        date: customer.bookings[0].startDate,
        amount: customer.bookings[0].totalAmount,
        status: customer.bookings[0].status
      } : null
    }))

    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
      total,
      page,
      limit,
      hasMore,
      stats: {
        totalCustomers,
        activeCustomers,
        totalRevenue: bookingStats._sum?.totalAmount || 0,
        avgOrderValue: bookingStats._avg?.totalAmount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch customers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
