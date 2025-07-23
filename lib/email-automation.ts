import { PrismaClient } from '@prisma/client'
import { sendEmail, EmailCampaignService } from './email-service'

const prisma = new PrismaClient()

export interface AutomationTrigger {
  id: number
  name: string
  type: 'user_signup' | 'booking_confirmed' | 'payment_received' | 'tour_reminder' | 'abandoned_cart' | 'custom'
  conditions: any
  isActive: boolean
}

export interface AutomationWorkflow {
  id: number
  name: string
  triggerId: number
  templateId: number
  delay: number // minutes
  conditions: any
  isActive: boolean
  steps: AutomationStep[]
}

export interface AutomationStep {
  id: number
  workflowId: number
  order: number
  type: 'send_email' | 'wait' | 'condition' | 'webhook'
  config: any
}

export class EmailAutomationService {
  // Create automation trigger
  static async createTrigger(data: {
    name: string
    type: AutomationTrigger['type']
    conditions: any
    isActive?: boolean
  }) {
    return await prisma.emailAutomationTrigger.create({
      data: {
        name: data.name,
        type: data.type,
        conditions: data.conditions,
        isActive: data.isActive ?? true
      }
    })
  }

  // Create automation workflow
  static async createWorkflow(data: {
    name: string
    triggerId: number
    templateId: number
    delay: number
    conditions: any
    isActive?: boolean
  }) {
    return await prisma.emailAutomationWorkflow.create({
      data: {
        name: data.name,
        triggerId: data.triggerId,
        templateId: data.templateId,
        delay: data.delay,
        conditions: data.conditions,
        isActive: data.isActive ?? true
      }
    })
  }

  // Add step to workflow
  static async addWorkflowStep(data: {
    workflowId: number
    order: number
    type: AutomationStep['type']
    config: any
  }) {
    return await prisma.emailAutomationStep.create({
      data: {
        workflowId: data.workflowId,
        order: data.order,
        type: data.type,
        config: data.config
      }
    })
  }

  // Execute automation trigger
  static async executeTrigger(triggerType: AutomationTrigger['type'], data: any) {
    try {
      // Find active triggers for this type
      const triggers = await prisma.emailAutomationTrigger.findMany({
        where: {
          type: triggerType,
          isActive: true
        },
        include: {
          workflows: {
            where: { isActive: true },
            include: { steps: { orderBy: { order: 'asc' } } }
          }
        }
      })

      for (const trigger of triggers) {
        // Check if trigger conditions are met
        if (this.evaluateConditions(trigger.conditions, data)) {
          // Execute workflows for this trigger
          for (const workflow of trigger.workflows) {
            await this.executeWorkflow(workflow, data)
          }
        }
      }
    } catch (error) {
      console.error('Error executing automation trigger:', error)
    }
  }

  // Execute workflow
  static async executeWorkflow(workflow: any, data: any) {
    try {
      // Check workflow conditions
      if (!this.evaluateConditions(workflow.conditions, data)) {
        return
      }

      // Execute steps in order
      for (const step of workflow.steps) {
        await this.executeStep(step, data)
      }
    } catch (error) {
      console.error('Error executing workflow:', error)
    }
  }

  // Execute individual step
  static async executeStep(step: any, data: any) {
    try {
      switch (step.type) {
        case 'send_email':
          await this.executeEmailStep(step, data)
          break
        case 'wait':
          await this.executeWaitStep(step)
          break
        case 'condition':
          await this.executeConditionStep(step, data)
          break
        case 'webhook':
          await this.executeWebhookStep(step, data)
          break
        default:
          console.warn(`Unknown step type: ${step.type}`)
      }
    } catch (error) {
      console.error('Error executing step:', error)
    }
  }

  // Execute email step
  static async executeEmailStep(step: any, data: any) {
    const config = step.config
    const recipient = data.email || data.recipientEmail

    if (!recipient) {
      console.warn('No recipient email found for email step')
      return
    }

    await sendEmail({
      to: recipient,
      template: config.template,
      data: { ...data, ...config.templateData },
      subject: config.subject,
      attachments: config.attachments
    })
  }

  // Execute wait step
  static async executeWaitStep(step: any) {
    const delay = step.config.delay || 0
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay * 60 * 1000))
    }
  }

  // Execute condition step
  static async executeConditionStep(step: any, data: any) {
    const result = this.evaluateConditions(step.config.conditions, data)
    // Store condition result for next steps
    data.conditionResult = result
  }

  // Execute webhook step
  static async executeWebhookStep(step: any, data: any) {
    const config = step.config
    if (config.url) {
      try {
        await fetch(config.url, {
          method: config.method || 'POST',
          headers: config.headers || { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, ...config.body })
        })
      } catch (error) {
        console.error('Webhook execution failed:', error)
      }
    }
  }

  // Evaluate conditions
  static evaluateConditions(conditions: any, data: any): boolean {
    if (!conditions) return true

    // Simple condition evaluation - can be extended for complex logic
    for (const [key, value] of Object.entries(conditions)) {
      if (data[key] !== value) {
        return false
      }
    }
    return true
  }

  // Schedule delayed email
  static async scheduleDelayedEmail(data: {
    to: string
    template: string
    templateData: any
    delay: number // minutes
    subject?: string
  }) {
    const scheduledTime = new Date(Date.now() + data.delay * 60 * 1000)
    
    await prisma.scheduledEmail.create({
      data: {
        recipientEmail: data.to,
        templateSlug: data.template,
        templateData: data.templateData,
        subject: data.subject,
        scheduledAt: scheduledTime,
        status: 'pending'
      }
    })
  }

  // Process scheduled emails
  static async processScheduledEmails() {
    try {
      const now = new Date()
      const pendingEmails = await prisma.scheduledEmail.findMany({
        where: {
          status: 'pending',
          scheduledAt: { lte: now }
        }
      })

      for (const email of pendingEmails) {
        try {
          await sendEmail({
            to: email.recipientEmail,
            template: email.templateSlug as any,
            data: email.templateData,
            subject: email.subject
          })

          await prisma.scheduledEmail.update({
            where: { id: email.id },
            data: { status: 'sent', sentAt: new Date() }
          })
        } catch (error) {
          await prisma.scheduledEmail.update({
            where: { id: email.id },
            data: { 
              status: 'failed', 
              errorMessage: error.message,
              failedAt: new Date()
            }
          })
        }
      }
    } catch (error) {
      console.error('Error processing scheduled emails:', error)
    }
  }

  // Get automation statistics
  static async getAutomationStats() {
    const [
      totalTriggers,
      activeTriggers,
      totalWorkflows,
      activeWorkflows,
      scheduledEmails,
      automationEmails
    ] = await Promise.all([
      prisma.emailAutomationTrigger.count(),
      prisma.emailAutomationTrigger.count({ where: { isActive: true } }),
      prisma.emailAutomationWorkflow.count(),
      prisma.emailAutomationWorkflow.count({ where: { isActive: true } }),
      prisma.scheduledEmail.count({ where: { status: 'pending' } }),
      prisma.emailSent.count({ where: { campaignId: null } }) // Emails sent via automation
    ])

    return {
      totalTriggers,
      activeTriggers,
      totalWorkflows,
      activeWorkflows,
      scheduledEmails,
      automationEmails
    }
  }

  // Get workflow performance
  static async getWorkflowPerformance(workflowId: number) {
    const workflow = await prisma.emailAutomationWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        trigger: true,
        template: true,
        executions: {
          include: { emailSent: true }
        }
      }
    })

    if (!workflow) return null

    const totalExecutions = workflow.executions.length
    const successfulEmails = workflow.executions.filter(e => e.emailSent?.status === 'sent').length
    const openedEmails = workflow.executions.filter(e => e.emailSent?.status === 'opened').length
    const clickedEmails = workflow.executions.filter(e => e.emailSent?.status === 'clicked').length

    return {
      workflow,
      stats: {
        totalExecutions,
        successfulEmails,
        openedEmails,
        clickedEmails,
        successRate: totalExecutions > 0 ? (successfulEmails / totalExecutions * 100).toFixed(1) : '0',
        openRate: successfulEmails > 0 ? (openedEmails / successfulEmails * 100).toFixed(1) : '0',
        clickRate: successfulEmails > 0 ? (clickedEmails / successfulEmails * 100).toFixed(1) : '0'
      }
    }
  }
}

// Predefined automation triggers
export const AutomationTriggers = {
  // User signs up
  USER_SIGNUP: {
    name: 'User Signup',
    type: 'user_signup' as const,
    conditions: {}
  },

  // Booking is confirmed
  BOOKING_CONFIRMED: {
    name: 'Booking Confirmed',
    type: 'booking_confirmed' as const,
    conditions: {}
  },

  // Payment is received
  PAYMENT_RECEIVED: {
    name: 'Payment Received',
    type: 'payment_received' as const,
    conditions: {}
  },

  // Tour reminder (3 days before)
  TOUR_REMINDER: {
    name: 'Tour Reminder',
    type: 'tour_reminder' as const,
    conditions: { daysBefore: 3 }
  },

  // Abandoned cart
  ABANDONED_CART: {
    name: 'Abandoned Cart',
    type: 'abandoned_cart' as const,
    conditions: { hoursInactive: 24 }
  }
}

// Predefined automation workflows
export const AutomationWorkflows = {
  // Welcome series
  WELCOME_SERIES: {
    name: 'Welcome Series',
    steps: [
      {
        order: 1,
        type: 'send_email' as const,
        config: {
          template: 'newsletterConfirmation',
          subject: 'Welcome to Samba Tours!',
          templateData: {}
        }
      },
      {
        order: 2,
        type: 'wait' as const,
        config: { delay: 1440 } // 24 hours
      },
      {
        order: 3,
        type: 'send_email' as const,
        config: {
          template: 'custom',
          subject: 'Discover Our Best Tours',
          templateData: { customMessage: 'Here are our most popular tours...' }
        }
      }
    ]
  },

  // Booking confirmation
  BOOKING_CONFIRMATION: {
    name: 'Booking Confirmation',
    steps: [
      {
        order: 1,
        type: 'send_email' as const,
        config: {
          template: 'bookingConfirmation',
          subject: 'Your booking is confirmed!',
          templateData: {}
        }
      },
      {
        order: 2,
        type: 'wait' as const,
        config: { delay: 10080 } // 7 days
      },
      {
        order: 3,
        type: 'send_email' as const,
        config: {
          template: 'custom',
          subject: 'Preparing for your adventure',
          templateData: { customMessage: 'Get ready for your upcoming tour...' }
        }
      }
    ]
  }
} 
