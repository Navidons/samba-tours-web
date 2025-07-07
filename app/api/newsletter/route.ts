import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"
import { sendNewsletterSubscriptionNotification } from "@/lib/notifications"

const prisma = new PrismaClient()

// Validation schema for newsletter subscription
const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  interests: z.array(z.string()).optional(),
  source: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = newsletterSchema.parse(body)
    
    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: validatedData.email }
    })

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { 
            success: false, 
            message: "This email is already subscribed to our newsletter." 
          },
          { status: 400 }
        )
      } else {
        // Reactivate the subscription
        await prisma.newsletterSubscriber.update({
          where: { email: validatedData.email },
          data: {
            isActive: true,
            unsubscribedAt: null,
            name: validatedData.name || existingSubscriber.name,
            interests: validatedData.interests || existingSubscriber.interests || [],
            source: validatedData.source || existingSubscriber.source,
          }
        })

        return NextResponse.json({
          success: true,
          message: "Welcome back! Your newsletter subscription has been reactivated."
        })
      }
    }

    // Create new subscription
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        interests: validatedData.interests,
        source: validatedData.source || "homepage",
        isActive: true,
      }
    })

    // Send welcome email to subscriber
    await sendNewsletterSubscriptionNotification({
      email: validatedData.email,
      name: validatedData.name
    })

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to our newsletter! You'll receive updates about exclusive safari deals and travel tips.",
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    })

  } catch (error) {
    console.error("Newsletter subscription error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid email address. Please check and try again.",
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email parameter is required" },
        { status: 400 }
      )
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: "Email not found in our subscription list" },
        { status: 404 }
      )
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "You have been successfully unsubscribed from our newsletter."
    })

  } catch (error) {
    console.error("Newsletter unsubscribe error:", error)
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again later." },
      { status: 500 }
    )
  }
}
