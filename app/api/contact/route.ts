import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"
import { sendContactInquiryNotifications } from "@/lib/notifications"

const prisma = new PrismaClient()

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  tourType: z.string().min(1, "Please select a tour type"),
  travelDate: z.string().optional(),
  groupSize: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = contactSchema.parse(body)
    
    // Create contact inquiry in database
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: `Tour Inquiry: ${validatedData.tourType}`,
        message: validatedData.message,
        tourInterest: validatedData.tourType,
        priority: "Normal",
        status: "new",
        // Store additional data in metadata
        // Note: You might want to add a metadata field to ContactInquiry model
      }
    })

    // Send email notifications
    await sendContactInquiryNotifications({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      tourType: validatedData.tourType,
      message: validatedData.message,
      inquiryId: inquiry.id
    })

    return NextResponse.json({
      success: true,
      message: "Thank you for your inquiry! We'll get back to you within 24 hours.",
      inquiryId: inquiry.id
    })

  } catch (error) {
    console.error("Contact form submission error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please check your form and try again.",
          errors: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Something went wrong. Please try again later." 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || "all"

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status !== "all") {
      where.status = status
    }

    // Get inquiries with pagination
    const [inquiries, totalCount] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.contactInquiry.count({ where })
    ])

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching contact inquiries:", error)
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    )
  }
}
