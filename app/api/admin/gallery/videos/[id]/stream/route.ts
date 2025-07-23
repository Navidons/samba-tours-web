import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/gallery/videos/[id]/stream - Stream video
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = parseInt(params.id)

    const video = await prisma.galleryVideo.findUnique({
      where: { id: videoId },
      select: {
        videoData: true,
        videoType: true,
        videoName: true,
        videoSize: true
      }
    })

    if (!video || !video.videoData) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Update view count
    await prisma.galleryVideo.update({
      where: { id: videoId },
      data: {
        views: {
          increment: 1
        }
      }
    })

    // Handle range requests for video streaming
    const range = request.headers.get('range')
    const videoBuffer = video.videoData
    const videoSize = videoBuffer.length

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1
      const chunksize = (end - start) + 1
      const chunk = videoBuffer.slice(start, end + 1)

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${videoSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': video.videoType || 'video/mp4',
          'Cache-Control': 'public, max-age=31536000',
        }
      })
    }

    // Return entire video if no range requested
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': video.videoType || 'video/mp4',
        'Content-Length': videoSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': `inline; filename="${video.videoName}"`,
      }
    })

  } catch (error) {
    console.error('Error streaming video:', error)
    return NextResponse.json(
      { error: 'Failed to stream video' },
      { status: 500 }
    )
  }
} 