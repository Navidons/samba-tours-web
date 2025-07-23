import { sendEmail } from './email'

// Notification types
export type NotificationType = 
  | 'contact_inquiry'
  | 'newsletter_subscription'
  | 'booking_confirmation'
  | 'booking_cancellation'
  | 'payment_received'
  | 'tour_reminder'
  | 'password_reset'
  | 'admin_alert'

// Notification data interfaces
export interface ContactInquiryData {
  name: string
  email: string
  phone?: string
  tourType: string
  message: string
  inquiryId: number
}

export interface NewsletterSubscriptionData {
  email: string
  name?: string
}

export interface BookingData {
  bookingId: string
  customerName: string
  customerEmail: string
  tourName: string
  startDate: string
  endDate: string
  totalAmount: number
  participants: number
}

export interface PaymentData {
  paymentId: string
  customerName: string
  customerEmail: string
  amount: number
  tourName: string
  paymentMethod: string
}

export interface TourReminderData {
  customerName: string
  customerEmail: string
  tourName: string
  startDate: string
  departureTime: string
  meetingPoint: string
  guideName: string
  guidePhone: string
}

// Notification functions
export async function sendContactInquiryNotifications(data: ContactInquiryData) {
  try {
    // Send confirmation to customer
    await sendEmail(data.email, 'contactConfirmation', {
      name: data.name,
      email: data.email,
      tourType: data.tourType,
      message: data.message
    })

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sambatours.com'
    await sendEmail(adminEmail, 'contactNotification', {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      tourType: data.tourType,
      message: data.message,
      inquiryId: data.inquiryId
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending contact inquiry notifications:', error)
    return { success: false, error }
  }
}

export async function sendNewsletterSubscriptionNotification(data: NewsletterSubscriptionData) {
  try {
    await sendEmail(data.email, 'newsletterConfirmation', {
      email: data.email,
      name: data.name
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending newsletter subscription notification:', error)
    return { success: false, error }
  }
}

export async function sendBookingConfirmationNotification(data: BookingData) {
  try {
    await sendEmail(data.customerEmail, 'bookingConfirmation', {
      bookingId: data.bookingId,
      customerName: data.customerName,
      tourName: data.tourName,
      startDate: data.startDate,
      endDate: data.endDate,
      totalAmount: data.totalAmount,
      participants: data.participants
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending booking confirmation notification:', error)
    return { success: false, error }
  }
}

export async function sendPaymentConfirmationNotification(data: PaymentData) {
  try {
    // Send payment confirmation to customer
    await sendEmail(data.customerEmail, 'paymentConfirmation', {
      paymentId: data.paymentId,
      customerName: data.customerName,
      amount: data.amount,
      tourName: data.tourName,
      paymentMethod: data.paymentMethod
    })

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sambatours.com'
    await sendEmail(adminEmail, 'paymentNotification', {
      paymentId: data.paymentId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      tourName: data.tourName,
      paymentMethod: data.paymentMethod
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending payment confirmation notification:', error)
    return { success: false, error }
  }
}

export async function sendTourReminderNotification(data: TourReminderData) {
  try {
    await sendEmail(data.customerEmail, 'tourReminder', {
      customerName: data.customerName,
      tourName: data.tourName,
      startDate: data.startDate,
      departureTime: data.departureTime,
      meetingPoint: data.meetingPoint,
      guideName: data.guideName,
      guidePhone: data.guidePhone
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending tour reminder notification:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetNotification(email: string, name: string, resetLink: string) {
  try {
    await sendEmail(email, 'passwordReset', {
      name,
      resetLink
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending password reset notification:', error)
    return { success: false, error }
  }
}

export async function sendAdminAlertNotification(subject: string, message: string, alertType: 'error' | 'warning' | 'info' = 'info') {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sambatours.com'
    
    // For now, we'll use a simple email format for admin alerts
    // You can create a specific template for this in the email service
    const emailData = {
      subject: `Admin Alert: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${alertType === 'error' ? '#dc2626' : alertType === 'warning' ? '#f59e0b' : '#3b82f6'}; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Admin Alert</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">${subject}</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #4b5563; line-height: 1.6; margin: 0;">${message}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Alert Type: ${alertType.toUpperCase()} | Time: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    }

    // Send using the basic email function
    await sendEmail(adminEmail, 'adminAlert', emailData)

    return { success: true }
  } catch (error) {
    console.error('Error sending admin alert notification:', error)
    return { success: false, error }
  }
}

// Bulk notification functions
export async function sendBulkNewsletterNotification(recipients: string[], subject: string, content: string) {
  try {
    const emailData = {
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Samba Tours Uganda</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Newsletter</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${content}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://sambatours.com/tours" 
                 style="background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Explore Our Tours
              </a>
            </div>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 Samba Tours Uganda. All rights reserved.
            </p>
          </div>
        </div>
      `
    }

    // For bulk emails, you might want to use a different approach
    // This is a simplified version - in production, consider using a queue system
    for (const recipient of recipients) {
      await sendEmail(recipient, 'bulkNewsletter', emailData)
    }

    return { success: true, sentCount: recipients.length }
  } catch (error) {
    console.error('Error sending bulk newsletter notification:', error)
    return { success: false, error }
  }
} 
