import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export const dynamic = 'force-dynamic'

// GET /api/gallery/videos - Get all videos for client gallery
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const featured = searchParams.get('featured')
    const galleryId = searchParams.get('galleryId')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const pageSize = limit

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
    
    if (galleryId) {
      whereClause.galleryId = parseInt(galleryId)
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { videoName: { contains: search, mode: 'insensitive' } },
        { photographer: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get videos with related data
    const videos = await prisma.galleryVideo.findMany({
      where: whereClause,
      include: {
        gallery: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        location: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            region: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: pageSize,
      skip: (page - 1) * pageSize
    })

    // Get total count for pagination
    const total = await prisma.galleryVideo.count({
      where: whereClause
    })

    // Transform data for response - handle empty results gracefully
    const transformedVideos = videos.map(video => {
      let thumbnailObj = null
      
      if (video.thumbnailData) {
        try {
          // Handle different data formats that might be returned from database
          let buffer: Buffer
          
          if (Buffer.isBuffer(video.thumbnailData)) {
            // Data is already a Buffer
            buffer = video.thumbnailData
          } else if (typeof video.thumbnailData === 'string') {
            // Data might be a string - try to parse as JSON array or base64
            try {
              const parsed = JSON.parse(video.thumbnailData)
              if (Array.isArray(parsed)) {
                // Data is JSON array of bytes
                buffer = Buffer.from(parsed)
              } else {
                // Data might be base64 string
                buffer = Buffer.from(video.thumbnailData, 'base64')
              }
            } catch {
              // If parsing fails, treat as base64 string
              buffer = Buffer.from(video.thumbnailData, 'base64')
            }
          } else if (Array.isArray(video.thumbnailData)) {
            // Data is array of bytes
            buffer = Buffer.from(video.thumbnailData)
          } else {
            // Unknown format, try to convert to buffer
            buffer = Buffer.from(video.thumbnailData)
          }
          
          thumbnailObj = {
            data: buffer.toString('base64'),
            name: video.thumbnailName,
            type: video.thumbnailType
          }
        } catch (error) {
          console.error('Error converting video thumbnail data:', error)
          thumbnailObj = null
        }
      }
      
      return {
        id: video.id,
        galleryId: video.galleryId,
        gallery: video.gallery,
        title: video.title,
        description: video.description,
        duration: video.duration,
        videoName: video.videoName,
        videoType: video.videoType,
        videoSize: video.videoSize,
        photographer: video.photographer,
        date: video.date,
        featured: video.featured,
        category: video.category,
        location: video.location,
        likes: video.likes,
        views: video.views,
        displayOrder: video.displayOrder,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        thumbnail: thumbnailObj,
        videoUrl: `/api/gallery/videos/${video.id}/stream`
      }
    })

    return NextResponse.json({
      videos: transformedVideos,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      },
      success: true
    })

  } catch (error) {
    console.error('Error fetching gallery videos:', error)
    
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
        error: 'An unexpected error occurred while fetching gallery videos.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 
