import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { BookingStatus } from "@prisma/client"

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerInfo, guests, items, total, bookingReference } = body



    // Validate required data
    if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
      return NextResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No tour items in booking' },
        { status: 400 }
      )
    }

    // Validate that each item has a tourId
    for (const item of items) {
      if (!item.tourId) {
        console.error('Missing tourId in item:', item)
        return NextResponse.json(
          { error: 'Missing tourId for tour item' },
          { status: 400 }
        )
      }
    }

    // Create bookings for each tour
    const bookings = await Promise.all(
      items.map(async (item: any, index: number) => {
        const itemBookingReference = `${bookingReference}-${index + 1}`
        

        
        return await prisma.booking.create({
          data: {
            bookingReference: itemBookingReference,
            tourId: parseInt(item.tourId), // Ensure tourId is an integer
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            customerCountry: customerInfo.country || 'Uganda',
            startDate: new Date(item.startDate),
            endDate: new Date(item.startDate), // Simplified - could calculate based on duration
            guestCount: parseInt(item.guests),
            totalAmount: parseFloat((item.price * item.guests).toString()),
            finalAmount: parseFloat((item.price * item.guests).toString()),
            specialRequests: customerInfo.specialRequests || null,
            paymentStatus: 'pending',
            status: 'confirmed',
            contactMethod: 'email',
            emailSent: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      })
    )



    // Create guest records for the first booking (main booking)
    const mainBooking = bookings[0]
    const guestRecords = await Promise.all(
      guests.map((guest: any, index: number) =>
        prisma.bookingGuest.create({
          data: {
            bookingId: mainBooking.id,
            guestName: guest.name,
            guestAge: parseInt(guest.age),
            dietaryRestrictions: guest.dietaryRestrictions || null,
            medicalConditions: guest.medicalConditions || null,
            createdAt: new Date()
          }
        })
      )
    )



    // Send confirmation email
    try {
      const emailContent = `
        <h2>Booking Confirmation - ${bookingReference}</h2>
        <p>Dear ${customerInfo.name},</p>
        <p>Thank you for booking with Samba Tours! Your booking has been confirmed.</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Booking Reference:</strong> ${bookingReference}</li>
          <li><strong>Total Amount:</strong> $${total.toLocaleString()}</li>
          <li><strong>Number of Guests:</strong> ${guests.length}</li>
        </ul>

        <h3>Tours Booked:</h3>
        ${items.map((item: any, index: number) => `
          <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            <h4>${item.title}</h4>
            <p><strong>Booking Reference:</strong> ${bookingReference}-${index + 1}</p>
            <p><strong>Date:</strong> ${new Date(item.startDate).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${item.guests}</p>
            <p><strong>Price:</strong> $${(item.price * item.guests).toLocaleString()}</p>
          </div>
        `).join('')}

        <h3>Guest Information:</h3>
        ${guests.map((guest: any, index: number) => `
          <p><strong>Guest ${index + 1}:</strong> ${guest.name} (Age: ${guest.age})</p>
        `).join('')}

        <p>Our team will contact you within 24 hours to confirm your booking details and discuss payment options.</p>
        
        <p>If you have any questions, please contact us at info@sambatours.com or call +256 700 123 456.</p>
        
        <p>Best regards,<br>The Samba Tours Team</p>
      `

      // Send confirmation email
      
      try {
        // Use the custom template with the email content
        const result = await sendEmail(
          customerInfo.email,
          'custom',
          {
            customMessage: emailContent,
            subject: `Booking Confirmation - ${bookingReference}`
          }
        )
        
        if (!result.success) {
          console.error('Email sending failed:', result.error)
        }
      } catch (emailSendError) {
        // Continue with booking even if email fails
      }

      // Update all bookings to mark email as sent
      await Promise.all(
        bookings.map(booking =>
          prisma.booking.update({
            where: { id: booking.id },
            data: { 
              emailSent: true,
              emailSentAt: new Date()
            }
          })
        )
      )

    } catch (emailError) {
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: mainBooking.id,
        bookingReference: mainBooking.bookingReference,
        customerName: mainBooking.customerName,
        totalAmount: mainBooking.totalAmount,
        status: mainBooking.status,
        totalBookings: bookings.length
      },
      message: 'Booking created successfully'
    })

  } catch (error) {
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please try again later.',
          type: 'CONNECTION_ERROR'
        },
        { status: 503 }
      )
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Database query failed. Please try again.',
          type: 'QUERY_ERROR',
          details: error.message
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while creating booking.',
        type: 'UNKNOWN_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/bookings - Get bookings (admin only or customer's own bookings)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerEmail = searchParams.get('customerEmail')
    const bookingReference = searchParams.get('bookingReference')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: any = {}

    if (customerEmail) {
      where.customer = {
        email: customerEmail
      }
    }

    if (bookingReference) {
      where.bookingReference = bookingReference
    }

    // Get total count
    const total = await prisma.booking.count({ where })

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            difficulty: true,
            price: true,
            featuredImageData: true,
            featuredImageName: true,
            featuredImageType: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true
          }
        },
        guests: {
          select: {
            id: true,
            guestName: true,
            guestAge: true,
            nationality: true,
            medicalConditions: true
          }
        }
      }
    })

    // Transform bookings for response
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      numberOfGuests: booking.guestCount,
      totalAmount: parseFloat(booking.totalAmount.toString()),
      currency: 'USD',
      preferredDate: booking.startDate,
      specialRequests: booking.specialRequests,
      emergencyContact: {
        name: null,
        phone: null,
        relation: null
      },
      tour: booking.tour,
      customer: booking.customer,
      guests: booking.guests,
      emailSent: booking.emailSent,
      emailSentAt: booking.emailSentAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }))

    return NextResponse.json({
      bookings: transformedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      success: true
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while fetching bookings.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}
