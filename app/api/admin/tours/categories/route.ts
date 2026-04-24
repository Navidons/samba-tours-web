import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// GET /api/admin/tours/categories - Get all tour categories for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where = includeInactive ? {} : { isActive: true }

    const categories = await prisma.tourCategory.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageData: true,
        imageName: true,
        imageType: true,
        imageSize: true,
        displayOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tours: {
              where: {
                status: 'active'
              }
            }
          }
        }
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })

    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.imageData ? {
        data: Buffer.from(category.imageData).toString('base64'),
        name: category.imageName,
        type: category.imageType,
        size: category.imageSize
      } : null,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      tourCount: category._count.tours,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    return NextResponse.json({
      categories: transformedCategories,
      success: true
    })

  } catch (error) {
    console.error('Error fetching tour categories:', error)
    
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
        error: 'An unexpected error occurred while fetching categories.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/tours/categories - Create new tour category
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const name = formData.get('name') as string
    const description = formData.get('description') as string || null
    const isActive = formData.get('isActive') === 'true'
    const displayOrder = formData.get('displayOrder') ? parseInt(formData.get('displayOrder') as string) : 0

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required', success: false },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    // Check if slug already exists
    const existingCategory = await prisma.tourCategory.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists', success: false },
        { status: 400 }
      )
    }

    // Handle image upload
    const imageFile = formData.get('image') as File | null
    let imageData = null
    let imageName = null
    let imageType = null
    let imageSize = null

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      imageData = buffer
      imageName = imageFile.name
      imageType = imageFile.type
      imageSize = imageFile.size
    }

    // Create category
    const category = await prisma.tourCategory.create({
      data: {
        name,
        slug,
        description,
        imageData,
        imageName,
        imageType,
        imageSize,
        displayOrder,
        isActive
      }
    })

    const transformedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.imageData ? {
        data: Buffer.from(category.imageData).toString('base64'),
        name: category.imageName,
        type: category.imageType,
        size: category.imageSize
      } : null,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      tourCount: 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }

    return NextResponse.json({
      category: transformedCategory,
      success: true
    })

  } catch (error) {
    console.error('Error creating tour category:', error)
    
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
        error: 'An unexpected error occurred while creating category.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 
