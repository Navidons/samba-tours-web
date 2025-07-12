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
      select: { id: true, views: true }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Check if this visitor has already viewed this image recently (within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const existingView = await prisma.galleryImageView.findFirst({
      where: {
        imageId,
        visitorId,
        viewedAt: {
          gte: twentyFourHoursAgo
        }
      }
    })

    let newViewsCount = image.views

    if (!existingView) {
      // Create a new view record
      await prisma.galleryImageView.create({
        data: {
          imageId,
          visitorId,
          viewedAt: new Date()
        }
      })
      
      // Increment the view count
      newViewsCount = image.views + 1

      // Update the image's view count
      await prisma.galleryImage.update({
        where: { id: imageId },
        data: { views: newViewsCount }
      })
    }

    return NextResponse.json({
      success: true,
      views: newViewsCount,
      newView: !existingView
    })

  } catch (error) {
    console.error('Error tracking image view:', error)
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