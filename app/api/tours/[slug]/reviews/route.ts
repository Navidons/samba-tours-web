import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const sortBy = searchParams.get("sortBy") || "newest"
    const filterBy = searchParams.get("filterBy") || "all"

    const offset = (page - 1) * limit

    // Get tour by slug first
    const tour = await prisma.tour.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Build where clause
    const where: any = { tourId: tour.id }
    
    // Apply rating filter
    if (filterBy !== "all") {
      where.rating = Number.parseInt(filterBy)
    }

    // Build orderBy clause
    let orderBy: any = {}
    switch (sortBy) {
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "highest":
        orderBy = { rating: "desc" }
        break
      case "lowest":
        orderBy = { rating: "asc" }
        break
      case "helpful":
        orderBy = { helpfulCount: "desc" }
        break
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.tourReview.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
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
      prisma.tourReview.count({ where })
    ])

    // Transform reviews to match component expectations
    const transformedReviews = reviews.map(review => ({
      id: review.id.toString(),
      userId: review.userId?.toString() || 'anonymous',
      userName: review.reviewerName || review.user?.profile?.fullName || 'Anonymous',
              userImage: review.userImage ? `data:image/jpeg;base64,${Buffer.from(review.userImage).toString('base64')}` : "",
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
      date: review.createdAt.toISOString(),
      verified: review.isVerified || false,
      helpful: review.helpfulCount || 0,
      tourDate: review.tourDate?.toISOString() || '',
      images: [], // No images support yet
      response: null // No response support yet
    }))

    return NextResponse.json({
      reviews: transformedReviews,
      pagination: {
        page,
        limit,
        total,
        hasMore: total > offset + limit,
      },
    })
  } catch (error) {
    console.error("Error in reviews API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json()

    const { name, email, rating, title, comment, tourDate, wouldRecommend, images } = body

    // Validate required fields
    if (!name || !email || !rating || !comment || !tourDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Get tour by slug
    const tour = await prisma.tour.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Create review
    const review = await prisma.tourReview.create({
      data: {
        tourId: tour.id,
        reviewerName: name,
        reviewerEmail: email,
        rating,
        title: title || null,
        comment,
        tourDate: new Date(tourDate),
        wouldRecommend: wouldRecommend || false,
        isVerified: false,
        helpfulCount: 0,
      }
    })

    // Update tour rating statistics
    await updateTourRating(tour.id)

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error("Error in review creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function updateTourRating(tourId: number) {
  try {
    // Get all reviews for this tour
    const reviews = await prisma.tourReview.findMany({
      where: { tourId },
      select: { rating: true }
    })

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length

      // Update tour with new rating
      await prisma.tour.update({
        where: { id: tourId },
        data: {
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          reviewCount: reviews.length,
        }
      })
    }
  } catch (error) {
    console.error("Error updating tour rating:", error)
  }
}
