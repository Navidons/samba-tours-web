import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''
    const featured = searchParams.get('featured') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (category) {
      where.categoryId = parseInt(category)
    }
    
    if (featured === 'true') {
      where.featured = true
    } else if (featured === 'false') {
      where.featured = false
    }

    // Get posts and total count
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
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
        },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true
                }
              }
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { publishDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ])

    // Get statistics
    const stats = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: 'published' } }),
      prisma.blogPost.count({ where: { status: 'draft' } }),
      prisma.blogPost.aggregate({
        _sum: { viewCount: true }
      })
    ])

    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
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
      } : null,
      tags: post.tags.map(t => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
        color: t.tag.color
      })),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: {
        totalPosts: stats[0],
        publishedPosts: stats[1],
        draftPosts: stats[2],
        totalViews: stats[3]._sum.viewCount || 0
      }
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse FormData
    const formData = await request.formData()
    
    // Extract form data
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const contentHtml = formData.get('contentHtml') as string
    const status = formData.get('status') as string
    const publishDate = formData.get('publishDate') as string
    const readTimeMinutes = formData.get('readTimeMinutes') as string
    const featured = formData.get('featured') === 'true'
    const categoryId = formData.get('categoryId') as string
    const authorId = formData.get('authorId') as string
    const metaTitle = formData.get('metaTitle') as string
    const metaDescription = formData.get('metaDescription') as string
    const seoKeywords = formData.get('seoKeywords') as string
    const tagIds = formData.getAll('tagIds').map(id => parseInt(id as string))
    const thumbnail = formData.get('thumbnail') as File | null

    // Prepare create data
    const createData: any = {
      title,
      slug,
      excerpt,
      content,
      contentHtml,
      status: status || 'draft',
      publishDate: publishDate ? new Date(publishDate) : null,
      readTimeMinutes: readTimeMinutes ? parseInt(readTimeMinutes) : null,
      featured: featured || false,
      categoryId: categoryId ? parseInt(categoryId) : null,
      authorId: authorId ? parseInt(authorId) : null,
      metaTitle,
      metaDescription,
      seoKeywords: seoKeywords ? JSON.parse(seoKeywords) : null
    }

    // Handle thumbnail upload
    if (thumbnail && thumbnail.size > 0) {
      const bytes = await thumbnail.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      createData.thumbnailData = buffer
      createData.thumbnailName = thumbnail.name
      createData.thumbnailType = thumbnail.type
      createData.thumbnailSize = thumbnail.size
    }

    const post = await prisma.blogPost.create({
      data: createData,
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

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await prisma.blogPostTagMapping.createMany({
        data: tagIds.map((tagId: number) => ({
          postId: post.id,
          tagId
        }))
      })
    }

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
