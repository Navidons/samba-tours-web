import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { type, notes, staffMember, outcome, nextFollowUpDate } = body

    if (!notes || !notes.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Notes are required" 
      }, { status: 400 })
    }

    // Verify the booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!booking) {
      return NextResponse.json({ 
        success: false, 
        error: "Booking not found" 
      }, { status: 404 })
    }

    // Create communication record
    const communication = await prisma.bookingCommunication.create({
      data: {
        bookingId: parseInt(params.id),
        communicationType: type,
        staffMember: staffMember || "Admin",
        message: notes,
        outcome: outcome || null,
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null
      }
    })

    return NextResponse.json({ 
      success: true, 
      communication 
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
} 