import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Report a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = parseInt(params.id)
    const body = await request.json()
    const { reporterName, reporterEmail, reason } = body

    if (isNaN(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID', success: false },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!reporterName || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    // Check if comment exists
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { id: true, status: true }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found', success: false },
        { status: 404 }
      )
    }

    // Create the report
    const report = await prisma.commentReport.create({
      data: {
        commentId,
        reporterName: reporterName.trim(),
        reporterEmail: reporterEmail?.trim() || null,
        reason: reason.trim(),
        status: 'pending'
      }
    })

    // Check if comment has multiple reports and potentially mark as spam
    const reportCount = await prisma.commentReport.count({
      where: { 
        commentId,
        status: 'pending'
      }
    })

    // If comment has 3 or more pending reports, mark it as spam
    if (reportCount >= 3) {
      await prisma.blogComment.update({
        where: { id: commentId },
        data: { status: 'spam' }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Comment reported successfully. Our moderators will review it shortly.',
      reportId: report.id
    })

  } catch (error) {
    console.error('Error reporting comment:', error)
    return NextResponse.json(
      { error: 'Failed to report comment', success: false },
      { status: 500 }
    )
  }
} 