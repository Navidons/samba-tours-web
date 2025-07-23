import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// GET /api/admin/gallery/videos - Get all videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const galleryId = searchParams.get('galleryId')
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const featured = searchParams.get('featured')

    // Build where clause
    const whereClause: any = {}
    
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
        category: true,
        location: true
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: (page - 1) * limit
    })

    const total = await prisma.galleryVideo.count({
      where: whereClause
    })

    const transformedVideos = videos.map(video => ({
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
      thumbnail: video.thumbnailData ? {
        data: video.thumbnailData.toString('base64'),
        name: video.thumbnailName,
        type: video.thumbnailType
      } : null,
      videoUrl: `/api/admin/gallery/videos/${video.id}/stream`
    }))

    return NextResponse.json({
      videos: transformedVideos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      success: true
    })

  } catch (error) {
    console.error('Error fetching videos:', error)
    
    // Handle specific database connection errors
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
        error: 'An unexpected error occurred while fetching videos.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/gallery/videos - Upload single video
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const galleryId = parseInt(formData.get('galleryId') as string)
    const videoFile = formData.get('video') as File
    const thumbnailFile = formData.get('thumbnail') as File | null
    
    if (!galleryId) {
      return NextResponse.json(
        { error: 'Gallery ID is required', success: false },
        { status: 400 }
      )
    }

    if (!videoFile) {
      return NextResponse.json(
        { error: 'Video file is required', success: false },
        { status: 400 }
      )
    }

    // Check if gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId }
    })

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery not found', success: false },
        { status: 404 }
      )
    }

    // Helper function to convert MM:SS duration to seconds
    const parseDurationToSeconds = (durationStr: string | null): number | null => {
      if (!durationStr) return null
      
      // If it's already a number (seconds), return it
      if (/^\d+$/.test(durationStr)) {
        return parseInt(durationStr)
      }
      
      // Parse MM:SS format
      const parts = durationStr.split(':')
      if (parts.length === 2) {
        const minutes = parseInt(parts[0]) || 0
        const seconds = parseInt(parts[1]) || 0
        return minutes * 60 + seconds
      }
      
      // Parse HH:MM:SS format
      if (parts.length === 3) {
        const hours = parseInt(parts[0]) || 0
        const minutes = parseInt(parts[1]) || 0
        const seconds = parseInt(parts[2]) || 0
        return hours * 3600 + minutes * 60 + seconds
      }
      
      return null
    }

    // Get metadata
    const title = formData.get('title') as string || videoFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
    const description = formData.get('description') as string || null
    const durationRaw = formData.get('duration') as string || null
    const duration = parseDurationToSeconds(durationRaw)
    const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null
    const locationId = formData.get('locationId') ? parseInt(formData.get('locationId') as string) : null
    const photographer = formData.get('photographer') as string || null
    const featured = formData.get('featured') === 'true'

    // Process video
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer())

    // Process thumbnail if provided
    let thumbnailData = null
    let thumbnailName = null
    let thumbnailType = null
    let thumbnailSize = null

    if (thumbnailFile) {
      const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer())
      thumbnailData = thumbnailBuffer
      thumbnailName = thumbnailFile.name
      thumbnailType = thumbnailFile.type
      thumbnailSize = thumbnailFile.size
    }

    // Get next display order
    const maxOrder = await prisma.galleryVideo.findFirst({
      where: { galleryId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true }
    })

    const displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0

    // Create video record
    const video = await prisma.galleryVideo.create({
      data: {
        gallery: {
          connect: { id: galleryId }
        },
        videoData: videoBuffer,
        videoName: videoFile.name,
        videoType: videoFile.type,
        videoSize: videoFile.size,
        title,
        description,
        duration,
        photographer,
        featured,
        ...(categoryId && {
          category: {
            connect: { id: categoryId }
          }
        }),
        ...(locationId && {
          location: {
            connect: { id: locationId }
          }
        }),
        displayOrder,
        thumbnailData,
        thumbnailName,
        thumbnailType,
        thumbnailSize
      },
      include: {
        category: true,
        location: true,
        gallery: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // Update gallery video count
    const videoCount = await prisma.galleryVideo.count({
      where: { 
        gallery: {
          id: galleryId
        }
      }
    })

    await prisma.gallery.update({
      where: { id: galleryId },
      data: { videoCount }
    })

    const transformedVideo = {
      id: video.id,
      galleryId: video.gallery?.id || galleryId,
      gallery: video.gallery,
      title: video.title,
      description: video.description,
      duration: video.duration,
      videoName: video.videoName,
      videoType: video.videoType,
      videoSize: video.videoSize,
      photographer: video.photographer,
      featured: video.featured,
      category: video.category,
      location: video.location,
      likes: video.likes,
      views: video.views,
      displayOrder: video.displayOrder,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      thumbnail: thumbnailData ? {
        data: Buffer.from(thumbnailData).toString('base64'),
        name: thumbnailName,
        type: thumbnailType
      } : null,
      videoUrl: `/api/admin/gallery/videos/${video.id}/stream`
    }

    return NextResponse.json({
      message: 'Video uploaded successfully',
      video: transformedVideo,
      success: true
    })

  } catch (error) {
    console.error('Error uploading video:', error)
    
    // Handle specific database connection errors
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
        error: 'An unexpected error occurred while uploading video.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 
