import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/gallery/categories - Get all gallery categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.galleryMediaCategory.findMany({
      include: {
        _count: {
          select: {
            images: true,
            videos: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      imageCount: category._count.images,
      videoCount: category._count.videos,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    return NextResponse.json({ categories: transformedCategories })

  } catch (error) {
    console.error('Error fetching gallery categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery categories' },
      { status: 500 }
    )
  }
}

// POST /api/admin/gallery/categories - Create new gallery category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    // Check if slug already exists
    const existingCategory = await prisma.galleryMediaCategory.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.galleryMediaCategory.create({
      data: {
        name,
        slug,
        description,
        color: color || '#10B981'
      }
    })

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        imageCount: 0,
        videoCount: 0,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    })

  } catch (error) {
    console.error('Error creating gallery category:', error)
    return NextResponse.json(
      { error: 'Failed to create gallery category' },
      { status: 500 }
    )
  }
} 
