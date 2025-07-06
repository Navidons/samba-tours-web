import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Message is required" 
      }, { status: 400 })
    }

    // Get the booking to verify it exists and get customer info
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        tour: {
          select: {
            title: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ 
        success: false, 
        error: "Booking not found" 
      }, { status: 404 })
    }

    // Here you would typically integrate with your email service
    // For now, we'll just log the message and return success
    console.log(`Message to ${booking.customerEmail} about booking ${booking.bookingReference}:`, message)

    // You could also store the message in the database if needed
    // await prisma.bookingMessage.create({
    //   data: {
    //     bookingId: booking.id,
    //     message: message,
    //     sentBy: "admin",
    //     sentAt: new Date()
    //   }
    // })

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully" 
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
} 