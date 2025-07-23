import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get a specific comment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = parseInt(params.id)

    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID', success: false },
        { status: 400 }
      )
    }

    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                fullName: true,
              }
            }
          }
        },
        parentComment: {
          select: {
            id: true,
            authorName: true,
            content: true,
          }
        },
        replies: {
          select: {
            id: true,
            authorName: true,
            content: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      comment
    })

  } catch (error) {
    console.error('Error fetching comment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comment', success: false },
      { status: 500 }
    )
  }
}

// PATCH - Update comment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = parseInt(params.id)
    const body = await request.json()
    const { status } = body

    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID', success: false },
        { status: 400 }
      )
    }

    if (!status || !['pending', 'approved', 'spam'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or spam', success: false },
        { status: 400 }
      )
    }

    // Get the comment to check if status is changing
    const existingComment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { id: true, status: true, postId: true }
    })

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found', success: false },
        { status: 404 }
      )
    }

    // Update the comment status
    const updatedComment = await prisma.blogComment.update({
      where: { id: commentId },
      data: { status },
      select: { id: true, status: true, postId: true }
    })

    // Update comment count on the blog post if status changed
    if (existingComment.status !== status) {
      const commentCount = await prisma.blogComment.count({
        where: { 
          postId: existingComment.postId,
          status: 'approved'
        }
      })

      await prisma.blogPost.update({
        where: { id: existingComment.postId },
        data: { commentCount }
      })
    }

    return NextResponse.json({
      success: true,
      comment: updatedComment,
      message: `Comment ${status} successfully`
    })

  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment', success: false },
      { status: 500 }
    )
  }
}

// DELETE - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = parseInt(params.id)

    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID', success: false },
        { status: 400 }
      )
    }

    // Get the comment to get the post ID for updating comment count
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true, status: true }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found', success: false },
        { status: 404 }
      )
    }

    // Delete the comment (this will also delete replies due to cascade)
    await prisma.blogComment.delete({
      where: { id: commentId }
    })

    // Update comment count on the blog post
    const commentCount = await prisma.blogComment.count({
      where: { 
        postId: comment.postId,
        status: 'approved'
      }
    })

    await prisma.blogPost.update({
      where: { id: comment.postId },
      data: { commentCount }
    })

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment', success: false },
      { status: 500 }
    )
  }
} 