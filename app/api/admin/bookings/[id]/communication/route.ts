import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
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
      where: { id: parseInt(id) }
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
        bookingId: parseInt(id),
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