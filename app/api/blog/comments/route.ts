import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch comments for a blog post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'approved'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: status as any,
      parentCommentId: null // Only get top-level comments
    }
    
    if (postId) {
      where.postId = parseInt(postId)
    }
    
    if (search) {
      where.OR = [
        { authorName: { contains: search, mode: 'insensitive' } },
        { authorEmail: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { post: { title: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get total count
    const total = await prisma.blogComment.count({ where })

    // Get top-level comments with their replies
    const comments = await prisma.blogComment.findMany({
      where,
      select: {
        id: true,
        authorName: true,
        authorEmail: true,
        content: true,
        status: true,
        likes: true,
        createdAt: true,
        updatedAt: true,
        parentCommentId: true,
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                firstName: true,
                lastName: true,
                avatarData: true,
                avatarName: true,
                avatarType: true,
              }
            }
          }
        },
        replies: {
          where: { status: 'approved' },
          select: {
            id: true,
            authorName: true,
            authorEmail: true,
            content: true,
            status: true,
            likes: true,
            createdAt: true,
            updatedAt: true,
            parentCommentId: true,
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    firstName: true,
                    lastName: true,
                    avatarData: true,
                    avatarName: true,
                    avatarType: true,
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Transform comments to match the expected interface
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
        replies: [],
        replyCount: 0
      })),
      replyCount: comment.replies.length
    }))

    return NextResponse.json({
      comments: transformedComments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching blog comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog comments' },
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
