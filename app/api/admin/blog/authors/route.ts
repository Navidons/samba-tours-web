import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const authors = await prisma.blogAuthor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarData: true,
        avatarName: true,
        avatarType: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            posts: true
          }
        }
      },
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    const transformedAuthors = authors.map(author => ({
      id: author.id,
      name: author.name,
      email: author.email,
      bio: author.bio,
      avatar: author.avatarData ? `data:${author.avatarType};base64,${Buffer.from(author.avatarData).toString('base64')}` : null,
      isActive: author.isActive,
      createdAt: author.createdAt.toISOString(),
      postCount: author._count.posts
    }))

    return NextResponse.json({ authors: transformedAuthors })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const author = await prisma.blogAuthor.create({
      data: {
        name: body.name,
        email: body.email,
        bio: body.bio,
        isActive: true
      }
    })

    return NextResponse.json({ success: true, author })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
