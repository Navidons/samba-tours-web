import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/tours/thumbnails/[id] - Stream tour featured image
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tourId = parseInt(params.id)
    if (Number.isNaN(tourId)) {
      return new NextResponse("Invalid id", { status: 400 })
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        featuredImageData: true,
        featuredImageType: true,
        featuredImageName: true,
        updatedAt: true,
      },
    })

    const transparentPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    )

    if (!tour || !tour.featuredImageData) {
      return new NextResponse(transparentPng, {
        headers: {
          "Content-Type": "image/png",
          "Content-Length": transparentPng.length.toString(),
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      })
    }

    const buffer = Buffer.from(tour.featuredImageData)
    const contentType = tour.featuredImageType || "image/jpeg"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `inline; filename="${tour.featuredImageName || "tour"}"`,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "ETag": `W/\"${buffer.length}-${tour.updatedAt.getTime()}\"`,
      },
    })
  } catch (error) {
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


