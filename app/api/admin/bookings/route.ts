import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { bookingReference: { contains: search, mode: 'insensitive' } },
        { tour: { title: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status) {
      where.status = status
    }

    // Get total count
    const total = await prisma.booking.count({ where })

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true,
        bookingReference: true,
        tourId: true,
        userId: true,
        customerId: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerCountry: true,
        startDate: true,
        endDate: true,
        guestCount: true,
        totalAmount: true,
        discountAmount: true,
        finalAmount: true,
        specialRequests: true,
        status: true,
        paymentStatus: true,
        cancellationReason: true,
        staffNotes: true,
        contactMethod: true,
        preferredContactTime: true,
        emailSent: true,
        emailSentAt: true,
        createdAt: true,
        updatedAt: true,
        tour: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        guests: {
          select: {
            id: true,
            guestName: true,
            guestAge: true,
            dietaryRestrictions: true,
            medicalConditions: true,
            passportNumber: true,
            nationality: true,
            emergencyContact: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    return NextResponse.json({
      bookings,
      pagination: {
      page,
      limit,
        total,
        pages: Math.ceil(total / limit)
      },
      success: true
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
