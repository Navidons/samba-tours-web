import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export const dynamic = 'force-dynamic'

// GET /api/gallery - Get all galleries with their images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const pageSize = 20

    // Build where clause for filtering
    const whereClause: any = {}
    
    if (category) {
      whereClause.category = {
        slug: category
      }
    }
    
    if (location) {
      whereClause.location = {
        slug: location
      }
    }
    
    if (featured === 'true') {
      whereClause.featured = true
    }

    // Get galleries with images
    const galleries = await prisma.gallery.findMany({
      include: {
        images: {
          include: {
            category: true,
            location: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        },
        videos: {
          include: {
            category: true,
            location: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: limit ? (page - 1) * pageSize : undefined
    })

    // Get total count for pagination
    const total = await prisma.gallery.count()

    // Transform data for response - handle empty results gracefully
    const transformedGalleries = galleries.map(gallery => ({
      id: gallery.id,
      name: gallery.name,
      slug: gallery.slug,
      description: gallery.description,
      featured: gallery.featured,
      thumbnail: gallery.thumbnailData ? {
        data: gallery.thumbnailData.toString('base64'),
        name: gallery.thumbnailName,
        type: gallery.thumbnailType
      } : null,
      imageCount: gallery.imageCount,
      videoCount: gallery.videoCount,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
      images: gallery.images.map(image => ({
        id: image.id,
        imageData: image.imageData.toString('base64'),
        imageName: image.imageName,
        imageType: image.imageType,
        alt: image.alt,
        title: image.title,
        description: image.description,
        photographer: image.photographer,
        date: image.date,
        featured: image.featured,
        category: image.category,
        location: image.location,
        likes: image.likes,
        views: image.views,
        displayOrder: image.displayOrder,
        createdAt: image.createdAt
      })),
      videos: gallery.videos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        duration: video.duration,
        featured: video.featured,
        category: video.category,
        location: video.location,
        likes: video.likes,
        views: video.views,
        displayOrder: video.displayOrder,
        createdAt: video.createdAt,
        thumbnail: video.thumbnailData ? {
          data: video.thumbnailData.toString('base64'),
          name: video.thumbnailName,
          type: video.thumbnailType
        } : null
      }))
    }))

    return NextResponse.json({
      galleries: transformedGalleries,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      },
      success: true
    })

  } catch (error) {
    console.error('Error fetching galleries:', error)
    
    // Handle specific database connection errors
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check if the database server is running.',
          type: 'CONNECTION_ERROR',
          success: false
        },
        { status: 503 } // Service Unavailable
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
    
    // Generic error
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while fetching galleries.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 
