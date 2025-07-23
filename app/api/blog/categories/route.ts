import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: {
        posts: {
          some: {
            status: 'published'
          }
        }
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'published'
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
      postCount: category._count.posts
    }))

    return NextResponse.json({ categories: transformedCategories })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
