import { NextRequest, NextResponse } from 'next/server'
import { LogsService } from '@/lib/logs-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pagePath, timestamp, referrer } = body

    // Track the visitor using the LogsService
    await LogsService.trackVisitor(request, pagePath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking visitor:', error)
    return NextResponse.json(
      { error: 'Failed to track visitor' },
      { status: 500 }
    )
  }
} 