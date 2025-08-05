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
      select: {
        id: true,
        title: true,
        videoUrl: true,
        videoProvider: true,
        videoId: true,
        thumbnailData: true,
        thumbnailName: true,
        thumbnailType: true,
        duration: true,
        featured: true,
        views: true,
        createdAt: true,
        gallery: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    const transformedVideo = {
      id: video.id,
      title: video.title,
      videoUrl: video.videoUrl,
      videoProvider: video.videoProvider,
      videoId: video.videoId,
      thumbnailData: video.thumbnailData ? Buffer.from(video.thumbnailData).toString('base64') : null,
      thumbnailName: video.thumbnailName,
      thumbnailType: video.thumbnailType,
      duration: video.duration,
      featured: video.featured,
      views: video.views,
      createdAt: video.createdAt,
      gallery: video.gallery
    }

    return NextResponse.json({ video: transformedVideo })

  } catch (error) {
    console.error('Error fetching video:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Database connection failed', type: 'CONNECTION_ERROR' },
        { status: 503 }
      )
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database operation failed', type: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/gallery/videos/[id] - Update video
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id)
    const formData = await request.formData()

    const title = formData.get('title') as string
    const duration = formData.get('duration') as string
    const featured = formData.get('featured') === 'true'
    const views = formData.get('views') ? parseInt(formData.get('views') as string) : 0
    const removeThumbnail = formData.get('removeThumbnail') === 'true'
    const thumbnailFile = formData.get('thumbnail')

    // Check if video exists
    const existingVideo = await prisma.galleryVideo.findUnique({
      where: { id: videoId }
    })

    if (!existingVideo) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Helper function to convert MM:SS duration to seconds
    const parseDuration = (durationStr: string | null): number | null => {
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

    // Process thumbnail
    let thumbnailData = existingVideo.thumbnailData
    let thumbnailName = existingVideo.thumbnailName
    let thumbnailType = existingVideo.thumbnailType

    if (removeThumbnail) {
      thumbnailData = null
      thumbnailName = null
      thumbnailType = null
    } else if (thumbnailFile && thumbnailFile instanceof Blob) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer())
      thumbnailData = buffer
      thumbnailName = (thumbnailFile as any).name
      thumbnailType = thumbnailFile.type
    }

    const durationInSeconds = parseDuration(duration)

    // Update video
    const updatedVideo = await prisma.galleryVideo.update({
      where: { id: videoId },
      data: {
        title: title || null,
        duration: durationInSeconds,
        featured,
        views,
        thumbnailData,
        thumbnailName,
        thumbnailType
      },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        videoProvider: true,
        videoId: true,
        thumbnailData: true,
        thumbnailName: true,
        thumbnailType: true,
        duration: true,
        featured: true,
        views: true,
        createdAt: true,
        gallery: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      video: {
        id: updatedVideo.id,
        title: updatedVideo.title,
        videoUrl: updatedVideo.videoUrl,
        videoProvider: updatedVideo.videoProvider,
        videoId: updatedVideo.videoId,
        thumbnailData: updatedVideo.thumbnailData ? Buffer.from(updatedVideo.thumbnailData).toString('base64') : null,
        thumbnailName: updatedVideo.thumbnailName,
        thumbnailType: updatedVideo.thumbnailType,
        duration: updatedVideo.duration,
        featured: updatedVideo.featured,
        views: updatedVideo.views,
        createdAt: updatedVideo.createdAt,
        gallery: updatedVideo.gallery
      }
    })

  } catch (error) {
    console.error('Error updating video:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Database connection failed', type: 'CONNECTION_ERROR' },
        { status: 503 }
      )
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database operation failed', type: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Check if video exists and get gallery info
    const video = await prisma.galleryVideo.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        galleryId: true
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Delete video
    await prisma.galleryVideo.delete({
      where: { id: videoId }
    })

    // Update gallery video count if video belongs to a gallery
    if (video.galleryId) {
      await prisma.gallery.update({
        where: { id: video.galleryId },
        data: {
          videoCount: {
            decrement: 1
          }
        }
      })
    }

    return NextResponse.json({
      message: 'Video deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting video:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Database connection failed', type: 'CONNECTION_ERROR' },
        { status: 503 }
      )
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database operation failed', type: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 