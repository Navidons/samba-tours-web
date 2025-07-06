import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const { reference } = params

    // Get booking with all related data
    const booking = await prisma.booking.findFirst({
      where: { 
        bookingReference: reference
      },
      include: {
        guests: {
          select: {
            id: true,
            guestName: true,
            guestAge: true,
            dietaryRestrictions: true,
            medicalConditions: true
          }
        },
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            locationCountry: true,
            locationRegion: true,
            price: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { 
          error: 'Booking not found',
          success: false
        },
        { status: 404 }
      )
    }

    // Transform booking for response
    const transformedBooking = {
      id: booking.id,
      bookingReference: booking.bookingReference,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      customerCountry: booking.customerCountry,
      startDate: booking.startDate,
      endDate: booking.endDate,
      guestCount: booking.guestCount,
      totalAmount: parseFloat(booking.totalAmount.toString()),
      finalAmount: parseFloat(booking.finalAmount.toString()),
      specialRequests: booking.specialRequests,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      contactMethod: booking.contactMethod,
      emailSent: booking.emailSent,
      emailSentAt: booking.emailSentAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      guests: booking.guests,
      tour: booking.tour ? {
        id: booking.tour.id,
        title: booking.tour.title,
        slug: booking.tour.slug,
        duration: booking.tour.duration,
        location: `${booking.tour.locationRegion}, ${booking.tour.locationCountry}`,
        price: parseFloat(booking.tour.price.toString())
      } : null
    }

    return NextResponse.json({
      booking: transformedBooking,
      success: true
    })

  } catch (error) {
    console.error('Error fetching booking:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please try again later.',
          type: 'CONNECTION_ERROR',
          success: false
        },
        { status: 503 }
      )
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Database query failed. Please try again.',
          type: 'QUERY_ERROR',
          success: false
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while fetching booking.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 