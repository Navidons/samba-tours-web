import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'

// GET - Fetch comments for a blog post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const parentId = searchParams.get('parentId') // For replies

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required', success: false },
        { status: 400 }
      )
    }

    const where: any = {
      postId: parseInt(postId),
      status: 'approved'
    }

    // If parentId is provided, get replies to that comment
    if (parentId) {
      where.parentCommentId = parseInt(parentId)
    } else {
      // Get top-level comments only
      where.parentCommentId = null
    }

    const comments = await prisma.blogComment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                fullName: true,
                avatarData: true,
                avatarName: true,
                avatarType: true,
              }
            }
          }
        },
        replies: {
          where: { status: 'approved' },
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    fullName: true,
                    avatarData: true,
                    avatarName: true,
                    avatarType: true,
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            replies: {
              where: { status: 'approved' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform comments to include avatar URLs and user info
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail,
      content: comment.content,
      status: comment.status,
      likes: comment.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      parentCommentId: comment.parentCommentId,
      user: comment.user ? {
        id: comment.user.id,
        name: comment.user.profile?.fullName || 
              `${comment.user.profile?.firstName || ''} ${comment.user.profile?.lastName || ''}`.trim() ||
              'Unknown User',
        avatar: comment.user.profile?.avatarData && comment.user.profile?.avatarType
          ? `data:${comment.user.profile.avatarType};base64,${Buffer.from(comment.user.profile.avatarData).toString('base64')}`
          : null
      } : null,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        authorName: reply.authorName,
        authorEmail: reply.authorEmail,
        content: reply.content,
        status: reply.status,
        likes: reply.likes,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        parentCommentId: reply.parentCommentId,
        user: reply.user ? {
          id: reply.user.id,
          name: reply.user.profile?.fullName || 
                `${reply.user.profile?.firstName || ''} ${reply.user.profile?.lastName || ''}`.trim() ||
                'Unknown User',
          avatar: reply.user.profile?.avatarData && reply.user.profile?.avatarType
            ? `data:${reply.user.profile.avatarType};base64,${Buffer.from(reply.user.profile.avatarData).toString('base64')}`
            : null
        } : null,
      })),
      replyCount: comment._count.replies
    }))

    return NextResponse.json({
      success: true,
      comments: transformedComments
    })

  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments', success: false },
      { status: 500 }
    )
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, authorName, authorEmail, content, parentCommentId } = body

    // Validate required fields
    if (!postId || !authorName || !authorEmail || !content) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', success: false },
        { status: 400 }
      )
    }

    // Check if the blog post exists
    const post = await prisma.blogPost.findUnique({
      where: { id: parseInt(postId) },
      select: { id: true, status: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found', success: false },
        { status: 404 }
      )
    }

    if (post.status !== 'published') {
      return NextResponse.json(
        { error: 'Cannot comment on unpublished posts', success: false },
        { status: 400 }
      )
    }

    // If this is a reply, check if parent comment exists
    if (parentCommentId) {
      const parentComment = await prisma.blogComment.findUnique({
        where: { id: parseInt(parentCommentId) },
        select: { id: true, postId: true, status: true }
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found', success: false },
          { status: 404 }
        )
      }

      if (parentComment.postId !== parseInt(postId)) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to this post', success: false },
          { status: 400 }
        )
      }

      if (parentComment.status !== 'approved') {
        return NextResponse.json(
          { error: 'Cannot reply to unapproved comment', success: false },
          { status: 400 }
        )
      }
    }

    // Create the comment
    const comment = await prisma.blogComment.create({
      data: {
        postId: parseInt(postId),
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim().toLowerCase(),
        content: content.trim(),
        parentCommentId: parentCommentId ? parseInt(parentCommentId) : null,
        status: 'pending' // Comments are moderated by default
      },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                fullName: true,
                avatarData: true,
                avatarName: true,
                avatarType: true,
              }
            }
          }
        }
      }
    })

    // Update comment count on the blog post
    await prisma.blogPost.update({
      where: { id: parseInt(postId) },
      data: { commentCount: { increment: 1 } }
    })

    // Transform the comment for response
    const transformedComment = {
      id: comment.id,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail,
      content: comment.content,
      status: comment.status,
      likes: comment.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      parentCommentId: comment.parentCommentId,
      user: comment.user ? {
        id: comment.user.id,
        name: comment.user.profile?.fullName || 
              `${comment.user.profile?.firstName || ''} ${comment.user.profile?.lastName || ''}`.trim() ||
              'Unknown User',
        avatar: comment.user.profile?.avatarData && comment.user.profile?.avatarType
          ? `data:${comment.user.profile.avatarType};base64,${Buffer.from(comment.user.profile.avatarData).toString('base64')}`
          : null
      } : null,
      replies: [],
      replyCount: 0
    }

    return NextResponse.json({
      success: true,
      comment: transformedComment,
      message: 'Comment submitted successfully and is pending approval'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment', success: false },
      { status: 500 }
    )
  }
} 