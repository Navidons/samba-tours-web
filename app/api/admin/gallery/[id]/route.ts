import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// GET /api/admin/gallery/[id] - Get specific gallery for editing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const galleryId = parseInt(params.id)

    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: {
        images: {
          include: {
            category: true,
            location: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        },
        videos: {
          include: {
            category: true,
            location: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        }
      }
    })

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery not found', success: false },
        { status: 404 }
      )
    }

    // Transform data for response
    const transformedGallery = {
      id: gallery.id,
      name: gallery.name,
      slug: gallery.slug,
      description: gallery.description,
      featured: gallery.featured,
      thumbnail: gallery.thumbnailData ? {
        data: gallery.thumbnailData.toString('base64'),
        name: gallery.thumbnailName,
        type: gallery.thumbnailType
      } : null,
      imageCount: gallery.imageCount,
      videoCount: gallery.videoCount,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
      images: gallery.images.map(image => ({
        id: image.id,
        imageData: image.imageData.toString('base64'),
        imageName: image.imageName,
        imageType: image.imageType,
        imageSize: image.imageSize,
        alt: image.alt,
        title: image.title,
        description: image.description,
        photographer: image.photographer,
        date: image.date,
        featured: image.featured,
        category: image.category,
        location: image.location,
        likes: image.likes,
        views: image.views,
        displayOrder: image.displayOrder,
        createdAt: image.createdAt
      })),
      videos: gallery.videos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        duration: video.duration,
        featured: video.featured,
        category: video.category,
        location: video.location,
        likes: video.likes,
        views: video.views,
        displayOrder: video.displayOrder,
        createdAt: video.createdAt,
        thumbnail: video.thumbnailData ? {
          data: video.thumbnailData.toString('base64'),
          name: video.thumbnailName,
          type: video.thumbnailType
        } : null
      }))
    }

    return NextResponse.json({ gallery: transformedGallery, success: true })

  } catch (error) {
    console.error('Error fetching gallery:', error)
    
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
        error: 'An unexpected error occurred while fetching gallery.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/gallery/[id] - Update gallery
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const galleryId = parseInt(params.id)
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const featured = formData.get('featured') === 'true'
    const thumbnailFile = formData.get('thumbnail') as File | null
    const removeThumbnail = formData.get('removeThumbnail') === 'true'

    if (!name) {
      return NextResponse.json(
        { error: 'Gallery name is required', success: false },
        { status: 400 }
      )
    }

    // Check if gallery exists
    const existingGallery = await prisma.gallery.findUnique({
      where: { id: galleryId }
    })

    if (!existingGallery) {
      return NextResponse.json(
        { error: 'Gallery not found', success: false },
        { status: 404 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    // Check if slug already exists (excluding current gallery)
    const duplicateGallery = await prisma.gallery.findFirst({
      where: {
        slug,
        NOT: { id: galleryId }
      }
    })

    if (duplicateGallery) {
      return NextResponse.json(
        { error: 'Gallery with this name already exists', success: false },
        { status: 400 }
      )
    }

    // Process thumbnail
    let thumbnailData = existingGallery.thumbnailData
    let thumbnailName = existingGallery.thumbnailName
    let thumbnailType = existingGallery.thumbnailType
    let thumbnailSize = existingGallery.thumbnailSize

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

    // Update gallery
    const updatedGallery = await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        name,
        slug,
        description,
        featured,
        thumbnailData,
        thumbnailName,
        thumbnailType,
        thumbnailSize
      }
    })

    return NextResponse.json({
      gallery: {
        id: updatedGallery.id,
        name: updatedGallery.name,
        slug: updatedGallery.slug,
        description: updatedGallery.description,
        featured: updatedGallery.featured,
        thumbnail: thumbnailData ? {
          data: thumbnailData.toString('base64'),
          name: thumbnailName,
          type: thumbnailType
        } : null,
        imageCount: updatedGallery.imageCount,
        videoCount: updatedGallery.videoCount,
        createdAt: updatedGallery.createdAt,
        updatedAt: updatedGallery.updatedAt
      },
      success: true
    })

  } catch (error) {
    console.error('Error updating gallery:', error)
    
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
        error: 'An unexpected error occurred while updating gallery.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/gallery/[id] - Delete gallery
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const galleryId = parseInt(params.id)

    // Check if gallery exists
    const existingGallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: {
        _count: {
          select: {
            images: true,
            videos: true
          }
        }
      }
    })

    if (!existingGallery) {
      return NextResponse.json(
        { error: 'Gallery not found', success: false },
        { status: 404 }
      )
    }

    // Delete gallery (cascade will handle images and videos)
    await prisma.gallery.delete({
      where: { id: galleryId }
    })

    return NextResponse.json({
      message: 'Gallery deleted successfully',
      deletedItems: {
        images: existingGallery._count.images,
        videos: existingGallery._count.videos
      },
      success: true
    })

  } catch (error) {
    console.error('Error deleting gallery:', error)
    
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
        error: 'An unexpected error occurred while deleting gallery.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 