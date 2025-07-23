import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Test data
    const testData = {
      bookingReference: `TEST-${Date.now()}`,
      tourId: 1, // Assuming tour with ID 1 exists
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: "1234567890",
      customerCountry: "Uganda",
      startDate: new Date("2025-08-15"),
      endDate: new Date("2025-08-15"),
      guestCount: 2,
      totalAmount: 1000,
      finalAmount: 1000,
      specialRequests: "Test booking",
      paymentStatus: 'pending',
      status: 'confirmed',
      contactMethod: 'email',
      emailSent: false
    }

    console.log('Creating test booking with data:', testData)

    const booking = await prisma.booking.create({
      data: testData
    })

    console.log('Test booking created successfully:', booking)

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        tourId: booking.tourId
      },
      message: 'Test booking created successfully'
    })

  } catch (error) {
    console.error('Test booking error:', error)
    
    return NextResponse.json(
      { 
        error: 'Test booking failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
