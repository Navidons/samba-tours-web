import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { extractVideoInfo, getYouTubeThumbnailUrl } from "@/lib/utils/video-utils"

// GET /api/admin/gallery/videos - Get videos from gallery
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const galleryId = searchParams.get('galleryId')
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const search = searchParams.get('search')

    if (!galleryId) {
      return NextResponse.json(
        { error: 'Gallery ID is required' },
        { status: 400 }
      )
    }

    // Build where clause
    const whereClause: any = {
      galleryId: parseInt(galleryId)
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { videoUrl: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get videos
    const videos = await prisma.galleryVideo.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    })

    // Get total count
    const total = await prisma.galleryVideo.count({
      where: whereClause
    })

    // Transform videos to include base64 data
    const transformedVideos = videos.map(video => ({
      id: video.id,
      type: 'video' as const,
      title: video.title,
      description: video.description,
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
    }))

    return NextResponse.json({
      videos: transformedVideos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

// POST /api/admin/gallery/videos - Add video to gallery
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const galleryId = parseInt(formData.get('galleryId') as string)
    const videoUrl = formData.get('videoUrl') as string
    const videoProvider = formData.get('videoProvider') as string || 'youtube'
    const title = formData.get('title') as string || null
    const description = formData.get('description') as string || null
    const duration = formData.get('duration') as string || null
    const thumbnailFile = formData.get('thumbnail') as File | null

    if (!galleryId) {
      return NextResponse.json(
        { error: 'Gallery ID is required' },
        { status: 400 }
      )
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      )
    }

    // Check if gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId }
    })

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery not found' },
        { status: 404 }
      )
    }

    // Extract video info from URL
    const videoInfo = extractVideoInfo(videoUrl)
    
    // Process thumbnail - either from uploaded file or fetch from YouTube
    let thumbnailData = null
    let thumbnailName = null
    let thumbnailType = null

    if (thumbnailFile) {
      // Use uploaded thumbnail
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer())
      thumbnailData = buffer
      thumbnailName = thumbnailFile.name
      thumbnailType = thumbnailFile.type
    } else if (videoInfo.provider === 'youtube' && videoInfo.videoId) {
      // Fetch thumbnail from YouTube
      try {
        const thumbnailUrl = getYouTubeThumbnailUrl(videoInfo.videoId, 'maxres')
        const thumbnailResponse = await fetch(thumbnailUrl)
        
        if (thumbnailResponse.ok) {
          const thumbnailBuffer = await thumbnailResponse.arrayBuffer()
          thumbnailData = Buffer.from(thumbnailBuffer)
          thumbnailName = `youtube_${videoInfo.videoId}_thumbnail.jpg`
          thumbnailType = 'image/jpeg'
        } else {
          // Fallback to medium quality thumbnail
          const fallbackUrl = getYouTubeThumbnailUrl(videoInfo.videoId, 'medium')
          const fallbackResponse = await fetch(fallbackUrl)
          
          if (fallbackResponse.ok) {
            const thumbnailBuffer = await fallbackResponse.arrayBuffer()
            thumbnailData = Buffer.from(thumbnailBuffer)
            thumbnailName = `youtube_${videoInfo.videoId}_thumbnail.jpg`
            thumbnailType = 'image/jpeg'
          }
        }
      } catch (error) {
        console.error('Failed to fetch YouTube thumbnail:', error)
        // Continue without thumbnail
      }
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

    const durationInSeconds = parseDurationToSeconds(duration)

    // Create video record
    const video = await prisma.galleryVideo.create({
      data: {
        galleryId,
        videoUrl,
        videoProvider: videoInfo.provider,
        videoId: videoInfo.videoId,
        title: title,
        description: description,
        duration: durationInSeconds,
        thumbnailData,
        thumbnailName,
        thumbnailType
      },
      include: {
        gallery: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Update gallery video count
    await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        videoCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        videoProvider: video.videoProvider,
        videoId: video.videoId,
        thumbnailData: thumbnailData ? Buffer.from(thumbnailData).toString('base64') : null,
        thumbnailName: video.thumbnailName,
        thumbnailType: video.thumbnailType,
        duration: video.duration,
        featured: video.featured,
        views: video.views,
        createdAt: video.createdAt,
        gallery: video.gallery
      },
      message: 'Video added successfully'
    })

  } catch (error) {
    console.error('Error adding video:', error)
    
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
