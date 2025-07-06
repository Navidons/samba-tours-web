import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.$transaction([
    prisma.emailSent.deleteMany(),
    prisma.emailCampaign.deleteMany(),
    prisma.emailTemplate.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.tourReview.deleteMany(),
    prisma.bookingGuest.deleteMany(),
    prisma.bookingCommunication.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.tourPhysicalRequirement.deleteMany(),
    prisma.tourBestTime.deleteMany(),
    prisma.tourItinerary.deleteMany(),
    prisma.tourExclusion.deleteMany(),
    prisma.tourInclusion.deleteMany(),
    prisma.tourHighlight.deleteMany(),
    prisma.tourImage.deleteMany(),
    prisma.tour.deleteMany(),
    prisma.tourCategory.deleteMany(),
    prisma.blogComment.deleteMany(),
    prisma.blogPostTagMapping.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.blogTag.deleteMany(),
    prisma.blogCategory.deleteMany(),
    prisma.galleryVideo.deleteMany(),
    prisma.galleryImage.deleteMany(),
    prisma.gallery.deleteMany(),
    prisma.galleryMediaLocation.deleteMany(),
    prisma.galleryMediaCategory.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
    prisma.contactInquiry.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
    prisma.userRole.deleteMany(),
  ])

  // Create user roles
  console.log('👥 Creating user roles...')
  const adminRole = await prisma.userRole.upsert({
    where: { roleName: 'admin' },
    update: {},
    create: {
      roleName: 'admin',
      description: 'Administrator with full access',
      permissions: { all: true }
    }
  })

  const userRole = await prisma.userRole.upsert({
    where: { roleName: 'user' },
    update: {},
    create: {
      roleName: 'user',
      description: 'Regular user',
      permissions: { read: true, write: false }
    }
  })

  // Create admin user
  console.log('👤 Creating admin user...')
  const hashedPassword = await hash('admin123', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@sambatours.com',
      passwordHash: hashedPassword,
      emailConfirmed: true,
      profile: {
        create: {
          fullName: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          phone: '+256700000000',
          country: 'Uganda',
          city: 'Kampala',
          roleId: adminRole.id,
          isActive: true
        }
      }
    }
  })

  // Create email templates
  console.log('📧 Creating email templates...')
  await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'Contact Confirmation',
        slug: 'contact-confirmation',
        description: 'Email sent to customers after they submit a contact form',
        subject: 'Thank you for your inquiry - Samba Tours Uganda',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Samba Tours Uganda</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your Gateway to Authentic Africa</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Thank you for your inquiry, {{name}}!</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                We've received your tour inquiry and our expert team is already working on creating a personalized 
                safari experience just for you.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
                <h3 style="color: #1f2937; margin: 0 0 10px 0;">Your Inquiry Details:</h3>
                <p style="color: #4b5563; margin: 5px 0;"><strong>Tour Type:</strong> {{tourType}}</p>
                <p style="color: #4b5563; margin: 5px 0;"><strong>Message:</strong> {{message}}</p>
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
                <a href="https://sambatours.com/tours" 
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
                © 2024 Samba Tours Uganda. All rights reserved.<br>
                Plot 123, Kampala Road, Kampala, Uganda
              </p>
            </div>
          </div>
        `,
        textContent: `Thank you for your inquiry, {{name}}! We've received your tour inquiry and our expert team is already working on creating a personalized safari experience just for you.`,
        variables: { name: 'string', tourType: 'string', message: 'string' },
        isActive: true,
        isSystem: true,
        createdBy: adminUser.id
      }
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Newsletter Welcome',
        slug: 'newsletter-welcome',
        description: 'Welcome email for new newsletter subscribers',
        subject: 'Welcome to Samba Tours Newsletter!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Samba Tours Uganda</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Newsletter Subscription Confirmed</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">
                Welcome to our adventure family{{#name}}, {{name}}{{/name}}!
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
                <a href="https://sambatours.com/tours" 
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
                © 2024 Samba Tours Uganda. All rights reserved.
              </p>
            </div>
          </div>
        `,
        textContent: `Welcome to our adventure family! Thank you for subscribing to our newsletter! You're now part of an exclusive community of adventure seekers who get first access to exclusive safari deals, insider tips, and stunning photos from recent tours.`,
        variables: { name: 'string' },
        isActive: true,
        isSystem: true,
        createdBy: adminUser.id
      }
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Booking Confirmation',
        slug: 'booking-confirmation',
        description: 'Email sent to customers after booking confirmation',
        subject: 'Booking Confirmed - {{tourName}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Booking Confirmed</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your adventure awaits!</p>
            </div>
            
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Congratulations, {{customerName}}!</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                Your booking has been confirmed and we're excited to welcome you to Uganda for an unforgettable adventure!
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">Booking Details:</h3>
                <p style="color: #4b5563; margin: 8px 0;"><strong>Booking ID:</strong> {{bookingId}}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>Tour:</strong> {{tourName}}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>Start Date:</strong> {{startDate}}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>End Date:</strong> {{endDate}}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>Participants:</strong> {{participants}}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>Total Amount:</strong> $' + '{{totalAmount}}' + '</p>
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
                <a href="https://sambatours.com/account" 
                   style="background: #1f2937; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View Booking Details
                </a>
              </div>
            </div>
            
            <div style="background: #1f2937; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                © 2024 Samba Tours Uganda. All rights reserved.
              </p>
            </div>
          </div>
        `,
        textContent: `Congratulations, {{customerName}}! Your booking has been confirmed and we're excited to welcome you to Uganda for an unforgettable adventure!`,
        variables: { 
          customerName: 'string', 
          bookingId: 'string', 
          tourName: 'string', 
          startDate: 'string', 
          endDate: 'string', 
          participants: 'number', 
          totalAmount: 'number' 
        },
        isActive: true,
        isSystem: true,
        createdBy: adminUser.id
      }
    })
  ])

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log('- 3 email templates created')
  console.log('\n🔑 Admin credentials:')
  console.log('Email: admin@sambatours.com')
  console.log('Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 