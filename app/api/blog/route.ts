import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12') // Increased default limit
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const tagId = searchParams.get('tagId')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'
    const sort = searchParams.get('sort') || 'date'
    const includeSidebar = searchParams.get('includeSidebar') === 'true'

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
        { excerpt: { contains: search, mode: 'insensitive' } }
        // Removed content search for performance
      ]
    }

    if (featured) {
      where.featured = true
    }

    // Select only lightweight fields; avoid large BLOB/LongText
    const select = {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      // DO NOT select content/contentHtml/thumbnailData here
      status: true,
      publishDate: true,
      readTimeMinutes: true,
      viewCount: true,
      likeCount: true,
      commentCount: true,
      featured: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: { id: true, name: true, slug: true, color: true },
          },
        },
      },
    } as const

    // Fetch posts with pagination
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select,
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

    // Transform posts for frontend (lightweight): use streaming thumbnail URL
    const transformedPosts = posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      status: post.status,
      publishDate: post.publishDate?.toISOString(),
      readTimeMinutes: post.readTimeMinutes,
      viewCount: post.viewCount || 0,
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
      featured: post.featured,
      // Always return streaming URL (endpoint handles missing thumbnails)
      thumbnail: `/api/blog/thumbnails/${post.id}`,
      category: post.category,
      author: post.author,
      tags: post.tags?.map((t: any) => t.tag) || [],
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }))

    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    // If sidebar data is requested, fetch it in the same request
    let sidebarData = null
    if (includeSidebar) {
      const [popularPosts, categories, tags, categoryCounts] = await Promise.all([
        prisma.blogPost.findMany({
          where: { status: 'published' },
          select: { id: true, title: true, slug: true, viewCount: true },
          orderBy: { viewCount: 'desc' },
          take: 3
        }),
        prisma.blogCategory.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          },
          orderBy: { name: 'asc' }
        }),
        prisma.blogTag.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          },
          orderBy: { name: 'asc' }
        }),
        prisma.blogPost.groupBy({
          by: ['categoryId'],
          where: { status: 'published', categoryId: { not: null } },
          _count: { _all: true },
        })
      ])

      // Merge post counts (single grouped query)
      const countsByCategoryId = new Map<number, number>()
      for (const c of categoryCounts) {
        // c.categoryId is number | null (filtered not null above)
        // @ts-ignore - prisma types
        countsByCategoryId.set(c.categoryId as number, c._count._all)
      }
      const categoryPostCounts = categories.map((cat) => ({
        ...cat,
        postCount: countsByCategoryId.get(cat.id) || 0,
      }))

      sidebarData = {
        popularPosts: popularPosts.map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          viewCount: post.viewCount,
          // Always return URL; endpoint serves fallback when missing
          thumbnail: `/api/blog/thumbnails/${post.id}`,
        })),
        categories: categoryPostCounts,
        tags
      }
    }

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      },
      ...(sidebarData && { sidebar: sidebarData })
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
