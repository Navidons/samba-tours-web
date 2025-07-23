import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// GET /api/admin/gallery - Get all galleries for admin management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    // Build where clause for filtering
    const whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (featured === 'true') {
      whereClause.featured = true
    }

    // Get galleries with counts and thumbnail data
    const galleries = await prisma.gallery.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        featured: true,
        thumbnailData: true,
        thumbnailName: true,
        thumbnailType: true,
        thumbnailSize: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            images: true,
            videos: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    })

    // Get total count for pagination
    const total = await prisma.gallery.count({
      where: whereClause
    })



    // Transform data for response - handle empty results gracefully
    const transformedGalleries = galleries.map(gallery => {
      let thumbnailObj = null
      
      if (gallery.thumbnailData) {
        try {
          // Handle different data formats that might be returned from database
          let buffer: Buffer
          
          if (Buffer.isBuffer(gallery.thumbnailData)) {
            // Data is already a Buffer
            buffer = gallery.thumbnailData
          } else if (typeof gallery.thumbnailData === 'string') {
            // Data might be a string - try to parse as JSON array or base64
            try {
              const parsed = JSON.parse(gallery.thumbnailData)
              if (Array.isArray(parsed)) {
                // Data is JSON array of bytes
                buffer = Buffer.from(parsed)
              } else {
                // Data might be base64 string
                buffer = Buffer.from(gallery.thumbnailData, 'base64')
              }
            } catch {
              // If parsing fails, treat as base64 string
              buffer = Buffer.from(gallery.thumbnailData, 'base64')
            }
          } else if (Array.isArray(gallery.thumbnailData)) {
            // Data is array of bytes
            buffer = Buffer.from(gallery.thumbnailData)
          } else {
            // Unknown format, try to convert to buffer
            buffer = Buffer.from(gallery.thumbnailData)
          }
          
          thumbnailObj = {
            data: buffer.toString('base64'),
            name: gallery.thumbnailName,
            type: gallery.thumbnailType
          }
        } catch (error) {
          console.error('Error converting thumbnail data:', error)
          thumbnailObj = null
        }
      }
      

      
      return {
        id: gallery.id,
        name: gallery.name,
        slug: gallery.slug,
        description: gallery.description,
        featured: gallery.featured,
        thumbnail: thumbnailObj,
        imageCount: gallery._count.images,
        videoCount: gallery._count.videos,
        createdAt: gallery.createdAt,
        updatedAt: gallery.updatedAt
      }
    })

    return NextResponse.json({
      galleries: transformedGalleries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      success: true
    })

  } catch (error) {
    console.error('Error fetching galleries:', error)
    
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
        error: 'An unexpected error occurred while fetching galleries.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/gallery - Create new gallery
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const featured = formData.get('featured') === 'true'
    const thumbnailFile = formData.get('thumbnail') as File | null

    if (!name) {
      return NextResponse.json(
        { error: 'Gallery name is required', success: false },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    // Check if slug already exists
    const existingGallery = await prisma.gallery.findUnique({
      where: { slug }
    })

    if (existingGallery) {
      return NextResponse.json(
        { error: 'Gallery with this name already exists', success: false },
        { status: 400 }
      )
    }

    // Process thumbnail if provided
    let thumbnailData = null
    let thumbnailName = null
    let thumbnailType = null
    let thumbnailSize = null

    if (thumbnailFile) {
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer())
      thumbnailData = buffer
      thumbnailName = thumbnailFile.name
      thumbnailType = thumbnailFile.type
      thumbnailSize = thumbnailFile.size
    }

    // Create gallery
    const gallery = await prisma.gallery.create({
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
        id: gallery.id,
        name: gallery.name,
        slug: gallery.slug,
        description: gallery.description,
        featured: gallery.featured,
        thumbnail: thumbnailData ? {
          data: Buffer.from(thumbnailData).toString('base64'),
          name: thumbnailName,
          type: thumbnailType
        } : null,
        imageCount: 0,
        videoCount: 0,
        createdAt: gallery.createdAt,
        updatedAt: gallery.updatedAt
      },
      success: true
    })

  } catch (error) {
    console.error('Error creating gallery:', error)
    
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
        error: 'An unexpected error occurred while creating gallery.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 
