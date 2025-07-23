import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const authors = await prisma.blogAuthor.findMany({
      where: {
        isActive: true,
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
        name: 'asc'
      }
    })

    const transformedAuthors = authors.map(author => ({
      id: author.id,
      name: author.name,
      email: author.email,
      bio: author.bio,
      avatar: author.avatarData ? `data:${author.avatarType};base64,${Buffer.from(author.avatarData).toString('base64')}` : null,
      postCount: author._count.posts,
      isActive: author.isActive,
      createdAt: author.createdAt.toISOString(),
      updatedAt: author.updatedAt.toISOString()
    }))

    return NextResponse.json({ authors: transformedAuthors })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
