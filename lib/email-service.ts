import nodemailer from 'nodemailer'
import { prisma } from './prisma'
import { emailTemplates } from './email'
import { env } from './config'

// Email configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
  // Reduce pool settings for production stability
  pool: true,
  maxConnections: 2, // Reduced from 5
  maxMessages: 50,   // Reduced from 100
  rateLimit: 5,      // Reduced from 10
  // Add TLS options for better security
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
}

// Create transporter with error handling
let transporter: nodemailer.Transporter | null = null

try {
  transporter = nodemailer.createTransport(emailConfig)
} catch (error) {
  console.error('Failed to create email transporter:', error)
}

// Verify transporter on startup
if (transporter) {
  transporter.verify()
    .then(() => console.log('Email transporter verified successfully'))
    .catch((error) => console.error('Email transporter verification failed:', error))
}

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
  'custom': 'custom',
  'admin-email': 'custom'
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
    const htmlContent = emailTemplate.html

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
    if (!transporter) {
      throw new Error('Email transporter not initialized')
    }

    const emailTemplate = emailTemplates[emailData.template](emailData.data)
    
    const mailOptions: any = {
      from: `"${env.EMAIL_FROM_NAME}" <${env.GMAIL_USER}>`,
      to: emailData.to,
      subject: emailData.subject || emailTemplate.subject,
      html: emailTemplate.html,
      replyTo: env.EMAIL_REPLY_TO || env.GMAIL_USER,
      headers: {
        'X-Environment': env.NODE_ENV,
        'X-Application': 'Samba Tours'
      }
    }

    if (emailData.attachments && emailData.attachments.length > 0) {
      mailOptions.attachments = emailData.attachments
    }

    try {
      // Verify transporter before sending
      await transporter.verify()
      
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
    } catch (error) {
      console.error('Failed to send email:', error)
      
      // Update database with error
      if (emailData.databaseId) {
        await prisma.emailSent.update({
          where: { id: emailData.databaseId },
          data: {
            status: 'failed',
            errorMessage: error.message || 'Failed to send email',
            updatedAt: new Date()
          }
        })
      }
      
      // Recreate transporter if it failed
      if (!transporter.isIdle()) {
        try {
          transporter = nodemailer.createTransport(emailConfig)
        } catch (e) {
          console.error('Failed to recreate email transporter:', e)
        }
      }
      
      throw error
    }
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
  try {
    // Get template key from slug
    const templateKey = getTemplateKey(data.template as string)
    
    // Validate template exists
    if (!emailTemplates[templateKey]) {
      throw new Error(`Template '${data.template}' not found. Available templates: ${Object.keys(emailTemplates).join(', ')}`)
    }

    // Generate email content
    const emailTemplate = emailTemplates[templateKey](data.data)
    // Use the template's HTML which should contain the custom message
    const htmlContent = emailTemplate.html
    const subject = data.subject || emailTemplate.subject

    // Prepare mail options
    const mailOptions: any = {
      from: `"Samba Tours Uganda" <${process.env.GMAIL_USER}>`,
      to: data.to,
      subject: subject,
      html: htmlContent,
    }

    if (data.attachments && data.attachments.length > 0) {
      mailOptions.attachments = data.attachments
    }

    // Send email directly
    const info = await transporter.sendMail(mailOptions)

    // Create database record
    const templateId = await getTemplateId(templateKey)
    const emailRecord = await prisma.emailSent.create({
      data: {
        recipientEmail: data.to,
        templateId: templateId,
        subject: subject,
        htmlContent: htmlContent,
        status: 'sent',
        messageId: info.messageId,
        customData: data.data,
        campaignId: data.campaignId,
        createdBy: data.userId,
        sentAt: new Date()
      }
    })

    return {
      success: true,
      messageId: info.messageId,
      status: 'sent'
    }
  } catch (error) {
    console.error('Error sending email:', error)
    
    // Create failed record
    try {
      const templateKey = getTemplateKey(data.template as string)
      const templateId = await getTemplateId(templateKey)
      await prisma.emailSent.create({
        data: {
          recipientEmail: data.to,
          templateId: templateId,
          subject: data.subject || 'Failed Email',
          htmlContent: '',
          status: 'failed',
          errorMessage: error.message,
          customData: data.data,
          campaignId: data.campaignId,
          createdBy: data.userId
        }
      })
    } catch (dbError) {
      console.error('Error creating failed email record:', dbError)
    }

    return {
      success: false,
      error: error.message,
      status: 'failed'
    }
  }
}

// Helper function to get template ID
async function getTemplateId(templateName: string): Promise<number> {
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
