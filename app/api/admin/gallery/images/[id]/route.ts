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
      include: {
        gallery: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        category: true,
        location: true
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
      galleryId: image.galleryId,
      gallery: image.gallery,
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
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
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
    const description = formData.get('description') as string
    const photographer = formData.get('photographer') as string
    const date = formData.get('date') as string
    const featured = formData.get('featured') === 'true'
    const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null
    const locationId = formData.get('locationId') ? parseInt(formData.get('locationId') as string) : null
    const displayOrder = formData.get('displayOrder') ? parseInt(formData.get('displayOrder') as string) : null
    const likes = formData.get('likes') ? parseInt(formData.get('likes') as string) : null
    const views = formData.get('views') ? parseInt(formData.get('views') as string) : null

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
        title: title || existingImage.title,
        alt: alt || existingImage.alt,
        description: description || existingImage.description,
        photographer: photographer || existingImage.photographer,
        date: date ? new Date(date) : existingImage.date,
        featured,
        categoryId,
        locationId,
        displayOrder: displayOrder !== null ? displayOrder : existingImage.displayOrder,
        likes: likes !== null ? likes : existingImage.likes,
        views: views !== null ? views : existingImage.views
      },
      include: {
        gallery: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        category: true,
        location: true
      }
    })

    const transformedImage = {
      id: updatedImage.id,
      galleryId: updatedImage.galleryId,
      gallery: updatedImage.gallery,
      imageData: updatedImage.imageData.toString('base64'),
      imageName: updatedImage.imageName,
      imageType: updatedImage.imageType,
      imageSize: updatedImage.imageSize,
      alt: updatedImage.alt,
      title: updatedImage.title,
      description: updatedImage.description,
      photographer: updatedImage.photographer,
      date: updatedImage.date,
      featured: updatedImage.featured,
      category: updatedImage.category,
      location: updatedImage.location,
      likes: updatedImage.likes,
      views: updatedImage.views,
      displayOrder: updatedImage.displayOrder,
      createdAt: updatedImage.createdAt,
      updatedAt: updatedImage.updatedAt
    }

    return NextResponse.json({ image: transformedImage })

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

    // Delete image
    await prisma.galleryImage.delete({
      where: { id: imageId }
    })

    // Update gallery image count
    const imageCount = await prisma.galleryImage.count({
      where: { galleryId: existingImage.galleryId }
    })

    await prisma.gallery.update({
      where: { id: existingImage.galleryId },
      data: { imageCount }
    })

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