import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const tagId = searchParams.get('tagId')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'
    const sort = searchParams.get('sort') || 'date'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'published'
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (tagId) {
      where.tags = {
        some: {
          tag: {
            id: parseInt(tagId)
          }
        }
      }
    } else if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag
          }
        }
      }
    }

    if (author) {
      where.author = {
        name: {
          contains: author,
          mode: 'insensitive'
        }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (featured) {
      where.featured = true
    }

    // Fetch posts with pagination
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          author: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: sort === 'views' 
          ? [
              { viewCount: 'desc' },
              { featured: 'desc' },
              { publishDate: 'desc' }
            ]
          : [
              { featured: 'desc' },
              { publishDate: 'desc' },
              { createdAt: 'desc' }
            ],
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ])

    // Transform posts for frontend
    const transformedPosts = posts.map((post: any) => ({
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
      category: post.category ? {
        id: post.category.id,
        name: post.category.name,
        slug: post.category.slug
      } : null,
      author: post.author ? {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
        bio: post.author.bio
      } as any : null,
      tags: post.tags?.map((t: any) => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
        color: t.tag.color
      })) || [],
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }))

    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Rate limiting middleware (you can implement this)
function rateLimit(request: NextRequest) {
  // Implement rate limiting logic here
  // For now, we'll allow all requests
  return true
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}
