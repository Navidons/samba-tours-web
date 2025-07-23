import nodemailer from 'nodemailer'

// Email configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
}

// Create transporter
const transporter = nodemailer.createTransport(emailConfig)

// Email templates
export const emailTemplates = {
  // Contact form confirmation
  contactConfirmation: (data: {
    name: string
    email: string
    tourType: string
    message: string
  }) => ({
    subject: 'Thank you for your inquiry - Samba Tours Uganda',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Samba Tours Uganda</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Gateway to Authentic Africa</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Thank you for your inquiry, ${data.name}!</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            We've received your tour inquiry and our expert team is already working on creating a personalized 
            safari experience just for you.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0;">Your Inquiry Details:</h3>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Tour Type:</strong> ${data.tourType}</p>
            <p style="color: #4b5563; margin: 5px 0;"><strong>Message:</strong> ${data.message}</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0;">What happens next?</h3>
            <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Our travel experts will review your requirements within 2 hours</li>
              <li>We'll prepare a customized itinerary tailored to your preferences</li>
              <li>You'll receive a detailed proposal within 24 hours</li>
              <li>We'll schedule a call to discuss your adventure in detail</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sambatours.co/tours" 
               style="background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Explore Our Tours
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any urgent questions, please don't hesitate to call us at 
            <strong>+256 700 123 456</strong> or reply to this email.
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} Samba Tours Uganda. All rights reserved.<br>
            Plot 123, Kampala Road, Kampala, Uganda
          </p>
        </div>
      </div>
    `
  }),

  // Admin notification for new contact inquiry
  contactNotification: (data: {
    name: string
    email: string
    phone: string
    tourType: string
    message: string
    inquiryId: number
  }) => ({
    subject: `New Tour Inquiry - ${data.name} (${data.tourType})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 New Tour Inquiry</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">New inquiry received from ${data.name}</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Contact Information:</h3>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Name:</strong> ${data.name}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Email:</strong> ${data.email}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Tour Interest:</strong> ${data.tourType}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin: 0 0 10px 0;">Message:</h3>
            <p style="color: #92400e; line-height: 1.6; margin: 0;">${data.message}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/contact" 
               style="background: #1f2937; color: white; padding: 12px 25px; 
                      text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View in Admin Panel
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Inquiry ID: ${data.inquiryId} | Received: ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `
  }),

  // Newsletter subscription confirmation
  newsletterConfirmation: (data: { email: string; name?: string }) => ({
    subject: 'Welcome to Samba Tours Newsletter!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Samba Tours Uganda</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Newsletter Subscription Confirmed</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">
            Welcome to our adventure family${data.name ? `, ${data.name}` : ''}!
          </h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Thank you for subscribing to our newsletter! You're now part of an exclusive community of 
            adventure seekers who get first access to:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>🎯 Exclusive safari deals and early bird discounts</li>
              <li>🦍 Insider tips for gorilla trekking and wildlife viewing</li>
              <li>📸 Stunning photos and videos from recent tours</li>
              <li>🌍 Cultural insights and local stories</li>
              <li>📅 Best times to visit different destinations</li>
              <li>💡 Travel planning advice and packing tips</li>
            </ul>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0;">What to expect:</h3>
            <p style="color: #4b5563; margin: 0;">
              You'll receive our monthly newsletter with the latest updates, plus special announcements 
              for limited-time offers and new tour launches.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sambatours.co/tours" 
               style="background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Explore Our Tours
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you ever want to unsubscribe, you can do so by clicking the link at the bottom of any newsletter.
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} Samba Tours Uganda. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  // Booking confirmation
  bookingConfirmation: (data: {
    bookingId: string
    customerName: string
    tourName: string
    startDate: string
    endDate: string
    totalAmount: number
    participants: number
  }) => ({
    subject: `Booking Confirmed - ${data.tourName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Booking Confirmed</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your adventure awaits!</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Congratulations, ${data.customerName}!</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Your booking has been confirmed and we're excited to welcome you to Uganda for an unforgettable adventure!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Booking Details:</h3>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Tour:</strong> ${data.tourName}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Start Date:</strong> ${data.startDate}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>End Date:</strong> ${data.endDate}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Participants:</strong> ${data.participants}</p>
            <p style="color: #4b5563; margin: 8px 0;"><strong>Total Amount:</strong> $${data.totalAmount}</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0;">Next Steps:</h3>
            <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Complete your payment within 48 hours to secure your booking</li>
              <li>Check your email for detailed itinerary and packing list</li>
              <li>Contact us if you have any special requirements</li>
              <li>We'll send you pre-trip information 2 weeks before departure</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://sambatours.co/account" 
               style="background: #1f2937; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              View Booking Details
            </a>
          </div>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} Samba Tours Uganda. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  // Password reset
  passwordReset: (data: { name: string; resetLink: string }) => ({
    subject: 'Password Reset Request - Samba Tours',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Samba Tours Uganda</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${data.name},</h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" 
               style="background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request this password reset, 
              please ignore this email or contact our support team immediately.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${data.resetLink}" style="color: #f97316;">${data.resetLink}</a>
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} Samba Tours Uganda. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  // Custom message template
  custom: (data: { customMessage: string; subject?: string }) => {
    return {
    subject: data.subject || 'Message from Samba Tours Uganda',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Samba Tours Uganda</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Gateway to Authentic Africa</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
            ${data.customMessage ? data.customMessage : '<p>No custom message provided</p>'}
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            © ${new Date().getFullYear()} Samba Tours Uganda. All rights reserved.<br>
            Plot 123, Kampala Road, Kampala, Uganda
          </p>
        </div>
      </div>
    `
    }
  },

  // Aliases for frontend compatibility
  bookingConfirmed: function(data: {
    bookingId: string
    customerName: string
    tourName: string
    startDate: string
    endDate: string
    totalAmount: number
    participants: number
  }) { return emailTemplates.bookingConfirmation(data); },
  paymentConfirmation: function(data: { customMessage: string; subject?: string }) { return emailTemplates.custom(data); },
}

// Email sending function
export async function sendEmail(to: string, template: keyof typeof emailTemplates, data: any, attachments?: any[]) {
  try {
    const emailTemplate = emailTemplates[template](data)
    
    const mailOptions: any = {
      from: `"Samba Tours Uganda" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error }
  }
}

// Send to multiple recipients
export async function sendBulkEmail(recipients: string[], template: keyof typeof emailTemplates, data: any, attachments?: any[]) {
  try {
    const emailTemplate = emailTemplates[template](data)
    
    const mailOptions: any = {
      from: `"Samba Tours Uganda" <${process.env.GMAIL_USER}>`,
      to: recipients.join(', '),
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Bulk email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending bulk email:', error)
    return { success: false, error: error }
  }
}

// Verify email configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify()
    console.log('Email configuration is valid')
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
} 
