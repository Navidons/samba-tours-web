import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } }
      ]
    }

    if (status === "active") {
      where.isActive = true
    } else if (status === "inactive") {
      where.isActive = false
    }

    // Get total count
    const total = await prisma.newsletterSubscriber.count({ where })

    // Get subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        interests: true,
        isActive: true,
        source: true,
        subscribedAt: true,
        unsubscribedAt: true
      },
      orderBy: {
        subscribedAt: "desc"
      },
      skip,
      take: limit
    })

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error)
    return NextResponse.json(
      { error: "Failed to fetch newsletter subscribers" },
      { status: 500 }
    )
  }
} 