# Email Setup Guide for Samba Tours Website

This guide will help you set up Gmail SMTP for sending emails from your Samba Tours website.

## Prerequisites

1. A Gmail account
2. Gmail App Password (not your regular password)

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

## Step 2: Generate App Password

1. In your Google Account settings, go to "Security"
2. Find "App passwords" (only visible if 2FA is enabled)
3. Click "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Enter a name like "Samba Tours Website"
6. Click "Generate"
7. **Copy the 16-character password** (you won't see it again!)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/samba_tours_db"

# Gmail SMTP Configuration
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"

# Application
NEXT_PUBLIC_APP_URL="https://sambatours.co"

# Admin Email (for notifications)
ADMIN_EMAIL="admin@sambatours.com"

# Optional: Email configuration
EMAIL_FROM_NAME="Samba Tours Uganda"
EMAIL_REPLY_TO="info@sambatours.com"
```

## Step 4: Test Email Configuration

1. Start your development server: `pnpm dev`
2. Go to `/admin/email` in your browser
3. Click "Test Email Configuration" to verify your settings
4. Send a test email to yourself using the "Send Test Email" form

## Email Templates Available

The system includes the following email templates:

### 1. Contact Confirmation
- **Trigger**: When someone submits a contact form
- **Recipient**: Customer
- **Content**: Thank you message with inquiry details

### 2. Contact Notification (Admin)
- **Trigger**: When someone submits a contact form
- **Recipient**: Admin
- **Content**: New inquiry alert with customer details

### 3. Newsletter Confirmation
- **Trigger**: When someone subscribes to newsletter
- **Recipient**: Subscriber
- **Content**: Welcome message with subscription benefits

### 4. Booking Confirmation
- **Trigger**: When a booking is confirmed
- **Recipient**: Customer
- **Content**: Booking details and next steps

### 5. Password Reset
- **Trigger**: When user requests password reset
- **Recipient**: User
- **Content**: Reset link and security information

## Email Integration Points

The email system is integrated with the following features:

### Contact Form (`/contact`)
- Sends confirmation to customer
- Sends notification to admin

### Newsletter Subscription (Footer)
- Sends welcome email to new subscribers

### Future Integrations
- Booking confirmations
- Payment notifications
- Tour reminders
- Password reset functionality

## Admin Email Management

Access the email management panel at `/admin/email` to:

- Test email configuration
- Send test emails
- View available templates
- Monitor email functionality

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Make sure you're using the App Password, not your regular Gmail password
   - Verify 2-Factor Authentication is enabled

2. **"Less secure app access" error**
   - This is normal - Gmail will show this warning for app passwords
   - The app password is secure and recommended by Google

3. **Emails not sending**
   - Check your environment variables are correct
   - Verify the Gmail account has SMTP access enabled
   - Check the server logs for detailed error messages

4. **Emails going to spam**
   - This is common for new email setups
   - Add your Gmail address to the recipient's contacts
   - Consider using a domain email address for production

### Testing Email Configuration

Use the test endpoint to verify your setup:

```bash
# Test configuration
curl http://localhost:3000/api/test-email

# Send test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "template": "contactConfirmation",
    "data": {
      "name": "Test User",
      "email": "test@example.com",
      "tourType": "Gorilla Trekking",
      "message": "Test message"
    }
  }'
```

## Production Considerations

1. **Use a domain email address** instead of Gmail for production
2. **Set up SPF, DKIM, and DMARC** records for better deliverability
3. **Monitor email logs** for delivery issues
4. **Consider using an email service** like SendGrid or Mailgun for high volume
5. **Implement email queuing** for better performance

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your app passwords
- Monitor for unusual email activity

## Support

If you encounter issues:

1. Check the server logs for error messages
2. Verify your Gmail settings
3. Test with the email management panel
4. Check the troubleshooting section above

For additional help, refer to the Gmail SMTP documentation or contact your development team. 
