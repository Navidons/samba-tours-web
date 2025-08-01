import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// POST /api/admin/gallery/images - Upload images to gallery
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const galleryId = parseInt(formData.get('galleryId') as string)
    const title = formData.get('title') as string || null
    const description = formData.get('description') as string || null
    const alt = formData.get('alt') as string || null
    const files = formData.getAll('images') as File[]
    
    if (!galleryId) {
      return NextResponse.json(
        { error: 'Gallery ID is required' },
        { status: 400 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
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

    const uploadedImages = []

    // Process images
    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Extract filename without extension for title
        const imageTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
        
        const image = await prisma.galleryImage.create({
          data: {
            galleryId,
            imageData: buffer,
            imageName: file.name,
            imageType: file.type,
            imageSize: file.size,
            alt: alt || imageTitle,
            title: title || imageTitle,
            description: description
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

        uploadedImages.push({
          id: image.id,
          title: image.title,
          description: image.description,
          alt: image.alt,
          imageName: image.imageName,
          imageType: image.imageType,
          imageSize: image.imageSize,
          featured: image.featured,
          views: image.views,
          createdAt: image.createdAt,
          gallery: image.gallery
        })

      } catch (error) {
        console.error(`Error uploading image ${file.name}:`, error)
        // Continue with other images even if one fails
      }
    }

    // Update gallery counts
    await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        imageCount: {
          increment: uploadedImages.length
        }
      }
    })

    return NextResponse.json({
      images: uploadedImages,
      message: `Successfully uploaded ${uploadedImages.length} images`
    })

  } catch (error) {
    console.error('Error uploading images:', error)
    
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

// GET /api/admin/gallery/images - Get images from gallery
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const galleryId = searchParams.get('galleryId') ? parseInt(searchParams.get('galleryId')!) : null
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const mediaType = searchParams.get('mediaType') || 'all'

    // Build where clause
    const whereClause: any = {}
    
    if (galleryId) {
      whereClause.galleryId = galleryId
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (featured === 'true') {
      whereClause.featured = true
    }

    // Get images
    const images = await prisma.galleryImage.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    })

    // Get total count
    const total = await prisma.galleryImage.count({
      where: whereClause
    })

    // Transform images to include base64 data
    const transformedImages = images.map(image => ({
      id: image.id,
      type: 'image' as const,
      title: image.title,
      description: image.description,
      alt: image.alt,
      imageName: image.imageName,
      imageType: image.imageType,
      imageSize: image.imageSize,
      imageData: image.imageData ? Buffer.from(image.imageData).toString('base64') : null,
      featured: image.featured,
      views: image.views,
      createdAt: image.createdAt,
      gallery: image.gallery
    }))

    // Get videos if mediaType is 'all' or 'videos'
    let videos: any[] = []
    if (mediaType === 'all' || mediaType === 'videos') {
      const videoWhereClause: any = {}
      if (galleryId) {
        videoWhereClause.galleryId = galleryId
      }
      if (search) {
        videoWhereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } }
        ]
      }
      if (featured === 'true') {
        videoWhereClause.featured = true
      }

      videos = await prisma.galleryVideo.findMany({
        where: videoWhereClause,
        select: {
          id: true,
          title: true,
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

      // Transform videos
      videos = videos.map(video => ({
        id: video.id,
        type: 'video' as const,
        title: video.title,
        videoUrl: video.videoUrl,
        videoProvider: video.videoProvider,
        videoId: video.videoId,
        thumbnail: video.thumbnailData ? {
          data: Buffer.from(video.thumbnailData).toString('base64'),
          type: video.thumbnailType
        } : null,
        duration: video.duration,
        featured: video.featured,
        views: video.views,
        createdAt: video.createdAt,
        gallery: video.gallery
      }))
    }

    // Combine and sort media
    let media = [...transformedImages, ...videos]
    media.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      media,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error fetching media:', error)
    
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
