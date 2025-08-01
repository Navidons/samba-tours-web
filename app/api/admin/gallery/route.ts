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

    // Get galleries with counts
    const galleries = await prisma.gallery.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        featured: true,
        imageCount: true,
        videoCount: true,
        createdAt: true,
        updatedAt: true
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

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      galleries,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error fetching galleries:', error)
    
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

// POST /api/admin/gallery - Create a new gallery
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const featured = formData.get('featured') === 'true'

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Gallery name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingGallery = await prisma.gallery.findUnique({
      where: { slug }
    })

    if (existingGallery) {
      return NextResponse.json(
        { error: 'A gallery with this name already exists' },
        { status: 409 }
      )
    }

    // Create gallery
    const gallery = await prisma.gallery.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        featured
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        featured: true,
        imageCount: true,
        videoCount: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ gallery })

  } catch (error) {
    console.error('Error creating gallery:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Database connection failed', type: 'CONNECTION_ERROR' },
        { status: 503 }
      )
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A gallery with this name already exists' },
          { status: 409 }
        )
      }
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
