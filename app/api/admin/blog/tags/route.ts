import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.blogTag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const transformedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      color: tag.color,
      postCount: tag._count.posts
    }))

    return NextResponse.json({ tags: transformedTags })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if tag already exists (case-insensitive handled by DB collation)
    const existingTag = await prisma.blogTag.findFirst({
      where: {
        name: body.name
      }
    })

    if (existingTag) {
      return NextResponse.json({ 
        success: true, 
        tag: existingTag,
        message: "Tag already exists"
      })
    }
    
    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const tag = await prisma.blogTag.create({
      data: {
        name: body.name,
        slug: slug,
        description: body.description,
        color: body.color || '#3B82F6'
      }
    })

    return NextResponse.json({ success: true, tag })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
