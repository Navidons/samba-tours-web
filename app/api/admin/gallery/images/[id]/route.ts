import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/gallery/images/[id] - Get specific image
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = parseInt(params.id)

    const image = await prisma.galleryImage.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        title: true,
        alt: true,
        imageName: true,
        imageType: true,
        imageSize: true,
        imageData: true,
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

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    const transformedImage = {
      id: image.id,
      title: image.title,
      alt: image.alt,
      imageName: image.imageName,
      imageType: image.imageType,
      imageSize: image.imageSize,
      imageData: image.imageData ? Buffer.from(image.imageData).toString('base64') : null,
      featured: image.featured,
      views: image.views,
      createdAt: image.createdAt,
      gallery: image.gallery
    }

    return NextResponse.json({ image: transformedImage })

  } catch (error) {
    console.error('Error fetching image:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/gallery/images/[id] - Update image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = parseInt(params.id)
    const formData = await request.formData()

    const title = formData.get('title') as string
    const alt = formData.get('alt') as string
    const featured = formData.get('featured') === 'true'
    const views = formData.get('views') ? parseInt(formData.get('views') as string) : 0

    // Check if image exists
    const existingImage = await prisma.galleryImage.findUnique({
      where: { id: imageId }
    })

    if (!existingImage) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Update image
    const updatedImage = await prisma.galleryImage.update({
      where: { id: imageId },
      data: {
        title: title || null,
        alt: alt || null,
        featured,
        views
      },
      select: {
        id: true,
        title: true,
        alt: true,
        imageName: true,
        imageType: true,
        imageSize: true,
        imageData: true,
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
      image: {
        id: updatedImage.id,
        title: updatedImage.title,
        alt: updatedImage.alt,
        imageName: updatedImage.imageName,
        imageType: updatedImage.imageType,
        imageSize: updatedImage.imageSize,
        imageData: updatedImage.imageData ? Buffer.from(updatedImage.imageData).toString('base64') : null,
        featured: updatedImage.featured,
        views: updatedImage.views,
        createdAt: updatedImage.createdAt,
        gallery: updatedImage.gallery
      }
    })

  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/gallery/images/[id] - Delete image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = parseInt(params.id)

    // Check if image exists and get gallery info
    const image = await prisma.galleryImage.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        galleryId: true
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Delete image
    await prisma.galleryImage.delete({
      where: { id: imageId }
    })

    // Update gallery image count if image belongs to a gallery
    if (image.galleryId) {
      await prisma.gallery.update({
        where: { id: image.galleryId },
        data: {
          imageCount: {
            decrement: 1
          }
        }
      })
    }

    return NextResponse.json({
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
} 