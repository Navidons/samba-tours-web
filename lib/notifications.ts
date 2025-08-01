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
    await sendEmail(adminEmail, 'custom', {
      customMessage: `Contact inquiry from ${data.name}: ${data.message}`,
      subject: 'New Contact Inquiry'
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
    await sendEmail(adminEmail, 'custom', {
      customMessage: `Payment received: ${data.customerName} paid ${data.amount} for ${data.tourName}`,
      subject: 'Payment Notification'
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending payment confirmation notification:', error)
    return { success: false, error }
  }
}

export async function sendTourReminderNotification(data: TourReminderData) {
  try {
    await sendEmail(data.customerEmail, 'custom', {
      customMessage: `Tour reminder: ${data.tourName} starts on ${data.startDate}`,
      subject: 'Tour Reminder'
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
    
    // Send using the basic email function
    await sendEmail(adminEmail, 'custom', {
      customMessage: message,
      subject: `Admin Alert: ${subject}`
    })

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
      customMessage: content,
      subject: subject
    }

    // Send to each recipient
    for (const recipient of recipients) {
      await sendEmail(recipient, 'custom', emailData)
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending bulk newsletter notification:', error)
    return { success: false, error }
  }
} 
