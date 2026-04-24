import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Handle email webhooks from providers (Gmail, SendGrid, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, event, reason, timestamp, email } = body

    // Find the email record by message ID
    const emailRecord = await prisma.emailSent.findFirst({
      where: { messageId }
    })

    if (!emailRecord) {
      console.warn(`Email record not found for message ID: ${messageId}`)
      return NextResponse.json({ success: false, error: 'Email not found' }, { status: 404 })
    }

    // Handle different event types
    switch (event) {
      case 'delivered':
        await prisma.emailSent.update({
          where: { id: emailRecord.id },
          data: {
            status: 'delivered',
            deliveredAt: new Date(timestamp)
          }
        })
        break

      case 'opened':
        await prisma.emailSent.update({
          where: { id: emailRecord.id },
          data: {
            status: 'opened',
            openedAt: new Date(timestamp)
          }
        })
        break

      case 'clicked':
        await prisma.emailSent.update({
          where: { id: emailRecord.id },
          data: {
            status: 'clicked',
            clickedAt: new Date(timestamp)
          }
        })
        break

      case 'bounced':
        await prisma.emailSent.update({
          where: { id: emailRecord.id },
          data: {
            status: 'bounced',
            bouncedAt: new Date(timestamp),
            bounceReason: reason || 'Unknown bounce reason'
          }
        })
        break

      case 'spam':
        await prisma.emailSent.update({
          where: { id: emailRecord.id },
          data: {
            status: 'spam',
            errorMessage: 'Marked as spam'
          }
        })
        break

      case 'failed':
        await prisma.emailSent.update({
          where: { id: emailRecord.id },
          data: {
            status: 'failed',
            errorMessage: reason || 'Delivery failed'
          }
        })
        break

      default:
        console.log(`Unhandled email event: ${event}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Verify webhook endpoint (for provider verification)
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Email webhook endpoint is active'
  })
} 
