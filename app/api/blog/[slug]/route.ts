import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug: params.slug,
        status: 'published'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        contentHtml: true,
        status: true,
        publishDate: true,
        readTimeMinutes: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        featured: true,
        thumbnailData: true,
        thumbnailName: true,
        thumbnailType: true,
        thumbnailSize: true,
        metaTitle: true,
        metaDescription: true,
        seoKeywords: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              }
            }
          }
        },
        comments: {
          where: {
            status: 'approved'
          },
          select: {
            id: true,
            authorName: true,
            content: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found', success: false },
        { status: 404 }
      )
    }

    // Transform the post data to include proper image handling
    const transformedPost = {
      ...post,
      thumbnail: post.thumbnailData && post.thumbnailType 
        ? `data:${post.thumbnailType};base64,${Buffer.from(post.thumbnailData).toString('base64')}`
        : null,
      // Remove the raw binary data from the response
      thumbnailData: undefined,
      thumbnailName: undefined,
      thumbnailType: undefined,
      thumbnailSize: undefined,
    }

    // Increment view count (non-blocking)
    prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      post: transformedPost
    })

  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post', success: false },
      { status: 500 }
    )
  }
} 