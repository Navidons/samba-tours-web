import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// GET /api/tours/[slug] - Get tour details by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Get tour with all related data
    const tour = await prisma.tour.findUnique({
      where: { 
        slug,
        status: 'active'
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        images: {
          select: {
            id: true,
            imageData: true,
            imageName: true,
            imageType: true,
            imageSize: true,
            altText: true,
            title: true,
            description: true,
            isFeatured: true,
            displayOrder: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        },
        highlights: {
          select: {
            id: true,
            highlight: true,
            icon: true,
            displayOrder: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        },
        inclusions: {
          select: {
            id: true,
            item: true,
            category: true,
            displayOrder: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        },
        exclusions: {
          select: {
            id: true,
            item: true,
            displayOrder: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        },
        itineraries: {
          select: {
            id: true,
            day: true,
            title: true,
            description: true,
            location: true,
            activities: true,
            accommodation: true,
            meals: true,
            displayOrder: true
          },
          orderBy: {
            day: 'asc'
          }
        },
        bestTimes: {
          select: {
            id: true,
            bestTimeItem: true,
            description: true,
            displayOrder: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      }
    })

    if (!tour) {
      return NextResponse.json(
        { 
          error: 'Tour not found',
          success: false
        },
        { status: 404 }
      )
    }

    // Transform tour for response
    const transformedTour = {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      description: tour.description,
      shortDescription: tour.shortDescription,
      category: tour.category,
      duration: tour.duration,
      groupSize: tour.groupSize,
      maxGroupSize: tour.maxGroupSize,
      price: parseFloat(tour.price.toString()),
      originalPrice: tour.originalPrice ? parseFloat(tour.originalPrice.toString()) : null,
      difficulty: tour.difficulty,
      location: {
        country: tour.locationCountry,
        region: tour.locationRegion,
        coordinates: tour.locationCoordinatesLat && tour.locationCoordinatesLng ? {
          lat: parseFloat(tour.locationCoordinatesLat.toString()),
          lng: parseFloat(tour.locationCoordinatesLng.toString())
        } : null
      },
      featuredImage: tour.featuredImageData ? {
        data: `data:${tour.featuredImageType};base64,${Buffer.from(tour.featuredImageData).toString('base64')}`,
        name: tour.featuredImageName,
        type: tour.featuredImageType
      } : null,
      images: tour.images.map(img => ({
        id: img.id,
        data: `data:${img.imageType || 'image/jpeg'};base64,${Buffer.from(img.imageData).toString('base64')}`,
        name: img.imageName,
        type: img.imageType,
        size: img.imageSize,
        altText: img.altText,
        title: img.title,
        description: img.description,
        isFeatured: img.isFeatured,
        displayOrder: img.displayOrder
      })),
      featured: tour.featured,
      popular: tour.popular,
      isNew: tour.isNew,
      rating: parseFloat(tour.rating.toString()),
      reviewCount: tour.reviewCount,
      viewCount: tour.viewCount,
      bookingCount: tour.bookingCount,
      bestTime: tour.bestTime,
      bestTimes: tour.bestTimes,
      physicalRequirements: tour.physicalRequirements,
      whatToBring: tour.whatToBring,
      highlights: tour.highlights,
      inclusions: tour.inclusions,
      exclusions: tour.exclusions,
      itinerary: tour.itineraries,
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
      stats: {
        totalReviews: tour._count.reviews,
        totalBookings: tour._count.bookings
      }
    }

    return NextResponse.json({
      tour: transformedTour,
      success: true
    })

  } catch (error) {
    console.error('Error fetching tour:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please try again later.',
          type: 'CONNECTION_ERROR',
          success: false
        },
        { status: 503 }
      )
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Database query failed. Please try again.',
          type: 'QUERY_ERROR',
          success: false
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while fetching tour.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// POST /api/tours/[slug] - Create a review for a tour
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()

    // Validate required fields
    const { rating, title, content, reviewerName, reviewerEmail, tourDate, wouldRecommend } = body

    if (!rating || !content || !reviewerName || !reviewerEmail) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: rating, content, reviewerName, reviewerEmail',
          success: false
        },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { 
          error: 'Rating must be between 1 and 5',
          success: false
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(reviewerEmail)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          success: false
        },
        { status: 400 }
      )
    }

    // Check if tour exists
    const tour = await prisma.tour.findUnique({
      where: { 
        slug,
        status: 'active'
      },
      select: { id: true }
    })

    if (!tour) {
      return NextResponse.json(
        { 
          error: 'Tour not found',
          success: false
        },
        { status: 404 }
      )
    }

    // Create review
    const review = await prisma.tourReview.create({
      data: {
        tourId: tour.id,
        userId: null,
        bookingId: null,
        rating: parseInt(rating),
        title: title?.trim() || null,
        comment: content.trim(),
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.trim(),
        userImage: null, // Will be updated if image is provided
        tourDate: tourDate && tourDate !== '' ? new Date(tourDate) : null,
        wouldRecommend: wouldRecommend !== undefined ? Boolean(wouldRecommend) : true,
        isVerified: false,
        isFeatured: false,
        helpfulCount: 0,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Update tour rating and review count
    const tourReviews = await prisma.tourReview.findMany({
      where: { 
        tourId: tour.id,
        status: 'approved'
      },
      select: { rating: true }
    })

    const totalRating = tourReviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0)
    const averageRating = tourReviews.length > 0 ? totalRating / tourReviews.length : 0

    await prisma.tour.update({
      where: { id: tour.id },
      data: {
        rating: averageRating,
        reviewCount: tourReviews.length,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.comment,
        reviewerName: review.reviewerName,
        userImage: review.userImage ? `data:image/jpeg;base64,${Buffer.from(review.userImage).toString('base64')}` : null,
        createdAt: review.createdAt
      },
      success: true,
      message: 'Review submitted successfully'
    })

  } catch (error) {
    console.error('Error creating review:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please try again later.',
          type: 'CONNECTION_ERROR',
          success: false
        },
        { status: 503 }
      )
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Database query failed. Please try again.',
          type: 'QUERY_ERROR',
          success: false
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while creating review.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}
