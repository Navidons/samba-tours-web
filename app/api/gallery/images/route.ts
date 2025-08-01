import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export const dynamic = 'force-dynamic'

// GET /api/gallery/images - Get all gallery images with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const galleryId = searchParams.get('galleryId')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const pageSize = limit

    // Build where clause for filtering
    const whereClause: any = {}
    
    if (featured === 'true') {
      whereClause.featured = true
    }
    
    if (galleryId) {
      whereClause.galleryId = parseInt(galleryId)
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get images with related data
    const images = await prisma.galleryImage.findMany({
      where: whereClause,
      include: {
        gallery: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: pageSize,
      skip: (page - 1) * pageSize
    })

    // Get total count for pagination
    const total = await prisma.galleryImage.count({
      where: whereClause
    })

    // Transform data for response - handle empty results gracefully
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
        galleryId: image.galleryId,
        gallery: image.gallery,
        imageData: imageDataBase64,
        imageName: image.imageName,
        imageType: image.imageType,
        imageSize: image.imageSize,
        alt: image.alt,
        title: image.title,
        description: image.description,
        featured: image.featured,
        views: image.views,
        createdAt: image.createdAt
      }
    })

    return NextResponse.json({
      images: transformedImages,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      },
      success: true
    })

  } catch (error) {
    console.error('Error fetching gallery images:', error)
    
    // Handle specific database connection errors
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check if the database server is running.',
          type: 'CONNECTION_ERROR',
          success: false
        },
        { status: 503 } // Service Unavailable
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
    
    // Generic error
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while fetching gallery images.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 
