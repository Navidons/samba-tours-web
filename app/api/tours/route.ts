import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { Difficulty, TourStatus } from "@prisma/client"

// GET /api/tours - Get tours for public access
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const popular = searchParams.get('popular')
    const category = searchParams.get('category')
    const categories = searchParams.getAll('categories')
    const difficulty = searchParams.get('difficulty')
    const difficulties = searchParams.getAll('difficulties')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const duration = searchParams.get('duration')
    const durations = searchParams.getAll('durations')
    const destination = searchParams.get('destination')
    const destinations = searchParams.getAll('destinations')
    const sortBy = searchParams.get('sortBy') || 'popular'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const exclude = searchParams.get('exclude')

    // Build where clause - only show active tours
    const where: any = {
      status: 'active'
    }
    
    if (search) {
      const searchTerm = search.toLowerCase()
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { shortDescription: { contains: searchTerm } },
        { locationCountry: { contains: searchTerm } },
        { locationRegion: { contains: searchTerm } }
      ]
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (popular === 'true') {
      where.popular = true
    }

    if (category) {
      where.categoryId = parseInt(category)
    }

    if (categories.length > 0) {
      // Handle both category IDs and slugs
      const categoryIds = categories
        .map(cat => parseInt(cat))
        .filter(id => !isNaN(id))
      
      if (categoryIds.length > 0) {
        where.categoryId = { in: categoryIds }
      } else {
        // If no valid IDs, try to find by slug
        const categorySlugs = categories.filter(cat => isNaN(parseInt(cat)))
        if (categorySlugs.length > 0) {
          where.category = {
            slug: { in: categorySlugs }
          }
        }
      }
    }

    if (difficulty) {
      where.difficulty = difficulty as Difficulty
    }

    if (difficulties.length > 0) {
      where.difficulty = { in: difficulties as Difficulty[] }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (duration) {
      where.duration = { contains: duration.toLowerCase() }
    }

    if (durations.length > 0) {
      where.OR = durations.map(dur => ({
        duration: { contains: dur.toLowerCase() }
      }))
    }

    if (destination) {
      const destTerm = destination.toLowerCase()
      where.OR = [
        { locationCountry: { contains: destTerm } },
        { locationRegion: { contains: destTerm } }
      ]
    }

    if (destinations.length > 0) {
      where.OR = destinations.flatMap(dest => [
        { locationCountry: { contains: dest.toLowerCase() } },
        { locationRegion: { contains: dest.toLowerCase() } }
      ])
    }

    // Exclude specific tour IDs
    if (exclude) {
      const excludeIds = exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      if (excludeIds.length > 0) {
        where.NOT = {
          id: { in: excludeIds }
        }
      }
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'price_low') {
      orderBy.price = 'asc'
    } else if (sortBy === 'price_high') {
      orderBy.price = 'desc'
    } else if (sortBy === 'rating') {
      orderBy.rating = 'desc'
    } else if (sortBy === 'newest') {
      orderBy.createdAt = 'desc'
    } else if (sortBy === 'alphabetical') {
      orderBy.title = 'asc'
    } else if (sortBy === 'duration') {
      orderBy.duration = 'asc'
    } else { // popular (default)
      orderBy.bookingCount = 'desc'
    }

    // Get total count
    const total = await prisma.tour.count({ where })

    // Get tours with essential data
    const tours = await prisma.tour.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        duration: true,
        groupSize: true,
        maxGroupSize: true,
        price: true,
        originalPrice: true,
        difficulty: true,
        locationCountry: true,
        locationRegion: true,
        locationCoordinatesLat: true,
        locationCoordinatesLng: true,
        featuredImageData: true,
        featuredImageName: true,
        featuredImageType: true,
        featured: true,
        popular: true,
        isNew: true,
        rating: true,
        reviewCount: true,
        viewCount: true,
        bookingCount: true,
        bestTime: true,
        physicalRequirements: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
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
          },
          take: 5
        },
        inclusions: {
          select: {
            id: true,
            item: true,
            category: true
          },
          orderBy: {
            displayOrder: 'asc'
          },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
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
      featured: tour.featured,
      popular: tour.popular,
      isNew: tour.isNew,
      rating: parseFloat(tour.rating.toString()),
      reviewCount: tour.reviewCount,
      viewCount: tour.viewCount,
      bookingCount: tour.bookingCount,
      bestTime: tour.bestTime,
      physicalRequirements: tour.physicalRequirements,
      highlights: tour.highlights,
      inclusions: tour.inclusions,
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
      stats: {
        totalReviews: tour._count.reviews,
        totalBookings: tour._count.bookings
      }
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
        error: 'An unexpected error occurred while fetching tours.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// GET /api/tours/featured - Get featured tours
export async function HEAD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    const tours = await prisma.tour.findMany({
      where: {
        status: 'active',
        featured: true
      },
      orderBy: {
        bookingCount: 'desc'
      },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        price: true,
        originalPrice: true,
        difficulty: true,
        locationCountry: true,
        locationRegion: true,
        featuredImageData: true,
        featuredImageName: true,
        featuredImageType: true,
        rating: true,
        reviewCount: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    const transformedTours = tours.map(tour => ({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      shortDescription: tour.shortDescription,
      price: parseFloat(tour.price.toString()),
      originalPrice: tour.originalPrice ? parseFloat(tour.originalPrice.toString()) : null,
      difficulty: tour.difficulty,
      location: {
        country: tour.locationCountry,
        region: tour.locationRegion
      },
      featuredImage: tour.featuredImageData ? {
        data: `data:${tour.featuredImageType};base64,${Buffer.from(tour.featuredImageData).toString('base64')}`,
        name: tour.featuredImageName,
        type: tour.featuredImageType
      } : null,
      rating: parseFloat(tour.rating.toString()),
      reviewCount: tour.reviewCount,
      category: tour.category
    }))

    return NextResponse.json({
      tours: transformedTours,
      success: true
    })

  } catch (error) {
    console.error('Error fetching featured tours:', error)
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while fetching featured tours.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// GET /api/tours/categories - Get tour categories
export async function OPTIONS(request: NextRequest) {
  try {
    const categories = await prisma.tourCategory.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        displayOrder: true,
        _count: {
          select: {
            tours: {
              where: {
                status: 'active'
              }
            }
          }
        }
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })

    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      displayOrder: category.displayOrder,
      tourCount: category._count.tours
    }))

    return NextResponse.json({
      categories: transformedCategories,
      success: true
    })

  } catch (error) {
    console.error('Error fetching tour categories:', error)
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while fetching categories.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// GET /api/tours/search - Advanced search with filters
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      query,
      categories,
      difficulties,
      priceRange,
      durations,
      destinations,
      sortBy,
      page = 1,
      limit = 12
    } = body

    // Build advanced search query
    const where: any = {
      status: 'active'
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { shortDescription: { contains: query, mode: 'insensitive' } },
        { locationCountry: { contains: query, mode: 'insensitive' } },
        { locationRegion: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (categories && categories.length > 0) {
      where.categoryId = { in: categories.map((cat: string) => parseInt(cat)) }
    }

    if (difficulties && difficulties.length > 0) {
      where.difficulty = { in: difficulties as Difficulty[] }
    }

    if (priceRange) {
      where.price = {}
      if (priceRange.min) where.price.gte = priceRange.min
      if (priceRange.max) where.price.lte = priceRange.max
    }

    if (durations && durations.length > 0) {
      where.OR = durations.map((dur: string) => ({
        duration: { contains: dur, mode: 'insensitive' }
      }))
    }

    if (destinations && destinations.length > 0) {
      where.OR = destinations.flatMap((dest: string) => [
        { locationCountry: { contains: dest, mode: 'insensitive' } },
        { locationRegion: { contains: dest, mode: 'insensitive' } }
      ])
    }

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'price_low') {
      orderBy.price = 'asc'
    } else if (sortBy === 'price_high') {
      orderBy.price = 'desc'
    } else if (sortBy === 'rating') {
      orderBy.rating = 'desc'
    } else if (sortBy === 'newest') {
      orderBy.createdAt = 'desc'
    } else {
      orderBy.bookingCount = 'desc'
    }

    const total = await prisma.tour.count({ where })

    const tours = await prisma.tour.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        price: true,
        originalPrice: true,
        difficulty: true,
        locationCountry: true,
        locationRegion: true,
        featuredImageData: true,
        featuredImageName: true,
        featuredImageType: true,
        rating: true,
        reviewCount: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        highlights: {
          select: {
            highlight: true,
            icon: true
          },
          orderBy: {
            displayOrder: 'asc'
          },
          take: 3
        }
      }
    })

    const transformedTours = tours.map(tour => ({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      shortDescription: tour.shortDescription,
      price: parseFloat(tour.price.toString()),
      originalPrice: tour.originalPrice ? parseFloat(tour.originalPrice.toString()) : null,
      difficulty: tour.difficulty,
      location: {
        country: tour.locationCountry,
        region: tour.locationRegion
      },
      featuredImage: tour.featuredImageData ? {
        data: `data:${tour.featuredImageType};base64,${tour.featuredImageData.toString('base64')}`,
        name: tour.featuredImageName,
        type: tour.featuredImageType
      } : null,
      rating: parseFloat(tour.rating.toString()),
      reviewCount: tour.reviewCount,
      category: tour.category,
      highlights: tour.highlights
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
    console.error('Error searching tours:', error)
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while searching tours.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const tourData = await request.json()

    // Validate required fields
    if (!tourData.title || !tourData.description || !tourData.price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const tour = await prisma.tour.create({
      data: {
        title: tourData.title,
        description: tourData.description,
        shortDescription: tourData.shortDescription,
        price: tourData.price,
        originalPrice: tourData.originalPrice,
        duration: tourData.duration,
        groupSize: tourData.groupSize,
        locationCountry: tourData.locationCountry || "Uganda",
        locationRegion: tourData.locationRegion,
        categoryId: tourData.categoryId,
        difficulty: tourData.difficulty,
        featured: tourData.featured || false,
        status: tourData.status || 'active',
        slug: tourData.slug || tourData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      },
      include: {
        images: true,
        category: true
      }
    })
    
    return NextResponse.json({ success: true, tour })
  } catch (error) {
    console.error("Error creating tour:", error)
    return NextResponse.json({ error: "Failed to create tour" }, { status: 500 })
  }
}
