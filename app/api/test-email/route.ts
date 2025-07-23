import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const result = await sendEmail(
      email,
      'custom',
      {
        customMessage: `
          <h2>Test Email from Samba Tours</h2>
          <p>This is a test email to verify that the email system is working correctly.</p>
          <p>If you received this email, the email configuration is working!</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        `,
        subject: 'Test Email - Samba Tours'
      }
    )

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send test email' 
    }, { status: 500 })
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
