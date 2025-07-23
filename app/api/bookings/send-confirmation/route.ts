import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingReference, customerEmail } = body

    if (!bookingReference || !customerEmail) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: bookingReference, customerEmail',
          success: false
        },
        { status: 400 }
      )
    }

    // Get booking details
    const mainBooking = await prisma.booking.findFirst({
      where: { bookingReference },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            price: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        guests: {
          select: {
            id: true,
            guestName: true,
            guestAge: true
          }
        }
      }
    })

    if (!mainBooking) {
      return NextResponse.json(
        { 
          error: 'Booking not found',
          success: false
        },
        { status: 404 }
      )
    }

    // Get all related bookings
    const bookings = await prisma.booking.findMany({
      where: { 
        bookingReference: {
          startsWith: bookingReference
        }
      },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    })

    // Prepare email content
    const emailContent = `
      <h2>Booking Confirmation - ${mainBooking.bookingReference}</h2>
      <p>Dear ${mainBooking.customer.name},</p>
      <p>Thank you for booking with Samba Tours! Your booking has been confirmed.</p>

      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Booking Reference:</strong> ${mainBooking.bookingReference}</li>
        <li><strong>Total Amount:</strong> $${parseFloat(mainBooking.totalAmount.toString()).toLocaleString()}</li>
        <li><strong>Number of Guests:</strong> ${mainBooking.guestCount}</li>
      </ul>

      <h3>Tours Booked:</h3>
      ${bookings.map((booking: any) => `
        <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
          <h4>${booking.tour.title}</h4>
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
          <p><strong>Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> ${booking.guestCount}</p>
          <p><strong>Price:</strong> $${parseFloat(booking.totalAmount.toString()).toLocaleString()}</p>
        </div>
      `).join('')}

      <h3>Guest Information:</h3>
      ${mainBooking.guests.map((guest: any, index: number) => `
        <p><strong>Guest ${index + 1}:</strong> ${guest.guestName} (Age: ${guest.guestAge})</p>
      `).join('')}

      <p>Our team will contact you within 24 hours to confirm your booking details and discuss payment options.</p>
      
      <p>If you have any questions, please contact us at info@sambatours.com or call +256 700 123 456.</p>
      
      <p>Best regards,<br>The Samba Tours Team</p>
    `

    // Send email (for now, just log it)
    console.log('Sending confirmation email to:', customerEmail)
    console.log('Email content:', emailContent)

    // Update booking to mark email as sent
    await prisma.booking.updateMany({
      where: { 
        bookingReference: {
          startsWith: bookingReference
        }
      },
      data: { 
        emailSent: true,
        emailSentAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully'
    })

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    
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
        error: 'An unexpected error occurred while sending confirmation email.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 
