import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'
import { emailTemplates } from './email'

const prisma = new PrismaClient()

// Email configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  pool: true, // Use pooled connection
  maxConnections: 5, // Maximum number of connections to pool
  maxMessages: 100, // Maximum number of messages per connection
  rateLimit: 10, // Messages per second
}

// Create transporter with pooling
const transporter = nodemailer.createTransport(emailConfig)

export interface EmailAttachment {
  filename: string
  content: Buffer
  contentType: string
}

export interface EmailData {
  to: string
  template: keyof typeof emailTemplates
  data: any
  subject?: string
  attachments?: EmailAttachment[]
  campaignId?: number
  userId?: number
  priority?: 'low' | 'normal' | 'high'
  scheduledAt?: Date
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: any
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'
}

// Template slug to key mapping
const templateSlugToKey: Record<string, keyof typeof emailTemplates> = {
  'contact-confirmation': 'contactConfirmation',
  'contact-notification': 'contactNotification',
  'newsletter-welcome': 'newsletterConfirmation',
  'booking-confirmation': 'bookingConfirmation',
  'password-reset': 'passwordReset',
  'custom': 'custom'
}

// Get template key from slug
function getTemplateKey(slug: string): keyof typeof emailTemplates {
  return templateSlugToKey[slug] || 'custom'
}

// Email Queue Management
class EmailQueue {
  private queue: EmailData[] = []
  private processing = false
  private retryAttempts = new Map<string, number>()
  private maxRetries = 3

  async addToQueue(emailData: EmailData): Promise<string> {
    const messageId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Convert template slug to template key
    const templateKey = getTemplateKey(emailData.template as string)
    
    // Validate template exists
    if (!emailTemplates[templateKey]) {
      throw new Error(`Template '${emailData.template}' not found. Available templates: ${Object.keys(emailTemplates).join(', ')}`)
    }

    // Generate HTML content from template
    const emailTemplate = emailTemplates[templateKey](emailData.data)
    const htmlContent = emailData.data.customMessage || emailTemplate.html

    // Create database record first
    const templateId = await this.getTemplateId(templateKey)
    const emailRecord = await prisma.emailSent.create({
      data: {
        recipientEmail: emailData.to,
        templateId: templateId,
        subject: emailData.subject || emailTemplate.subject,
        htmlContent: htmlContent,
        status: 'pending',
        messageId: messageId,
        customData: emailData.data,
        campaignId: emailData.campaignId,
        createdBy: emailData.userId
      }
    })

    const queueItem = {
      ...emailData,
      template: templateKey,
      messageId,
      databaseId: emailRecord.id, // Store the database ID
      createdAt: new Date(),
      retryCount: 0
    }

    this.queue.push(queueItem)
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue()
    }

    return messageId
  }

  private async getTemplateId(templateName: string): Promise<number> {
    // Get or create template in database
    let template = await prisma.emailTemplate.findFirst({
      where: { slug: templateName }
    })

    if (!template) {
      template = await prisma.emailTemplate.create({
        data: {
          name: templateName,
          slug: templateName,
          subject: 'Default Subject',
          htmlContent: '<p>Default content</p>',
          isSystem: true
        }
      })
    }

    return template.id
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const emailData = this.queue.shift()
      if (!emailData) continue

      try {
        await this.sendEmail(emailData)
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000 / emailConfig.rateLimit))
      } catch (error) {
        console.error('Error processing email:', error)
        await this.handleRetry(emailData)
      }
    }

    this.processing = false
  }

  private async sendEmail(emailData: EmailData & { databaseId?: number }): Promise<void> {
    const emailTemplate = emailTemplates[emailData.template](emailData.data)
    
    const mailOptions: any = {
      from: `"Samba Tours Uganda" <${process.env.GMAIL_USER}>`,
      to: emailData.to,
      subject: emailData.subject || emailTemplate.subject,
      html: emailData.data.customMessage || emailTemplate.html,
    }

    if (emailData.attachments && emailData.attachments.length > 0) {
      mailOptions.attachments = emailData.attachments
    }

    const info = await transporter.sendMail(mailOptions)
    
    // Update database record using the correct ID
    if (emailData.databaseId) {
      await prisma.emailSent.update({
        where: { id: emailData.databaseId },
        data: {
          messageId: info.messageId,
          status: 'sent',
          sentAt: new Date()
        }
      })
    }

    console.log('Email sent successfully:', info.messageId)
  }

  private async handleRetry(emailData: EmailData & { databaseId?: number }): Promise<void> {
    const retryKey = emailData.messageId || emailData.to
    const attempts = this.retryAttempts.get(retryKey) || 0

    if (attempts < this.maxRetries) {
      this.retryAttempts.set(retryKey, attempts + 1)
      
      // Exponential backoff
      const delay = Math.pow(2, attempts) * 1000
      setTimeout(() => {
        this.queue.push(emailData)
        if (!this.processing) {
          this.processQueue()
        }
      }, delay)
    } else {
      // Mark as failed in database using the correct ID
      if (emailData.databaseId) {
        await prisma.emailSent.update({
          where: { id: emailData.databaseId },
          data: {
            status: 'failed',
            errorMessage: 'Max retry attempts exceeded'
          }
        })
      }
    }
  }
}

// Analytics and Tracking
export class EmailAnalytics {
  static async trackOpen(emailId: number, ipAddress?: string, userAgent?: string) {
    await prisma.emailSent.update({
      where: { id: emailId },
      data: {
        status: 'opened',
        openedAt: new Date(),
        ipAddress,
        userAgent
      }
    })
  }

  static async trackClick(emailId: number, link: string, ipAddress?: string, userAgent?: string) {
    await prisma.emailSent.update({
      where: { id: emailId },
      data: {
        status: 'clicked',
        clickedAt: new Date(),
        ipAddress,
        userAgent
      }
    })
  }

  static async getCampaignStats(campaignId: number) {
    const stats = await prisma.emailSent.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: { status: true }
    })

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)
  }

  static async getEmailStats(emailId: number) {
    return await prisma.emailSent.findUnique({
      where: { id: emailId },
      select: {
        id: true,
        status: true,
        sentAt: true,
        deliveredAt: true,
        openedAt: true,
        clickedAt: true,
        bouncedAt: true,
        errorMessage: true
      }
    })
  }
}

// Campaign Management
export class EmailCampaignService {
  static async createCampaign(data: {
    name: string
    description?: string
    templateId: number
    subject: string
    customData?: any
    scheduledAt?: Date
    userId?: number
  }) {
    return await prisma.emailCampaign.create({
      data: {
        name: data.name,
        description: data.description,
        templateId: data.templateId,
        subject: data.subject,
        customData: data.customData,
        scheduledAt: data.scheduledAt,
        createdBy: data.userId,
        status: 'draft'
      }
    })
  }

  static async addRecipientsToCampaign(campaignId: number, recipients: string[]) {
    const emails = recipients.map(email => ({
      campaignId,
      recipientEmail: email,
      status: 'pending'
    }))

    await prisma.emailSent.createMany({
      data: emails
    })
  }

  static async sendCampaign(campaignId: number) {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      include: { template: true }
    })

    if (!campaign) throw new Error('Campaign not found')

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'sending', sentAt: new Date() }
    })

    // Get pending emails for this campaign
    const pendingEmails = await prisma.emailSent.findMany({
      where: { campaignId, status: 'pending' }
    })

    // Add to queue
    const queue = new EmailQueue()
    for (const email of pendingEmails) {
      await queue.addToQueue({
        to: email.recipientEmail,
        template: campaign.template.slug as keyof typeof emailTemplates,
        data: campaign.customData || {},
        subject: campaign.subject,
        campaignId,
        userId: campaign.createdBy
      })
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { 
        status: 'sent',
        totalRecipients: pendingEmails.length
      }
    })
  }
}

// Main email service functions
export async function sendEmail(data: EmailData): Promise<EmailResult> {
  const queue = new EmailQueue()
  const messageId = await queue.addToQueue(data)
  
  return {
    success: true,
    messageId,
    status: 'pending'
  }
}

export async function sendBulkEmail(recipients: string[], data: Omit<EmailData, 'to'>): Promise<EmailResult[]> {
  const queue = new EmailQueue()
  const results: EmailResult[] = []

  for (const recipient of recipients) {
    try {
      const messageId = await queue.addToQueue({
        ...data,
        to: recipient
      })
      results.push({
        success: true,
        messageId,
        status: 'pending'
      })
    } catch (error) {
      results.push({
        success: false,
        error,
        status: 'failed'
      })
    }
  }

  return results
}

export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('Email configuration is valid')
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
}

// Cleanup function for graceful shutdown
export async function cleanup() {
  await transporter.close()
  await prisma.$disconnect()
} 