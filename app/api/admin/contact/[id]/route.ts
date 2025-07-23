import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"
import { requireAdminAuth } from '@/lib/server-auth'

const prisma = new PrismaClient()

// Validation schema for updating contact inquiry
const updateInquirySchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]).optional(),
  priority: z.enum(["Low", "Normal", "High", "Urgent"]).optional(),
  assignedTo: z.number().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid inquiry ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateInquirySchema.parse(body)

    // Check if inquiry exists
    const existingInquiry = await prisma.contactInquiry.findUnique({
      where: { id }
    })

    if (!existingInquiry) {
      return NextResponse.json(
        { error: "Contact inquiry not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = { ...validatedData }
    
    // Set repliedAt timestamp when status changes to "replied"
    if (validatedData.status === "replied" && existingInquiry.status !== "replied") {
      updateData.repliedAt = new Date()
    }

    // Update the inquiry
    const updatedInquiry = await prisma.contactInquiry.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Contact inquiry updated successfully",
      inquiry: updatedInquiry
    })

  } catch (error) {
    console.error("Error updating contact inquiry:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid data provided",
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update contact inquiry" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid inquiry ID" },
        { status: 400 }
      )
    }

    const inquiry = await prisma.contactInquiry.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    if (!inquiry) {
      return NextResponse.json(
        { error: "Contact inquiry not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      inquiry
    })

  } catch (error) {
    console.error("Error fetching contact inquiry:", error)
    return NextResponse.json(
      { error: "Failed to fetch contact inquiry" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid inquiry ID" },
        { status: 400 }
      )
    }

    // Check if inquiry exists
    const existingInquiry = await prisma.contactInquiry.findUnique({
      where: { id }
    })

    if (!existingInquiry) {
      return NextResponse.json(
        { error: "Contact inquiry not found" },
        { status: 404 }
      )
    }

    // Delete the inquiry
    await prisma.contactInquiry.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Contact inquiry deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting contact inquiry:", error)
    return NextResponse.json(
      { error: "Failed to delete contact inquiry" },
      { status: 500 }
    )
  }
} 