import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { Difficulty, TourStatus } from "@prisma/client"

// GET /api/admin/tours/[id] - Get specific tour with all details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tourId = parseInt(params.id)

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        creator: {
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
        },
        images: {
          select: {
            id: true,
            imageData: true,
            imageName: true,
            imageType: true,
            imageSize: true,
            title: true,
            altText: true,
            description: true,
            isFeatured: true,
            displayOrder: true,
            createdAt: true
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
        physicalReqs: {
          select: {
            id: true,
            requirement: true,
            category: true,
            displayOrder: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            status: true,
            createdAt: true,
            reviewerName: true,
            reviewerEmail: true,
            title: true,
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    fullName: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        bookings: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            customerName: true,
            customerEmail: true,
            customer: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            images: true,
            highlights: true,
            inclusions: true,
            exclusions: true,
            itineraries: true
          }
        }
      }
    })

    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found', success: false },
        { status: 404 }
      )
    }

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
      price: Number(tour.price),
      originalPrice: tour.originalPrice ? Number(tour.originalPrice) : null,
      difficulty: tour.difficulty,
      locationCountry: tour.locationCountry,
      locationRegion: tour.locationRegion,
      locationCoordinates: tour.locationCoordinatesLat && tour.locationCoordinatesLng ? {
        lat: Number(tour.locationCoordinatesLat),
        lng: Number(tour.locationCoordinatesLng)
      } : null,
      featuredImage: tour.featuredImageData ? {
        data: Buffer.from(tour.featuredImageData).toString('base64'),
        name: tour.featuredImageName,
        type: tour.featuredImageType,
        size: tour.featuredImageSize
      } : null,
      status: tour.status,
      featured: tour.featured,
      popular: tour.popular,
      isNew: tour.isNew,
      rating: Number(tour.rating),
      reviewCount: tour.reviewCount,
      viewCount: tour.viewCount,
      bookingCount: tour.bookingCount,
      bestTime: tour.bestTime,
      physicalRequirements: tour.physicalRequirements,
      whatToBring: tour.whatToBring,
      createdBy: tour.creator,
      createdAt: tour.createdAt.toISOString(),
      updatedAt: tour.updatedAt.toISOString(),
      images: tour.images.map(image => ({
        id: image.id,
        data: image.imageData ? Buffer.from(image.imageData).toString('base64') : null,
        name: image.imageName,
        type: image.imageType,
        size: image.imageSize,
        title: image.title,
        altText: image.altText,
        description: image.description,
        isFeatured: image.isFeatured,
        displayOrder: image.displayOrder,
        createdAt: image.createdAt.toISOString()
      })),
      highlights: tour.highlights || [],
      inclusions: tour.inclusions || [],
      exclusions: tour.exclusions || [],
      itineraries: tour.itineraries || [],
      bestTimes: tour.bestTimes || [],
      physicalReqs: tour.physicalReqs || [],
      reviews: tour.reviews.map(review => ({
        ...review,
        createdAt: review.createdAt.toISOString()
      })) || [],
      bookings: tour.bookings.map(booking => ({
        ...booking,
        createdAt: booking.createdAt.toISOString(),
        totalAmount: Number(booking.totalAmount)
      })) || [],
      counts: tour._count
    }

    return NextResponse.json({ tour: transformedTour, success: true })

  } catch (error) {
    console.error('Error fetching tour:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check if the database server is running.',
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

// PUT /api/admin/tours/[id] - Update tour
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tourId = parseInt(params.id)
    const formData = await request.formData()

    // Check if tour exists
    const existingTour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        highlights: true,
        inclusions: true,
        exclusions: true,
        itineraries: true,
        bestTimes: true,
        physicalReqs: true
      }
    })

    if (!existingTour) {
      return NextResponse.json(
        { error: 'Tour not found', success: false },
        { status: 404 }
      )
    }

    // Get updated tour data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const shortDescription = formData.get('shortDescription') as string || ''
    const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null
    const duration = formData.get('duration') as string
    const groupSize = formData.get('groupSize') as string || '1-8 people'
    const maxGroupSize = formData.get('maxGroupSize') ? parseInt(formData.get('maxGroupSize') as string) : 12
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : 0
    const originalPrice = formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : null
    const difficulty = (formData.get('difficulty') as string || 'Moderate') as Difficulty
    const locationCountry = formData.get('locationCountry') as string || 'Uganda'
    const locationRegion = formData.get('locationRegion') as string || null
    const locationCoordinatesLat = formData.get('locationCoordinatesLat') ? parseFloat(formData.get('locationCoordinatesLat') as string) : null
    const locationCoordinatesLng = formData.get('locationCoordinatesLng') ? parseFloat(formData.get('locationCoordinatesLng') as string) : null
    const status = (formData.get('status') as string || 'active') as TourStatus
    const featured = formData.get('featured') === 'true'
    const popular = formData.get('popular') === 'true'
    const isNew = formData.get('isNew') === 'true'
    const physicalRequirements = formData.get('physicalRequirements') as string || null

    // Parse JSON fields
    const bestTime = formData.get('bestTime') ? JSON.parse(formData.get('bestTime') as string) : null
    const whatToBring = formData.get('whatToBring') ? JSON.parse(formData.get('whatToBring') as string) : null

    // Generate new slug if title changed
    let slug = existingTour.slug
    if (title !== existingTour.title) {
      slug = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      
      // Check if new slug already exists
      const existingSlug = await prisma.tour.findFirst({
        where: { 
          slug,
          id: { not: tourId }
        }
      })
      
      if (existingSlug) {
        slug = `${slug}-${tourId}`
      }
    }

    // Handle featured image
    const featuredImageFile = formData.get('featuredImage') as File | null
    const removeFeaturedImage = formData.get('removeFeaturedImage') === 'true'
    
    let featuredImageData = existingTour.featuredImageData
    let featuredImageName = existingTour.featuredImageName
    let featuredImageType = existingTour.featuredImageType
    let featuredImageSize = existingTour.featuredImageSize

    if (removeFeaturedImage) {
      featuredImageData = null
      featuredImageName = null
      featuredImageType = null
      featuredImageSize = null
    } else if (featuredImageFile) {
      const buffer = Buffer.from(await featuredImageFile.arrayBuffer())
      featuredImageData = buffer
      featuredImageName = featuredImageFile.name
      featuredImageType = featuredImageFile.type
      featuredImageSize = featuredImageFile.size
    }

    // Update tour in transaction
    const updatedTour = await prisma.$transaction(async (tx) => {
      // Update main tour data
      const tour = await tx.tour.update({
        where: { id: tourId },
        data: {
          title,
          slug,
          description,
          shortDescription,
          categoryId,
          duration,
          groupSize,
          maxGroupSize,
          price,
          originalPrice,
          difficulty,
          locationCountry,
          locationRegion,
          locationCoordinatesLat,
          locationCoordinatesLng,
          featuredImageData,
          featuredImageName,
          featuredImageType,
          featuredImageSize,
          status,
          featured,
          popular,
          isNew,
          physicalRequirements,
          bestTime,
          whatToBring
        }
      })

      // Handle related data updates
      const highlights = formData.get('highlights') ? JSON.parse(formData.get('highlights') as string) : []
      const inclusions = formData.get('inclusions') ? JSON.parse(formData.get('inclusions') as string) : []
      const exclusions = formData.get('exclusions') ? JSON.parse(formData.get('exclusions') as string) : []
      const itineraries = formData.get('itineraries') ? JSON.parse(formData.get('itineraries') as string) : []

      // Update highlights
      if (highlights.length > 0) {
        await tx.tourHighlight.deleteMany({ where: { tourId } })
        await tx.tourHighlight.createMany({
          data: highlights.map((highlight: any, index: number) => ({
            tourId,
            highlight: highlight.highlight,
            icon: highlight.icon || null,
            displayOrder: index + 1
          }))
        })
      }

      // Update inclusions
      if (inclusions.length > 0) {
        await tx.tourInclusion.deleteMany({ where: { tourId } })
        await tx.tourInclusion.createMany({
          data: inclusions.map((inclusion: any, index: number) => ({
            tourId,
            item: inclusion.item,
            category: inclusion.category || 'general',
            displayOrder: index + 1
          }))
        })
      }

      // Update exclusions
      if (exclusions.length > 0) {
        await tx.tourExclusion.deleteMany({ where: { tourId } })
        await tx.tourExclusion.createMany({
          data: exclusions.map((exclusion: any, index: number) => ({
            tourId,
            item: exclusion.item,
            displayOrder: index + 1
          }))
        })
      }

      // Update itineraries
      if (itineraries.length > 0) {
        await tx.tourItinerary.deleteMany({ where: { tourId } })
        await tx.tourItinerary.createMany({
          data: itineraries.map((itinerary: any, index: number) => ({
            tourId,
            day: itinerary.day,
            title: itinerary.title,
            description: itinerary.description,
            location: itinerary.location || null,
            activities: itinerary.activities || null,
            accommodation: itinerary.accommodation || null,
            meals: itinerary.meals || null,
            displayOrder: index + 1
          }))
        })
      }

      return tour
    })

    // Get updated tour with relationships
    const fullTour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        creator: {
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
        }
      }
    })

    const transformedTour = {
      id: fullTour!.id,
      title: fullTour!.title,
      slug: fullTour!.slug,
      description: fullTour!.description,
      shortDescription: fullTour!.shortDescription,
      category: fullTour!.category,
      duration: fullTour!.duration,
      groupSize: fullTour!.groupSize,
      maxGroupSize: fullTour!.maxGroupSize,
      price: fullTour!.price,
      originalPrice: fullTour!.originalPrice,
      difficulty: fullTour!.difficulty,
      locationCountry: fullTour!.locationCountry,
      locationRegion: fullTour!.locationRegion,
      locationCoordinates: fullTour!.locationCoordinatesLat && fullTour!.locationCoordinatesLng ? {
        lat: fullTour!.locationCoordinatesLat,
        lng: fullTour!.locationCoordinatesLng
      } : null,
      featuredImage: fullTour!.featuredImageData ? {
        data: Buffer.from(fullTour!.featuredImageData).toString('base64'),
        name: fullTour!.featuredImageName,
        type: fullTour!.featuredImageType
      } : null,
      status: fullTour!.status,
      featured: fullTour!.featured,
      popular: fullTour!.popular,
      isNew: fullTour!.isNew,
      rating: fullTour!.rating,
      reviewCount: fullTour!.reviewCount,
      viewCount: fullTour!.viewCount,
      bookingCount: fullTour!.bookingCount,
      bestTime: fullTour!.bestTime,
      physicalRequirements: fullTour!.physicalRequirements,
      whatToBring: fullTour!.whatToBring,
      createdBy: fullTour!.creator,
      createdAt: fullTour!.createdAt,
      updatedAt: fullTour!.updatedAt,
      highlights: fullTour!.highlights,
      inclusions: fullTour!.inclusions,
      exclusions: fullTour!.exclusions,
      itineraries: fullTour!.itineraries
    }

    return NextResponse.json({
      tour: transformedTour,
      success: true
    })

  } catch (error) {
    console.error('Error updating tour:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check if the database server is running.',
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
        error: 'An unexpected error occurred while updating tour.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tours/[id] - Delete tour
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tourId = parseInt(params.id)

    // Check if tour exists
    const existingTour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        id: true,
        title: true,
        slug: true,
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    if (!existingTour) {
      return NextResponse.json(
        { error: 'Tour not found', success: false },
        { status: 404 }
      )
    }

    // Check if tour has bookings
    if (existingTour._count.bookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tour with existing bookings. Please cancel all bookings first.', success: false },
        { status: 400 }
      )
    }

    // Delete tour and all related data (cascade delete)
    await prisma.tour.delete({
      where: { id: tourId }
    })

    return NextResponse.json({
      message: `Tour "${existingTour.title}" deleted successfully`,
      success: true
    })

  } catch (error) {
    console.error('Error deleting tour:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check if the database server is running.',
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
        error: 'An unexpected error occurred while deleting tour.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 