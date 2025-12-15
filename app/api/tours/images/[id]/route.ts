import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const imageId = parseInt(id)
    if (Number.isNaN(imageId)) {
      return new NextResponse("Invalid id", { status: 400 })
    }

    const image = await prisma.tourImage.findUnique({
      where: { id: imageId },
      select: {
        imageData: true,
        imageType: true,
        imageName: true,
        createdAt: true,
      },
    })

    const transparentPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    )

    if (!image || !image.imageData) {
      return new NextResponse(transparentPng, {
        headers: {
          "Content-Type": "image/png",
          "Content-Length": transparentPng.length.toString(),
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      })
    }

    const buffer = Buffer.from(image.imageData)
    const contentType = image.imageType || "image/jpeg"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Content-Disposition": `inline; filename="${image.imageName || "image"}"`,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "ETag": `W/\"${buffer.length}-${image.createdAt.getTime()}\"`,
      },
    })
  } catch {
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


