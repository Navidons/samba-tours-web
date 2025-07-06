import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { EmailAnalytics } from '@/lib/email-service'

const prisma = new PrismaClient()

// GET - Track email clicks and redirect to original URL
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emailId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const originalUrl = searchParams.get('url')
    
    if (!originalUrl) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Track the email click
    await EmailAnalytics.trackClick(emailId, originalUrl, ipAddress, userAgent)

    // Redirect to the original URL
    return NextResponse.redirect(originalUrl)
  } catch (error) {
    console.error('Email click tracking error:', error)
    
    // Still redirect even if tracking fails
    const { searchParams } = new URL(request.url)
    const originalUrl = searchParams.get('url')
    
    if (originalUrl) {
      return NextResponse.redirect(originalUrl)
    }
    
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 })
  }
} 