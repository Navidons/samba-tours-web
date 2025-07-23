import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/gallery/categories - Get all gallery categories for client side
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
      videoCount: category._count.videos
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
