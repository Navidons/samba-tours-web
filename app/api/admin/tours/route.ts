import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { Difficulty, TourStatus } from "@prisma/client"

// GET /api/admin/tours - Get all tours with advanced filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const difficulty = searchParams.get('difficulty')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { locationCountry: { contains: search, mode: 'insensitive' } },
        { locationRegion: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (category) {
      where.categoryId = parseInt(category)
    }

    if (status) {
      where.status = status as TourStatus
    }

    if (difficulty) {
      where.difficulty = difficulty as Difficulty
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder
    } else if (sortBy === 'popularity') {
      orderBy.bookingCount = sortOrder
    } else if (sortBy === 'views') {
      orderBy.viewCount = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Get total count
    const total = await prisma.tour.count({ where })

    // Get tours with full relationships
    const tours = await prisma.tour.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
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
        _count: {
          select: {
            bookings: true,
            reviews: true,
            images: true
          }
        }
      }
    })

    // Transform tours for response
    const transformedTours = tours.map(tour => ({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      description: tour.description,
      shortDescription: tour.shortDescription,
      category: tour.category,
      duration: tour.duration,
      groupSize: tour.groupSize,
      maxGroupSize: tour.maxGroupSize,
      price: tour.price,
      originalPrice: tour.originalPrice,
      difficulty: tour.difficulty,
      locationCountry: tour.locationCountry,
      locationRegion: tour.locationRegion,
      locationCoordinates: tour.locationCoordinatesLat && tour.locationCoordinatesLng ? {
        lat: tour.locationCoordinatesLat,
        lng: tour.locationCoordinatesLng
      } : null,
      featuredImage: tour.featuredImageData ? {
        data: Buffer.from(tour.featuredImageData).toString('base64'),
        name: tour.featuredImageName,
        type: tour.featuredImageType
      } : null,
      status: tour.status,
      featured: tour.featured,
      popular: tour.popular,
      isNew: tour.isNew,
      rating: Number(tour.rating),
      reviewCount: tour.reviewCount,
      viewCount: tour.viewCount,
      bookingCount: tour._count.bookings,
      bestTime: tour.bestTime,
      physicalRequirements: tour.physicalRequirements,
      whatToBring: tour.whatToBring,
      createdBy: tour.creator,
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
      images: tour.images.map(img => ({
        id: img.id,
        data: img.imageData ? Buffer.from(img.imageData).toString('base64') : null,
        name: img.imageName,
        type: img.imageType,
        size: img.imageSize,
        altText: img.altText,
        title: img.title,
        description: img.description,
        isFeatured: img.isFeatured,
        displayOrder: img.displayOrder
      })),
      highlights: tour.highlights,
      inclusions: tour.inclusions,
      exclusions: tour.exclusions,
      itineraries: tour.itineraries,
      counts: tour._count
    }))

    return NextResponse.json({
      tours: transformedTours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      success: true
    })

  } catch (error) {
    console.error('Error fetching tours:', error)
    
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
        error: 'An unexpected error occurred while fetching tours.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/tours - Create new tour
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get basic tour data
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
    const createdByRaw = formData.get('createdBy') as string
    const createdBy = createdByRaw && createdByRaw.trim() !== '' ? parseInt(createdByRaw) : null

    // Parse JSON fields
    const bestTime = formData.get('bestTime') ? JSON.parse(formData.get('bestTime') as string) : null
    const whatToBring = formData.get('whatToBring') ? JSON.parse(formData.get('whatToBring') as string) : null

    // Validate required fields
    if (!title || !description || !duration || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, duration, price', success: false },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Check if slug already exists
    const existingTour = await prisma.tour.findUnique({
      where: { slug }
    })

    if (existingTour) {
      return NextResponse.json(
        { error: 'A tour with this title already exists', success: false },
        { status: 400 }
      )
    }

    // Handle featured image
    const featuredImageFile = formData.get('featuredImage') as File | null
    let featuredImageData = null
    let featuredImageName = null
    let featuredImageType = null
    let featuredImageSize = null

    if (featuredImageFile) {
      const buffer = Buffer.from(await featuredImageFile.arrayBuffer())
      featuredImageData = buffer
      featuredImageName = featuredImageFile.name
      featuredImageType = featuredImageFile.type
      featuredImageSize = featuredImageFile.size
    }

    // Create tour
    const tour = await prisma.tour.create({
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
        whatToBring,
        createdBy
      },
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
        }
      }
    })

    // Handle additional tour data (highlights, inclusions, etc.)
    const highlights = formData.get('highlights') ? JSON.parse(formData.get('highlights') as string) : []
    const inclusions = formData.get('inclusions') ? JSON.parse(formData.get('inclusions') as string) : []
    const exclusions = formData.get('exclusions') ? JSON.parse(formData.get('exclusions') as string) : []
    const itineraries = formData.get('itineraries') ? JSON.parse(formData.get('itineraries') as string) : []

    // Create highlights
    if (highlights.length > 0) {
      await prisma.tourHighlight.createMany({
        data: highlights.map((highlight: any, index: number) => ({
          tourId: tour.id,
          highlight: highlight.highlight,
          icon: highlight.icon || null,
          displayOrder: index + 1
        }))
      })
    }

    // Create inclusions
    if (inclusions.length > 0) {
      await prisma.tourInclusion.createMany({
        data: inclusions.map((inclusion: any, index: number) => ({
          tourId: tour.id,
          item: inclusion.item,
          category: inclusion.category || 'general',
          displayOrder: index + 1
        }))
      })
    }

    // Create exclusions
    if (exclusions.length > 0) {
      await prisma.tourExclusion.createMany({
        data: exclusions.map((exclusion: any, index: number) => ({
          tourId: tour.id,
          item: exclusion.item,
          displayOrder: index + 1
        }))
      })
    }

    // Create itineraries
    if (itineraries.length > 0) {
      await prisma.tourItinerary.createMany({
        data: itineraries.map((itinerary: any, index: number) => ({
          tourId: tour.id,
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

    // Handle gallery images
    const galleryImages = (formData as any).getAll('galleryImages')
    if (galleryImages && galleryImages.length > 0) {
      for (let i = 0; i < galleryImages.length; i++) {
        const file = galleryImages[i]
        // Only process if it's a File (not a string)
        if (typeof file === 'object' && file !== null && typeof (file as File).arrayBuffer === 'function') {
          const buffer = Buffer.from(await (file as File).arrayBuffer())
          await prisma.tourImage.create({
            data: {
              tourId: tour.id,
              imageData: buffer,
              imageName: (file as File).name,
              imageType: (file as File).type,
              imageSize: (file as File).size,
              displayOrder: i + 1,
              isFeatured: false,
            }
          })
        }
      }
    }

    // Handle best times
    let bestTimesRaw = (formData as any).get('bestTime')
    let bestTimes: any[] = []
    if (typeof bestTimesRaw === 'string' && bestTimesRaw.trim() !== '') {
      bestTimes = JSON.parse(bestTimesRaw)
    }
    if (Array.isArray(bestTimes) && bestTimes.length > 0) {
      for (let i = 0; i < bestTimes.length; i++) {
        const item = bestTimes[i]
        await prisma.tourBestTime.create({
          data: {
            tourId: tour.id,
            bestTimeItem: item.item,
            description: item.description || null,
            displayOrder: i + 1,
          }
        })
      }
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
      price: tour.price,
      originalPrice: tour.originalPrice,
      difficulty: tour.difficulty,
      locationCountry: tour.locationCountry,
      locationRegion: tour.locationRegion,
      locationCoordinates: tour.locationCoordinatesLat && tour.locationCoordinatesLng ? {
        lat: tour.locationCoordinatesLat,
        lng: tour.locationCoordinatesLng
      } : null,
      featuredImage: tour.featuredImageData ? {
        data: Buffer.from(tour.featuredImageData).toString('base64'),
        name: tour.featuredImageName,
        type: tour.featuredImageType
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
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt
    }

    return NextResponse.json({
      tour: transformedTour,
      success: true
    })

  } catch (error) {
    console.error('Error creating tour:', error)
    
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
        error: 'An unexpected error occurred while creating tour.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}
