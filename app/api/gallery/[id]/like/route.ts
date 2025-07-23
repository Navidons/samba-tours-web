import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = parseInt(params.id)
    
    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      )
    }

    // Get visitor identifier from request
    const visitorId = getVisitorId(request)
    
    // Check if image exists
    const image = await prisma.galleryImage.findUnique({
      where: { id: imageId },
      select: { id: true, likes: true }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Check if this visitor has already liked this image
    const existingLike = await prisma.galleryImageLike.findUnique({
      where: {
        imageId_visitorId: {
          imageId,
          visitorId
        }
      }
    })

    let liked = false
    let newLikesCount = image.likes

    if (existingLike) {
      // Unlike: remove the like record and decrease count
      await prisma.galleryImageLike.delete({
        where: {
          imageId_visitorId: {
            imageId,
            visitorId
          }
        }
      })
      newLikesCount = Math.max(0, image.likes - 1)
    } else {
      // Like: create the like record and increase count
      await prisma.galleryImageLike.create({
        data: {
          imageId,
          visitorId
        }
      })
      newLikesCount = image.likes + 1
      liked = true
    }

    // Update the image's like count
    await prisma.galleryImage.update({
      where: { id: imageId },
      data: { likes: newLikesCount }
    })

    return NextResponse.json({
      success: true,
      liked,
      likes: newLikesCount
    })

  } catch (error) {
    console.error('Error toggling image like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

function getVisitorId(request: NextRequest): string {
  // Try to get visitor ID from cookie
  const visitorCookie = request.cookies.get('visitor_id')
  if (visitorCookie?.value) {
    return visitorCookie.value
  }

  // Try to get from Authorization header (for client-side requests)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const visitorId = authHeader.substring(7)
    if (visitorId.startsWith('visitor_')) {
      return visitorId
    }
  }

  // Generate a new visitor ID
  const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  return visitorId
} 