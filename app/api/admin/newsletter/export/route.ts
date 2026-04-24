import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    // Build where clause
    const where: any = {}
    
    if (status === "active") {
      where.isActive = true
    } else if (status === "inactive") {
      where.isActive = false
    }

    // Get all subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        source: true,
        subscribedAt: true,
        unsubscribedAt: true,
        interests: true,
        metadata: true,
      }
    })

    // Convert to CSV format
    const csvHeaders = [
      "ID",
      "Email",
      "Name",
      "Status",
      "Source",
      "Subscribed Date",
      "Unsubscribed Date",
      "Interests",
      "Metadata"
    ]

    const csvRows = subscribers.map(subscriber => [
      subscriber.id,
      subscriber.email,
      subscriber.name || "",
      subscriber.isActive ? "Active" : "Inactive",
      subscriber.source || "",
      subscriber.subscribedAt,
      subscriber.unsubscribedAt || "",
      subscriber.interests ? JSON.stringify(subscriber.interests) : "",
      subscriber.metadata ? JSON.stringify(subscriber.metadata) : ""
    ])

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n")

    // Create response with CSV headers
    const response = new NextResponse(csvContent)
    response.headers.set("Content-Type", "text/csv")
    response.headers.set("Content-Disposition", `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`)

    return response

  } catch (error) {
    console.error("Error exporting newsletter subscribers:", error)
    return NextResponse.json(
      { error: "Failed to export subscribers" },
      { status: 500 }
    )
  }
} 
