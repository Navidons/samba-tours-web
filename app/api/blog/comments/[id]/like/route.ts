import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Like a comment
export async function POST(
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

    // Check if comment exists and is approved
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { id: true, status: true, likes: true }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found', success: false },
        { status: 404 }
      )
    }

    if (comment.status !== 'approved') {
      return NextResponse.json(
        { error: 'Cannot like unapproved comment', success: false },
        { status: 400 }
      )
    }

    // Increment likes
    const updatedComment = await prisma.blogComment.update({
      where: { id: commentId },
      data: { likes: { increment: 1 } },
      select: { id: true, likes: true }
    })

    return NextResponse.json({
      success: true,
      likes: updatedComment.likes
    })

  } catch (error) {
    console.error('Error liking comment:', error)
    return NextResponse.json(
      { error: 'Failed to like comment', success: false },
      { status: 500 }
    )
  }
} 