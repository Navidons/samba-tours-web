import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// File size limits (5MB per image)
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

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
    const failedImages = []

    // Process images
    for (const file of files) {
      try {
        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          failedImages.push({
            name: file.name,
            error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
          })
          continue
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          failedImages.push({
            name: file.name,
            error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB`
          })
          continue
        }

        // Validate file has content
        if (file.size === 0) {
          failedImages.push({
            name: file.name,
            error: 'File is empty'
          })
          continue
        }

        // Convert file to buffer with error handling
        let buffer: Buffer
        try {
          const arrayBuffer = await file.arrayBuffer()
          buffer = Buffer.from(arrayBuffer)
          
          // Validate buffer has content
          if (buffer.length === 0) {
            failedImages.push({
              name: file.name,
              error: 'Failed to read file content'
            })
            continue
          }
        } catch (bufferError) {
          console.error(`Error reading file ${file.name}:`, bufferError)
          failedImages.push({
            name: file.name,
            error: 'Failed to read file content'
          })
          continue
        }
        
        // Extract filename without extension for title
        const imageTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
        
        // Create image record with better error handling
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

        console.log(`✅ Successfully uploaded: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`)

      } catch (error) {
        console.error(`❌ Error uploading image ${file.name}:`, error)
        failedImages.push({
          name: file.name,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
      }
    }

    // Update gallery counts only if images were successfully uploaded
    if (uploadedImages.length > 0) {
      try {
        await prisma.gallery.update({
          where: { id: galleryId },
          data: {
            imageCount: {
              increment: uploadedImages.length
            }
          }
        })
      } catch (updateError) {
        console.error('Error updating gallery count:', updateError)
        // Don't fail the entire request if count update fails
      }
    }

    // Return detailed response
    const response = {
      images: uploadedImages,
      message: `Successfully uploaded ${uploadedImages.length} images`,
      failed: failedImages,
      summary: {
        total: files.length,
        successful: uploadedImages.length,
        failed: failedImages.length
      }
    }

    // Return different status codes based on results
    if (uploadedImages.length === 0 && failedImages.length > 0) {
      return NextResponse.json(response, { status: 400 })
    } else if (failedImages.length > 0) {
      return NextResponse.json(response, { status: 207 }) // Partial success
    } else {
      return NextResponse.json(response, { status: 200 })
    }

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
