import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// GET /api/admin/gallery/videos/[id] - Get specific video
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id)

    const video = await prisma.galleryVideo.findUnique({
      where: { id: videoId },
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
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found', success: false },
        { status: 404 }
      )
    }

    const transformedVideo = {
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
    }

    return NextResponse.json({ video: transformedVideo, success: true })

  } catch (error) {
    console.error('Error fetching video:', error)
    
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
        error: 'An unexpected error occurred while fetching video.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/gallery/videos/[id] - Update video metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id)
    const formData = await request.formData()

    // Check if video exists
    const existingVideo = await prisma.galleryVideo.findUnique({
      where: { id: videoId }
    })

    if (!existingVideo) {
      return NextResponse.json(
        { error: 'Video not found', success: false },
        { status: 404 }
      )
    }

    // Helper function to parse duration
    const parseDuration = (duration: string | null): number | null => {
      if (!duration) return null;
      if (duration.includes(':')) {
        const [minutes, seconds] = duration.split(':').map(Number);
        return minutes * 60 + seconds;
      }
      return parseInt(duration, 10);
    };

    // Get update data
    const title = formData.get('title') as string
    const description = formData.get('description') as string || null
    const durationInput = formData.get('duration') as string || null
    const duration = parseDuration(durationInput)
    const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null
    const locationId = formData.get('locationId') ? parseInt(formData.get('locationId') as string) : null
    const photographer = formData.get('photographer') as string || null
    const featured = formData.get('featured') === 'true'
    const displayOrder = formData.get('displayOrder') ? parseInt(formData.get('displayOrder') as string) : existingVideo.displayOrder
    const likes = formData.get('likes') ? parseInt(formData.get('likes') as string) : null
    const views = formData.get('views') ? parseInt(formData.get('views') as string) : null

    // Handle thumbnail update
    const thumbnailFile = formData.get('thumbnail') as File | null
    const removeThumbnail = formData.get('removeThumbnail') === 'true'

    let thumbnailData = existingVideo.thumbnailData
    let thumbnailName = existingVideo.thumbnailName
    let thumbnailType = existingVideo.thumbnailType
    let thumbnailSize = existingVideo.thumbnailSize

    if (removeThumbnail) {
      thumbnailData = null
      thumbnailName = null
      thumbnailType = null
      thumbnailSize = null
    } else if (thumbnailFile) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer())
      thumbnailData = buffer
      thumbnailName = thumbnailFile.name
      thumbnailType = thumbnailFile.type
      thumbnailSize = thumbnailFile.size
    }

    // Update video
    const updatedVideo = await prisma.galleryVideo.update({
      where: { id: videoId },
      data: {
        title,
        description,
        duration,
        categoryId,
        locationId,
        photographer,
        featured,
        displayOrder,
        thumbnailData,
        thumbnailName,
        thumbnailType,
        thumbnailSize,
        likes: likes !== null ? likes : existingVideo.likes,
        views: views !== null ? views : existingVideo.views
      },
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
      }
    })

    const transformedVideo = {
      id: updatedVideo.id,
      galleryId: updatedVideo.galleryId,
      gallery: updatedVideo.gallery,
      title: updatedVideo.title,
      description: updatedVideo.description,
      duration: updatedVideo.duration,
      videoName: updatedVideo.videoName,
      videoType: updatedVideo.videoType,
      videoSize: updatedVideo.videoSize,
      photographer: updatedVideo.photographer,
      featured: updatedVideo.featured,
      category: updatedVideo.category,
      location: updatedVideo.location,
      likes: updatedVideo.likes,
      views: updatedVideo.views,
      displayOrder: updatedVideo.displayOrder,
      createdAt: updatedVideo.createdAt,
      updatedAt: updatedVideo.updatedAt,
      thumbnail: thumbnailData ? {
        data: thumbnailData.toString('base64'),
        name: thumbnailName,
        type: thumbnailType
      } : null,
      videoUrl: `/api/admin/gallery/videos/${updatedVideo.id}/stream`
    }

    return NextResponse.json({
      video: transformedVideo,
      success: true
    })

  } catch (error) {
    console.error('Error updating video:', error)
    
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
        error: 'An unexpected error occurred while updating video.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/gallery/videos/[id] - Delete video
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id)

    // Check if video exists
    const existingVideo = await prisma.galleryVideo.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        galleryId: true,
        title: true
      }
    })

    if (!existingVideo) {
      return NextResponse.json(
        { error: 'Video not found', success: false },
        { status: 404 }
      )
    }

    // Delete video
    await prisma.galleryVideo.delete({
      where: { id: videoId }
    })

    // Update gallery video count
    const videoCount = await prisma.galleryVideo.count({
      where: { galleryId: existingVideo.galleryId }
    })

    await prisma.gallery.update({
      where: { id: existingVideo.galleryId },
      data: { videoCount }
    })

    return NextResponse.json({
      message: `Video "${existingVideo.title}" deleted successfully`,
      success: true
    })

  } catch (error) {
    console.error('Error deleting video:', error)
    
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
        error: 'An unexpected error occurred while deleting video.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 