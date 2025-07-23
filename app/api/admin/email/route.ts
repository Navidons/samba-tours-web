import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, sendBulkEmail, EmailCampaignService, EmailAnalytics } from '@/lib/email-service'

// GET - Fetch email analytics, campaigns, and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const campaignId = searchParams.get('campaignId')

    switch (action) {
      case 'analytics':
        return await getEmailAnalytics()
      case 'campaigns':
        return await getCampaigns(page, limit, status)
      case 'campaign-stats':
        if (!campaignId) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }
        return await getCampaignStats(parseInt(campaignId))
      case 'recent-emails':
        return await getRecentEmails(page, limit)
      case 'templates':
        return await getEmailTemplates()
      default:
        return await getEmailDashboard()
    }
  } catch (error) {
    console.error('Email API error:', error)
    // Return default data instead of error for better UX
    return NextResponse.json(getDefaultData())
  }
}

// POST - Send emails, create campaigns, or perform bulk operations
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let body: any = {}
    let action: string

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      const formData = await request.formData()
      action = formData.get('action') as string
      
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        if (key === 'action') continue
        if (key === 'customData' && typeof value === 'string') {
          try {
            body[key] = JSON.parse(value)
          } catch {
            body[key] = value
          }
        } else if (key === 'attachments') {
          if (!body[key]) body[key] = []
          body[key].push(value)
        } else {
          body[key] = value
        }
      }
    } else {
      // Handle JSON
      body = await request.json()
      action = body.action
      delete body.action
    }

    switch (action) {
      case 'send-single':
        return await sendSingleEmail(body)
      case 'send-bulk':
        return await sendBulkEmails(body)
      case 'create-campaign':
        return await createCampaign(body)
      case 'send-campaign':
        return await sendCampaign(body.campaignId)
      case 'test-email':
        return await testEmailConfiguration()
      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Something went wrong. Please try again later.' 
    }, { status: 500 })
  }
}

// PUT - Update campaigns or email settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'update-campaign':
        return await updateCampaign(data)
      case 'pause-campaign':
        return await pauseCampaign(data.campaignId)
      case 'resume-campaign':
        return await resumeCampaign(data.campaignId)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete campaigns or email records
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')

    switch (action) {
      case 'delete-campaign':
        if (!id) {
          return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
        }
        return await deleteCampaign(parseInt(id))
      case 'delete-email':
        if (!id) {
          return NextResponse.json({ error: 'Email ID required' }, { status: 400 })
        }
        return await deleteEmail(parseInt(id))
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Default data when database is not ready
function getDefaultData() {
  return {
    dashboard: {
      totalEmails: 0,
      totalCampaigns: 0,
      templateCount: 0,
      statusStats: {},
      recentEmails: []
    },
    analytics: {
      period: '30 days',
      totalSent: 0,
      emailsLast30Days: 0,
      openRate: '0',
      clickRate: '0',
      bounceRate: '0',
      deliveryRate: '0',
      topTemplates: [],
      emailTrends: []
    },
    campaigns: [],
    templates: [],
    emails: []
  }
}

// Helper functions
async function getEmailDashboard() {
  try {
    const [
      totalEmails,
      totalCampaigns,
      recentEmails,
      campaignStats,
      templateCount
    ] = await Promise.all([
      prisma.emailSent.count(),
      prisma.emailCampaign.count(),
      prisma.emailSent.findMany({
        take: 10,
        orderBy: { sentAt: 'desc' },
        include: { campaign: true, template: true }
      }),
      prisma.emailCampaign.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.emailTemplate.count()
    ])

    const statusStats = campaignStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      dashboard: {
        totalEmails,
        totalCampaigns,
        templateCount,
        statusStats,
        recentEmails
      }
    })
  } catch (error) {
    console.error('Error getting dashboard data:', error)
    return NextResponse.json({
      dashboard: {
        totalEmails: 0,
        totalCampaigns: 0,
        templateCount: 1,
        statusStats: {},
        recentEmails: []
      }
    })
  }
}

async function getEmailAnalytics() {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      emailsLast30Days,
      openRate,
      clickRate,
      bounceRate,
      deliveryRate,
      topTemplates,
      emailTrends
    ] = await Promise.all([
      prisma.emailSent.count({
        where: { sentAt: { gte: thirtyDaysAgo } }
      }),
      prisma.emailSent.count({
        where: { status: 'opened', sentAt: { gte: thirtyDaysAgo } }
      }),
      prisma.emailSent.count({
        where: { status: 'clicked', sentAt: { gte: thirtyDaysAgo } }
      }),
      prisma.emailSent.count({
        where: { status: 'bounced', sentAt: { gte: thirtyDaysAgo } }
      }),
      prisma.emailSent.count({
        where: { status: 'delivered', sentAt: { gte: thirtyDaysAgo } }
      }),
      prisma.emailSent.groupBy({
        by: ['templateId'],
        where: { sentAt: { gte: thirtyDaysAgo } },
        _count: { templateId: true },
        orderBy: { _count: { templateId: 'desc' } },
        take: 5
      }),
      prisma.$queryRaw`
        SELECT DATE(sent_at) as date, COUNT(*) as count
        FROM emails_sent
        WHERE sent_at >= ${thirtyDaysAgo}
        GROUP BY DATE(sent_at)
        ORDER BY date DESC
        LIMIT 30
      `
    ])

    const totalSent = await prisma.emailSent.count({
      where: { sentAt: { gte: thirtyDaysAgo } }
    })

    // Convert BigInt values to regular numbers
    const processedTopTemplates = topTemplates.map(template => ({
      templateId: Number(template.templateId),
      count: Number(template._count.templateId)
    }))

    const processedEmailTrends = emailTrends.map((trend: any) => ({
      date: trend.date,
      count: Number(trend.count)
    }))

    return NextResponse.json({
      analytics: {
        period: '30 days',
        totalSent,
        emailsLast30Days,
        openRate: totalSent > 0 ? (openRate / totalSent * 100).toFixed(2) : '0',
        clickRate: totalSent > 0 ? (clickRate / totalSent * 100).toFixed(2) : '0',
        bounceRate: totalSent > 0 ? (bounceRate / totalSent * 100).toFixed(2) : '0',
        deliveryRate: totalSent > 0 ? (deliveryRate / totalSent * 100).toFixed(2) : '0',
        topTemplates: processedTopTemplates,
        emailTrends: processedEmailTrends
      }
    })
  } catch (error) {
    console.error('Error getting analytics data:', error)
    return NextResponse.json({
      analytics: {
        period: '30 days',
        totalSent: 0,
        emailsLast30Days: 0,
        openRate: '0',
        clickRate: '0',
        bounceRate: '0',
        deliveryRate: '0',
        topTemplates: [],
        emailTrends: []
      }
    })
  }
}

async function getCampaigns(page: number, limit: number, status?: string | null) {
  try {
    const skip = (page - 1) * limit
    const where = status ? { status } : {}

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          template: true,
          creator: { include: { profile: true } }
        }
      }),
      prisma.emailCampaign.count({ where })
    ])

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error getting campaigns data:', error)
    return NextResponse.json({
      campaigns: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    })
  }
}

async function getCampaignStats(campaignId: number) {
  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      include: { template: true }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const stats = await EmailAnalytics.getCampaignStats(campaignId)
    const recentEmails = await prisma.emailSent.findMany({
      where: { campaignId },
      take: 10,
      orderBy: { sentAt: 'desc' }
    })

    return NextResponse.json({
      campaign,
      stats,
      recentEmails
    })
  } catch (error) {
    console.error('Error getting campaign stats:', error)
    return NextResponse.json({ error: 'Failed to get campaign stats' }, { status: 500 })
  }
}

async function getRecentEmails(page: number, limit: number) {
  try {
    const skip = (page - 1) * limit

    const [emails, total] = await Promise.all([
      prisma.emailSent.findMany({
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: {
          campaign: true,
          template: true,
          creator: { include: { profile: true } }
        }
      }),
      prisma.emailSent.count()
    ])

    return NextResponse.json({
      emails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error getting recent emails:', error)
    return NextResponse.json({
      emails: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    })
  }
}

async function getEmailTemplates() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error getting templates:', error)
    // Return default templates when database is not available
    return NextResponse.json({ 
      templates: [
        {
          id: 1,
          name: 'Custom Email',
          slug: 'custom',
          subject: 'Custom Message',
          htmlContent: '<p>Custom email content</p>',
          isSystem: true,
          isActive: true
        }
      ] 
    })
  }
}

async function sendSingleEmail(data: any) {
  try {
    const { to, template, subject, customData, customMessage, attachments } = data

    if (!to) {
      return NextResponse.json({ 
        success: false, 
        message: 'Recipient email is required' 
      }, { status: 400 })
    }

    // Process attachments if provided
    let processedAttachments = []
    if (attachments && Array.isArray(attachments)) {
      processedAttachments = await Promise.all(attachments.map(async (file: File) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
        contentType: file.type || 'application/octet-stream'
      })))
    }

    // Prepare custom data with HTML content support
    // Handle both customData.message and direct customMessage
    const messageContent = customMessage || customData?.message || ''
    const isHtml = customData?.isHtml || false
    
    const emailData = {
      customMessage: messageContent,
      subject: subject || 'Message from Samba Tours Uganda'
    }

    const result = await sendEmail({
      to,
      template: 'custom', // Always use custom template for admin emails
      data: emailData,
      subject,
      attachments: processedAttachments
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully',
        result 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.error || 'Failed to send email' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error sending single email:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to send email. Please try again later.' 
    }, { status: 500 })
  }
}

async function sendBulkEmails(data: any) {
  try {
    const { recipients, template, subject, customData, attachments } = data

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Valid recipients array is required' 
      }, { status: 400 })
    }

    if (!template) {
      return NextResponse.json({ 
        success: false, 
        message: 'Template is required' 
      }, { status: 400 })
    }

    const results = await sendBulkEmail(recipients, {
      template,
      data: customData || {},
      subject,
      attachments
    })

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount
      }
    })
  } catch (error) {
    console.error('Error sending bulk emails:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to send bulk emails. Please try again later.' 
    }, { status: 500 })
  }
}

async function createCampaign(data: any) {
  try {
    const { name, description, templateId, subject, customData, scheduledAt } = data

    if (!name || !templateId || !subject) {
      return NextResponse.json({ error: 'Name, template, and subject required' }, { status: 400 })
    }

    // Ensure templateId is converted to integer
    const parsedTemplateId = parseInt(templateId, 10)
    if (isNaN(parsedTemplateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }

    console.log('Creating campaign with templateId:', parsedTemplateId, 'type:', typeof parsedTemplateId)

    const campaign = await EmailCampaignService.createCampaign({
      name,
      description,
      templateId: parsedTemplateId,
      subject,
      customData,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}

async function sendCampaign(campaignId: number) {
  try {
    await EmailCampaignService.sendCampaign(campaignId)
    return NextResponse.json({ success: true, message: 'Campaign sent successfully' })
  } catch (error) {
    console.error('Error sending campaign:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

async function updateCampaign(data: any) {
  try {
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 })
    }

    const campaign = await prisma.emailCampaign.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
  }
}

async function pauseCampaign(campaignId: number) {
  try {
    const campaign = await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'paused' }
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Error pausing campaign:', error)
    return NextResponse.json({ error: 'Failed to pause campaign' }, { status: 500 })
  }
}

async function resumeCampaign(campaignId: number) {
  try {
    const campaign = await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'scheduled' }
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Error resuming campaign:', error)
    return NextResponse.json({ error: 'Failed to resume campaign' }, { status: 500 })
  }
}

async function deleteCampaign(campaignId: number) {
  try {
    await prisma.emailCampaign.delete({
      where: { id: campaignId }
    })

    return NextResponse.json({ success: true, message: 'Campaign deleted' })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}

async function deleteEmail(emailId: number) {
  try {
    await prisma.emailSent.delete({
      where: { id: emailId }
    })

    return NextResponse.json({ success: true, message: 'Email deleted' })
  } catch (error) {
    console.error('Error deleting email:', error)
    return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 })
  }
}

async function testEmailConfiguration() {
  try {
    const { verifyEmailConfig } = await import('@/lib/email-service')
    const isValid = await verifyEmailConfig()
    
    if (isValid) {
      return NextResponse.json({ success: true, message: 'Email configuration is valid' })
    } else {
      return NextResponse.json({ error: 'Email configuration is invalid' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error testing email configuration:', error)
    return NextResponse.json({ error: 'Failed to verify email configuration' }, { status: 500 })
  }
} 
