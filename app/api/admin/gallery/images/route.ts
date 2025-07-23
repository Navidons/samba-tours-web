import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// POST /api/admin/gallery/images - Upload images and videos to gallery
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const galleryId = parseInt(formData.get('galleryId') as string)
    const images = formData.getAll('images') as File[]
    const videos = formData.getAll('videos') as File[]
    
    if (!galleryId) {
      return NextResponse.json(
        { error: 'Gallery ID is required', success: false },
        { status: 400 }
      )
    }

    if ((!images || images.length === 0) && (!videos || videos.length === 0)) {
      return NextResponse.json(
        { error: 'No images or videos provided', success: false },
        { status: 400 }
      )
    }

    // Check if gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId }
    })

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery not found', success: false },
        { status: 404 }
      )
    }

    // Get optional metadata
    const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null
    const locationId = formData.get('locationId') ? parseInt(formData.get('locationId') as string) : null
    const photographer = formData.get('photographer') as string || null

    const uploadedItems = {
      images: [],
      videos: []
    }

    // Process images
    if (images && images.length > 0) {
      let displayOrder = 0

      // Get current max display order for images
      const maxImageOrder = await prisma.galleryImage.findFirst({
        where: { galleryId },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true }
      })

      if (maxImageOrder) {
        displayOrder = maxImageOrder.displayOrder + 1
      }

      for (const file of images) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer())
          
          // Extract filename without extension for title
          const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
          
          const image = await prisma.galleryImage.create({
            data: {
              gallery: {
                connect: { id: galleryId }
              },
              imageData: buffer,
              imageName: file.name,
              imageType: file.type,
              imageSize: file.size,
              alt: title,
              title,
              photographer,
              ...(categoryId && {
                category: {
                  connect: { id: categoryId }
                }
              }),
              ...(locationId && {
                location: {
                  connect: { id: locationId }
                }
              }),
              displayOrder: displayOrder++
            },
            include: {
              category: true,
              location: true,
              gallery: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          })

          uploadedItems.images.push({
            id: image.id,
            galleryId: image.gallery?.id || galleryId,
            imageData: Buffer.from(image.imageData).toString('base64'),
            imageName: image.imageName,
            imageType: image.imageType,
            imageSize: image.imageSize,
            alt: image.alt,
            title: image.title,
            description: image.description,
            photographer: image.photographer,
            featured: image.featured,
            category: image.category,
            location: image.location,
            likes: image.likes,
            views: image.views,
            displayOrder: image.displayOrder,
            createdAt: image.createdAt
          })

        } catch (error) {
          console.error(`Error processing image ${file.name}:`, error)
          // Continue with other files
        }
      }
    }

    // Process videos
    if (videos && videos.length > 0) {
      let displayOrder = 0

      // Get current max display order for videos
      const maxVideoOrder = await prisma.galleryVideo.findFirst({
        where: { galleryId },
        orderBy: { displayOrder: 'desc' },
        select: { displayOrder: true }
      })

      if (maxVideoOrder) {
        displayOrder = maxVideoOrder.displayOrder + 1
      }

      for (const file of videos) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer())
          
          // Extract filename without extension for title
          const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
          
          // Generate thumbnail from video (placeholder for now)
          // In production, you'd use ffmpeg or similar to extract a frame
          const thumbnailFile = formData.get(`thumbnail_${file.name}`) as File | null
          let thumbnailData = null
          let thumbnailName = null
          let thumbnailType = null
          let thumbnailSize = null

          if (thumbnailFile) {
            const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer())
            thumbnailData = thumbnailBuffer
            thumbnailName = thumbnailFile.name
            thumbnailType = thumbnailFile.type
            thumbnailSize = thumbnailFile.size
          }

          // Helper function to convert MM:SS duration to seconds
          const parseDurationToSeconds = (durationStr: string | null): number | null => {
            if (!durationStr) return null
            
            // If it's already a number (seconds), return it
            if (/^\d+$/.test(durationStr)) {
              return parseInt(durationStr)
            }
            
            // Parse MM:SS format
            const parts = durationStr.split(':')
            if (parts.length === 2) {
              const minutes = parseInt(parts[0]) || 0
              const seconds = parseInt(parts[1]) || 0
              return minutes * 60 + seconds
            }
            
            // Parse HH:MM:SS format
            if (parts.length === 3) {
              const hours = parseInt(parts[0]) || 0
              const minutes = parseInt(parts[1]) || 0
              const seconds = parseInt(parts[2]) || 0
              return hours * 3600 + minutes * 60 + seconds
            }
            
            return null
          }

          const durationRaw = formData.get('duration') as string || null
          const duration = parseDurationToSeconds(durationRaw)

          const video = await prisma.galleryVideo.create({
            data: {
              gallery: {
                connect: { id: galleryId }
              },
              videoData: buffer,
              videoName: file.name,
              videoType: file.type,
              videoSize: file.size,
              title,
              description: formData.get('description') as string || null,
              duration,
              photographer,
              ...(categoryId && {
                category: {
                  connect: { id: categoryId }
                }
              }),
              ...(locationId && {
                location: {
                  connect: { id: locationId }
                }
              }),
              displayOrder: displayOrder++,
              thumbnailData,
              thumbnailName,
              thumbnailType,
              thumbnailSize
            },
            include: {
              category: true,
              location: true,
              gallery: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          })

          uploadedItems.videos.push({
            id: video.id,
            galleryId: video.gallery?.id || galleryId,
            title: video.title,
            description: video.description,
            duration: video.duration,
            videoName: video.videoName,
            videoType: video.videoType,
            videoSize: video.videoSize,
            photographer: video.photographer,
            featured: video.featured,
            category: video.category,
            location: video.location,
            likes: video.likes,
            views: video.views,
            displayOrder: video.displayOrder,
            createdAt: video.createdAt,
            thumbnail: thumbnailData ? {
              data: Buffer.from(thumbnailData).toString('base64'),
              name: thumbnailName,
              type: thumbnailType
            } : null
          })

        } catch (error) {
          console.error(`Error processing video ${file.name}:`, error)
          // Continue with other files
        }
      }
    }

    // Update gallery counts
    const [imageCount, videoCount] = await Promise.all([
      prisma.galleryImage.count({ 
        where: { 
          gallery: {
            id: galleryId
          }
        }
      }),
      prisma.galleryVideo.count({ 
        where: { 
          gallery: {
            id: galleryId
          }
        }
      })
    ])

    await prisma.gallery.update({
      where: { id: galleryId },
      data: { imageCount, videoCount }
    })

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedItems.images.length} images and ${uploadedItems.videos.length} videos`,
      images: uploadedItems.images,
      videos: uploadedItems.videos,
      galleryId,
      success: true
    })

  } catch (error) {
    console.error('Error uploading media:', error)
    
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
        error: 'An unexpected error occurred while uploading media.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// GET /api/admin/gallery/images - Get all images and videos for admin management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const galleryId = searchParams.get('galleryId')
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const featured = searchParams.get('featured')
    const mediaType = searchParams.get('mediaType') || 'all' // 'images', 'videos', or 'all'

    // Build where clause
    const whereClause: any = {}
    
    if (galleryId) {
      whereClause.galleryId = parseInt(galleryId)
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { photographer: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      whereClause.category = {
        slug: category
      }
    }
    
    if (location) {
      whereClause.location = {
        slug: location
      }
    }
    
    if (featured === 'true') {
      whereClause.featured = true
    }

    let images = []
    let videos = []
    let totalImages = 0
    let totalVideos = 0

    // Get images if requested
    if (mediaType === 'all' || mediaType === 'images') {
      const imageWhereClause = { ...whereClause }
      if (search && whereClause.OR) {
        imageWhereClause.OR = [
          ...whereClause.OR,
          { alt: { contains: search, mode: 'insensitive' } },
          { imageName: { contains: search, mode: 'insensitive' } }
        ]
      }

      images = await prisma.galleryImage.findMany({
        where: imageWhereClause,
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
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        take: mediaType === 'images' ? limit : undefined,
        skip: mediaType === 'images' ? (page - 1) * limit : undefined
      })

      totalImages = await prisma.galleryImage.count({
        where: imageWhereClause
      })
    }

    // Get videos if requested
    if (mediaType === 'all' || mediaType === 'videos') {
      const videoWhereClause = { ...whereClause }
      if (search && whereClause.OR) {
        videoWhereClause.OR = [
          ...whereClause.OR,
          { videoName: { contains: search, mode: 'insensitive' } }
        ]
      }

      videos = await prisma.galleryVideo.findMany({
        where: videoWhereClause,
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
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        take: mediaType === 'videos' ? limit : undefined,
        skip: mediaType === 'videos' ? (page - 1) * limit : undefined
      })

      totalVideos = await prisma.galleryVideo.count({
        where: videoWhereClause
      })
    }

    const transformedImages = images.map(image => {
      let imageDataBase64 = ''
      
      if (image.imageData) {
        try {
          // Handle different data formats that might be returned from database
          let buffer: Buffer
          
          if (Buffer.isBuffer(image.imageData)) {
            // Data is already a Buffer
            buffer = image.imageData
          } else if (typeof image.imageData === 'string') {
            // Data might be a string - try to parse as JSON array or base64
            try {
              const parsed = JSON.parse(image.imageData)
              if (Array.isArray(parsed)) {
                // Data is JSON array of bytes
                buffer = Buffer.from(parsed)
              } else {
                // Data might be base64 string
                buffer = Buffer.from(image.imageData, 'base64')
              }
            } catch {
              // If parsing fails, treat as base64 string
              buffer = Buffer.from(image.imageData, 'base64')
            }
          } else if (Array.isArray(image.imageData)) {
            // Data is array of bytes
            buffer = Buffer.from(image.imageData)
          } else {
            // Unknown format, try to convert to buffer
            buffer = Buffer.from(image.imageData)
          }
          
          imageDataBase64 = buffer.toString('base64')
        } catch (error) {
          console.error('Error converting image data:', error)
          imageDataBase64 = ''
        }
      }
      
      return {
        id: image.id,
        type: 'image',
        galleryId: image.galleryId,
        gallery: image.gallery,
        imageData: imageDataBase64,
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
    })

    const transformedVideos = videos.map(video => {
      let thumbnailObj = null
      
      if (video.thumbnailData) {
        try {
          // Handle different data formats that might be returned from database
          let buffer: Buffer
          
          if (Buffer.isBuffer(video.thumbnailData)) {
            // Data is already a Buffer
            buffer = video.thumbnailData
          } else if (typeof video.thumbnailData === 'string') {
            // Data might be a string - try to parse as JSON array or base64
            try {
              const parsed = JSON.parse(video.thumbnailData)
              if (Array.isArray(parsed)) {
                // Data is JSON array of bytes
                buffer = Buffer.from(parsed)
              } else {
                // Data might be base64 string
                buffer = Buffer.from(video.thumbnailData, 'base64')
              }
            } catch {
              // If parsing fails, treat as base64 string
              buffer = Buffer.from(video.thumbnailData, 'base64')
            }
          } else if (Array.isArray(video.thumbnailData)) {
            // Data is array of bytes
            buffer = Buffer.from(video.thumbnailData)
          } else {
            // Unknown format, try to convert to buffer
            buffer = Buffer.from(video.thumbnailData)
          }
          
          thumbnailObj = {
            data: buffer.toString('base64'),
            name: video.thumbnailName,
            type: video.thumbnailType
          }
        } catch (error) {
          console.error('Error converting video thumbnail data:', error)
          thumbnailObj = null
        }
      }
      
      return {
        id: video.id,
        type: 'video',
        galleryId: video.galleryId,
        gallery: video.gallery,
        title: video.title,
        description: video.description,
        duration: video.duration,
        videoName: video.videoName,
        videoType: video.videoType,
        videoSize: video.videoSize,
        photographer: video.photographer,
        date: video.date,
        featured: video.featured,
        category: video.category,
        location: video.location,
        likes: video.likes,
        views: video.views,
        displayOrder: video.displayOrder,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        thumbnail: thumbnailObj
      }
    })

    const total = totalImages + totalVideos

    return NextResponse.json({
      images: transformedImages,
      videos: transformedVideos,
      media: [...transformedImages, ...transformedVideos].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      pagination: {
        total,
        totalImages,
        totalVideos,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      success: true
    })

  } catch (error) {
    console.error('Error fetching media:', error)
    
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
        error: 'An unexpected error occurred while fetching media.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 
