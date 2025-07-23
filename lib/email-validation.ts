import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export interface EmailValidationResult {
  isValid: boolean
  score: number // 0-100, higher is better
  issues: string[]
  warnings: string[]
  suggestions: string[]
  spamScore: number // 0-10, lower is better
  deliverabilityScore: number // 0-100, higher is better
}

export interface EmailHealthMetrics {
  totalEmails: number
  deliveredRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  spamComplaints: number
  unsubscribes: number
  reputationScore: number
}

export class EmailValidationService {
  // Validate email address format
  static validateEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Check email domain reputation
  static async checkDomainReputation(domain: string): Promise<number> {
    try {
      // This would integrate with services like SenderScore, Barracuda, etc.
      // For now, return a mock score
      const mockScores: { [key: string]: number } = {
        'gmail.com': 95,
        'yahoo.com': 90,
        'hotmail.com': 85,
        'outlook.com': 88,
        'aol.com': 82
      }
      
      return mockScores[domain] || 70
    } catch (error) {
      console.error('Error checking domain reputation:', error)
      return 50 // Default to neutral score
    }
  }

  // Calculate spam score for email content
  static calculateSpamScore(subject: string, htmlContent: string): number {
    let score = 0
    const spamWords = [
      'free', 'money', 'cash', 'winner', 'prize', 'lottery', 'viagra', 'casino',
      'click here', 'buy now', 'limited time', 'act now', 'urgent', 'exclusive'
    ]
    
    const content = (subject + ' ' + htmlContent).toLowerCase()
    
    // Check for spam words
    spamWords.forEach(word => {
      if (content.includes(word)) {
        score += 1
      }
    })
    
    // Check for excessive capitalization
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
    if (capsRatio > 0.3) score += 2
    
    // Check for excessive exclamation marks
    const exclamationCount = (content.match(/!/g) || []).length
    if (exclamationCount > 3) score += 1
    
    // Check for suspicious links
    const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'goo.gl']
    suspiciousDomains.forEach(domain => {
      if (content.includes(domain)) score += 1
    })
    
    return Math.min(score, 10) // Cap at 10
  }

  // Validate email template
  static validateTemplate(template: {
    subject: string
    htmlContent: string
    textContent?: string
  }): EmailValidationResult {
    const issues: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []
    
    let score = 100
    
    // Subject line validation
    if (!template.subject || template.subject.trim().length === 0) {
      issues.push('Subject line is required')
      score -= 20
    } else if (template.subject.length > 50) {
      warnings.push('Subject line is longer than recommended (50 characters)')
      score -= 5
    }
    
    // HTML content validation
    if (!template.htmlContent || template.htmlContent.trim().length === 0) {
      issues.push('HTML content is required')
      score -= 30
    }
    
    // Check for required elements
    if (!template.htmlContent.includes('unsubscribe')) {
      warnings.push('Missing unsubscribe link')
      score -= 5
    }
    
    if (!template.htmlContent.includes('company address')) {
      warnings.push('Missing company address (required for CAN-SPAM compliance)')
      score -= 10
    }
    
    // Check for mobile responsiveness indicators
    if (!template.htmlContent.includes('@media') && !template.htmlContent.includes('viewport')) {
      suggestions.push('Consider adding mobile-responsive CSS')
    }
    
    // Check for alt text on images
    const imgTags = template.htmlContent.match(/<img[^>]*>/g) || []
    imgTags.forEach(img => {
      if (!img.includes('alt=')) {
        suggestions.push('Add alt text to images for better accessibility')
      }
    })
    
    // Calculate spam score
    const spamScore = this.calculateSpamScore(template.subject, template.htmlContent)
    if (spamScore > 5) {
      issues.push(`High spam score detected: ${spamScore}/10`)
      score -= 15
    } else if (spamScore > 3) {
      warnings.push(`Moderate spam score: ${spamScore}/10`)
      score -= 5
    }
    
    // Deliverability score (based on best practices)
    let deliverabilityScore = 100
    
    if (template.subject.length > 50) deliverabilityScore -= 10
    if (spamScore > 3) deliverabilityScore -= 20
    if (!template.htmlContent.includes('unsubscribe')) deliverabilityScore -= 15
    if (!template.htmlContent.includes('company address')) deliverabilityScore -= 10
    
    return {
      isValid: issues.length === 0,
      score: Math.max(score, 0),
      issues,
      warnings,
      suggestions,
      spamScore,
      deliverabilityScore: Math.max(deliverabilityScore, 0)
    }
  }

  // Test email deliverability
  static async testDeliverability(emailData: {
    to: string
    subject: string
    htmlContent: string
  }): Promise<{
    success: boolean
    messageId?: string
    error?: string
    checks: {
      format: boolean
      domain: boolean
      mx: boolean
      smtp: boolean
    }
  }> {
    const checks = {
      format: false,
      domain: false,
      mx: false,
      smtp: false
    }
    
    try {
      // Check email format
      checks.format = this.validateEmailFormat(emailData.to)
      if (!checks.format) {
        return {
          success: false,
          error: 'Invalid email format',
          checks
        }
      }
      
      // Extract domain
      const domain = emailData.to.split('@')[1]
      
      // Check domain reputation
      const reputation = await this.checkDomainReputation(domain)
      checks.domain = reputation > 50
      
      // Check MX records (simplified)
      checks.mx = true // In production, would check actual MX records
      
      // Test SMTP connection (simplified)
      checks.smtp = true // In production, would test actual SMTP connection
      
      // If all checks pass, attempt to send test email
      if (checks.format && checks.domain && checks.mx && checks.smtp) {
        const transporter = nodemailer.createTransporter({
          host: process.env.GMAIL_USER ? 'smtp.gmail.com' : 'localhost',
          port: 587,
          secure: false,
          auth: process.env.GMAIL_USER ? {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          } : undefined
        })
        
        const info = await transporter.sendMail({
          from: process.env.GMAIL_USER || 'test@example.com',
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.htmlContent
        })
        
        return {
          success: true,
          messageId: info.messageId,
          checks
        }
      }
      
      return {
        success: false,
        error: 'Deliverability checks failed',
        checks
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        checks
      }
    }
  }

  // Get email health metrics
  static async getEmailHealthMetrics(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<EmailHealthMetrics> {
    const now = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
    }
    
    const [
      totalEmails,
      deliveredEmails,
      openedEmails,
      clickedEmails,
      bouncedEmails,
      spamComplaints,
      unsubscribes
    ] = await Promise.all([
      prisma.emailSent.count({ where: { sentAt: { gte: startDate } } }),
      prisma.emailSent.count({ where: { status: 'delivered', sentAt: { gte: startDate } } }),
      prisma.emailSent.count({ where: { status: 'opened', sentAt: { gte: startDate } } }),
      prisma.emailSent.count({ where: { status: 'clicked', sentAt: { gte: startDate } } }),
      prisma.emailSent.count({ where: { status: 'bounced', sentAt: { gte: startDate } } }),
      prisma.emailSent.count({ where: { status: 'spam', sentAt: { gte: startDate } } }),
      prisma.newsletterSubscriber.count({ where: { unsubscribedAt: { gte: startDate } } })
    ])
    
    const deliveredRate = totalEmails > 0 ? (deliveredEmails / totalEmails) * 100 : 0
    const openRate = deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0
    const clickRate = deliveredEmails > 0 ? (clickedEmails / deliveredEmails) * 100 : 0
    const bounceRate = totalEmails > 0 ? (bouncedEmails / totalEmails) * 100 : 0
    
    // Calculate reputation score (simplified)
    let reputationScore = 100
    if (bounceRate > 5) reputationScore -= 20
    if (spamComplaints > 0) reputationScore -= 30
    if (deliveredRate < 90) reputationScore -= 15
    if (openRate < 20) reputationScore -= 10
    
    return {
      totalEmails,
      deliveredRate: parseFloat(deliveredRate.toFixed(1)),
      openRate: parseFloat(openRate.toFixed(1)),
      clickRate: parseFloat(clickRate.toFixed(1)),
      bounceRate: parseFloat(bounceRate.toFixed(1)),
      spamComplaints,
      unsubscribes,
      reputationScore: Math.max(reputationScore, 0)
    }
  }

  // Validate email list
  static async validateEmailList(emails: string[]): Promise<{
    valid: string[]
    invalid: string[]
    duplicates: string[]
    disposable: string[]
    report: {
      total: number
      valid: number
      invalid: number
      duplicates: number
      disposable: number
      validityRate: number
    }
  }> {
    const valid: string[] = []
    const invalid: string[] = []
    const duplicates: string[] = []
    const disposable: string[] = []
    const seen = new Set<string>()
    
    // Disposable email domains (simplified list)
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
      'throwaway.email', 'temp-mail.org', 'sharklasers.com', 'getairmail.com'
    ]
    
    emails.forEach(email => {
      const cleanEmail = email.trim().toLowerCase()
      
      // Check for duplicates
      if (seen.has(cleanEmail)) {
        duplicates.push(cleanEmail)
        return
      }
      seen.add(cleanEmail)
      
      // Check format
      if (!this.validateEmailFormat(cleanEmail)) {
        invalid.push(cleanEmail)
        return
      }
      
      // Check for disposable domains
      const domain = cleanEmail.split('@')[1]
      if (disposableDomains.includes(domain)) {
        disposable.push(cleanEmail)
        return
      }
      
      valid.push(cleanEmail)
    })
    
    const total = emails.length
    const validCount = valid.length
    const invalidCount = invalid.length
    const duplicateCount = duplicates.length
    const disposableCount = disposable.length
    const validityRate = total > 0 ? (validCount / total) * 100 : 0
    
    return {
      valid,
      invalid,
      duplicates,
      disposable,
      report: {
        total,
        valid: validCount,
        invalid: invalidCount,
        duplicates: duplicateCount,
        disposable: disposableCount,
        validityRate: parseFloat(validityRate.toFixed(1))
      }
    }
  }

  // Get email quality score
  static async getEmailQualityScore(emailId: number): Promise<{
    score: number
    factors: {
      deliverability: number
      engagement: number
      content: number
      timing: number
    }
    recommendations: string[]
  }> {
    const email = await prisma.emailSent.findUnique({
      where: { id: emailId },
      include: { template: true }
    })
    
    if (!email) {
      throw new Error('Email not found')
    }
    
    // Calculate deliverability factor
    let deliverability = 100
    if (email.status === 'bounced') deliverability = 0
    else if (email.status === 'failed') deliverability = 20
    else if (email.status === 'spam') deliverability = 10
    else if (email.status === 'delivered') deliverability = 80
    else if (email.status === 'opened') deliverability = 90
    else if (email.status === 'clicked') deliverability = 100
    
    // Calculate engagement factor
    let engagement = 0
    if (email.status === 'clicked') engagement = 100
    else if (email.status === 'opened') engagement = 60
    else if (email.status === 'delivered') engagement = 20
    
    // Calculate content factor (based on template validation)
    const contentValidation = this.validateTemplate({
      subject: email.subject,
      htmlContent: email.htmlContent
    })
    const content = contentValidation.score
    
    // Calculate timing factor (based on send time)
    const sendHour = email.sentAt.getHours()
    let timing = 50 // Default score
    if (sendHour >= 9 && sendHour <= 11) timing = 100 // Best time
    else if (sendHour >= 14 && sendHour <= 16) timing = 80 // Good time
    else if (sendHour >= 7 && sendHour <= 9) timing = 70 // Early morning
    else if (sendHour >= 18 && sendHour <= 20) timing = 60 // Evening
    
    // Calculate overall score
    const score = Math.round((deliverability + engagement + content + timing) / 4)
    
    // Generate recommendations
    const recommendations: string[] = []
    if (deliverability < 50) recommendations.push('Improve deliverability by checking sender reputation')
    if (engagement < 30) recommendations.push('Enhance email content to increase engagement')
    if (content < 70) recommendations.push('Review email template for best practices')
    if (timing < 60) recommendations.push('Consider sending emails during peak hours (9-11 AM)')
    
    return {
      score,
      factors: {
        deliverability,
        engagement,
        content,
        timing
      },
      recommendations
    }
  }
} 
