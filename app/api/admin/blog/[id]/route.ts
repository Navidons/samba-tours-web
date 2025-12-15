import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const post = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                description: true
              }
            }
          }
        },
        comments: {
          select: {
            id: true,
            authorName: true,
            authorEmail: true,
            content: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      contentHtml: post.contentHtml,
      status: post.status,
      publishDate: post.publishDate?.toISOString(),
      readTimeMinutes: post.readTimeMinutes,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      featured: post.featured,
      thumbnail: post.thumbnailData ? `data:${post.thumbnailType};base64,${Buffer.from(post.thumbnailData).toString('base64')}` : null,
      thumbnailName: post.thumbnailName,
      thumbnailType: post.thumbnailType,
      thumbnailSize: post.thumbnailSize,

      category: post.category ? {
        id: post.category.id,
        name: post.category.name,
        slug: post.category.slug,
        description: post.category.description
      } : null,
      author: post.author ? {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
        bio: post.author.bio
      } : null,
      tags: post.tags.map(t => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
        color: t.tag.color,
        description: t.tag.description
      })),
      comments: post.comments.map(comment => ({
        id: comment.id,
        authorName: comment.authorName,
        authorEmail: comment.authorEmail,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt.toISOString()
      })),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }

    return NextResponse.json({ post: transformedPost })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const post = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        contentHtml: body.contentHtml,
        status: body.status,
        publishDate: body.publishDate ? new Date(body.publishDate) : null,
        readTimeMinutes: body.readTimeMinutes,
        featured: body.featured,
        categoryId: body.categoryId ? parseInt(body.categoryId) : null,
        authorId: body.authorId ? parseInt(body.authorId) : null,

      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const updateData: any = {}
    
    if (body.status !== undefined) {
      updateData.status = body.status
    }
    
    if (body.featured !== undefined) {
      updateData.featured = body.featured
    }

    if (body.title) {
      updateData.title = body.title
    }

    if (body.excerpt) {
      updateData.excerpt = body.excerpt
    }

    if (body.publishDate) {
      updateData.publishDate = new Date(body.publishDate)
    }

    const post = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    await prisma.blogPost.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 