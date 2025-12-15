import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/blog/thumbnails/[id] - Stream blog post thumbnail
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const postId = parseInt(id)
    if (Number.isNaN(postId)) {
      return new NextResponse("Invalid id", { status: 400 })
    }

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: {
        thumbnailData: true,
        thumbnailType: true,
        thumbnailName: true,
        updatedAt: true,
      },
    })

    // 1x1 transparent PNG fallback
    const transparentPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    )

    if (!post || !post.thumbnailData) {
      return new NextResponse(transparentPng, {
        headers: {
          "Content-Type": "image/png",
          "Content-Length": transparentPng.length.toString(),
          // Public cache 1h; tweak as needed
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      })
    }

    const buffer = Buffer.from(post.thumbnailData)
    const contentType = post.thumbnailType || "image/jpeg"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `inline; filename="${post.thumbnailName || "thumbnail"}"`,
        // Public cache 1h with SWR; include a weak etag for CDN reuse
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "ETag": `W/\"${buffer.length}-${post.updatedAt.getTime()}\"`,
      },
    })
  } catch (error) {
    // On error, return a tiny transparent image to avoid layout shifts
    const fallback = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    )
    return new NextResponse(fallback, {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": fallback.length.toString(),
        "Cache-Control": "public, max-age=300",
      },
      status: 200,
    })
  }
}


