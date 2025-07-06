import { NextRequest, NextResponse } from "next/server"
import { sendEmail, verifyEmailConfig } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Check if the request has files (FormData) or is JSON
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file attachments
      const formData = await request.formData()
      const email = formData.get('email') as string
      const template = formData.get('template') as string
      const data = JSON.parse(formData.get('data') as string)
      const subject = formData.get('subject') as string
      const message = formData.get('message') as string
      
      // Extract attachments
      const attachments: any[] = []
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('attachment-') && value instanceof File) {
          attachments.push({
            filename: value.name,
            content: Buffer.from(await value.arrayBuffer()),
            contentType: value.type
          })
        }
      }

      // Verify email configuration first
      const configValid = await verifyEmailConfig()
      if (!configValid) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Email configuration is invalid. Please check your Gmail settings." 
          },
          { status: 500 }
        )
      }

      // For custom messages, include the subject
      if (template === 'custom' && subject) {
        data.subject = subject
      }

      // Send test email with attachments
      const result = await sendEmail(email, template, data, attachments)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${email}`,
          messageId: result.messageId
        })
      } else {
        return NextResponse.json(
          { 
            success: false, 
            message: "Failed to send test email",
            error: result.error 
          },
          { status: 500 }
        )
      }
    } else {
      // Handle JSON requests (backward compatibility)
      const body = await request.json()
      const { email, template, data, subject } = body

      // Verify email configuration first
      const configValid = await verifyEmailConfig()
      if (!configValid) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Email configuration is invalid. Please check your Gmail settings." 
          },
          { status: 500 }
        )
      }

      // For custom messages, include the subject
      if (template === 'custom' && subject) {
        data.subject = subject
      }

      // Send test email
      const result = await sendEmail(email, template, data)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${email}`,
          messageId: result.messageId
        })
      } else {
        return NextResponse.json(
          { 
            success: false, 
            message: "Failed to send test email",
            error: result.error 
          },
          { status: 500 }
        )
      }
    }

  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Something went wrong while sending test email." 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Test email configuration
    const configValid = await verifyEmailConfig()
    
    return NextResponse.json({
      success: true,
      configValid,
      message: configValid 
        ? "Email configuration is valid" 
        : "Email configuration is invalid"
    })

  } catch (error) {
    console.error("Email config test error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to test email configuration" 
      },
      { status: 500 }
    )
  }
} 