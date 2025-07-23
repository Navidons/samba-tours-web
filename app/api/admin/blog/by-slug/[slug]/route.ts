import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = decodeURIComponent(params.slug)
    
    const post = await prisma.blogPost.findUnique({
      where: { slug },
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
                color: true
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
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      seoKeywords: post.seoKeywords,
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
        color: t.tag.color
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

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = decodeURIComponent(params.slug)
    
    // Parse FormData
    const formData = await request.formData()
    
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    // Extract form data
    const title = formData.get('title') as string
    const slugValue = formData.get('slug') as string
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

    // Prepare update data
    const updateData: any = {
      title,
      slug: slugValue,
      excerpt,
      content,
      contentHtml,
      status,
      publishDate: publishDate ? new Date(publishDate) : null,
      readTimeMinutes: readTimeMinutes ? parseInt(readTimeMinutes) : null,
      featured,
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
      
      updateData.thumbnailData = buffer
      updateData.thumbnailName = thumbnail.name
      updateData.thumbnailType = thumbnail.type
      updateData.thumbnailSize = thumbnail.size
    }

    // Update the post
    const updatedPost = await prisma.blogPost.update({
      where: { id: post.id },
      data: updateData
    })

    // Update tags
    if (tagIds) {
      // Remove existing tags
      await prisma.blogPostTagMapping.deleteMany({
        where: { postId: post.id }
      })

      // Add new tags
      if (tagIds.length > 0) {
        await prisma.blogPostTagMapping.createMany({
          data: tagIds.map((tagId: number) => ({
            postId: post.id,
            tagId
          }))
        })
      }
    }

    return NextResponse.json({ 
      message: "Blog post updated successfully",
      post: updatedPost
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 