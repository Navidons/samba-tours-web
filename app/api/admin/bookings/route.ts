import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Build where clause
    const where: any = {}
    
    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { bookingReference: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get bookings with pagination
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          tour: {
            select: {
              id: true,
              title: true,
              slug: true,
              duration: true,
              locationCountry: true,
              locationRegion: true,
              price: true,
              featuredImageData: true,
              featuredImageName: true,
              featuredImageType: true
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              country: true,
              city: true,
              totalBookings: true,
              totalSpent: true,
              customerType: true,
              loyaltyPoints: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          guests: {
            select: {
              id: true,
              guestName: true,
              guestAge: true,
              dietaryRestrictions: true,
              medicalConditions: true,
              passportNumber: true,
              nationality: true,
              emergencyContact: true,
              createdAt: true
            }
          },
          communications: {
            select: {
              id: true,
              communicationType: true,
              communicationDate: true,
              staffMember: true,
              subject: true,
              message: true,
              outcome: true,
              nextFollowUpDate: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' }
          },
          payments: {
            select: {
              id: true,
              paymentReference: true,
              amount: true,
              currency: true,
              paymentMethod: true,
              paymentProvider: true,
              status: true,
              paymentDate: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.booking.count({ where })
    ])

    // Transform the data to match our Booking interface
    const transformedBookings = bookings.map((booking) => ({
      id: booking.id,
      booking_reference: booking.bookingReference || '',
      tour_id: booking.tourId,
      user_id: booking.userId,
      customer_id: booking.customerId,
      customer_name: booking.customerName || '',
      customer_email: booking.customerEmail || '',
      customer_phone: booking.customerPhone || '',
      customer_country: booking.customerCountry || '',
      start_date: booking.startDate.toISOString(),
      end_date: booking.endDate.toISOString(),
      guests: booking.guestCount, // Using guestCount from Prisma schema
      total_amount: Number(booking.totalAmount),
      discount_amount: Number(booking.discountAmount),
      final_amount: Number(booking.finalAmount),
      special_requests: booking.specialRequests || '',
      status: booking.status,
      payment_status: booking.paymentStatus || "pending",
      cancellation_reason: booking.cancellationReason || '',
      staff_notes: booking.staffNotes || '',
      contact_method: booking.contactMethod,
      preferred_contact_time: booking.preferredContactTime || '',
      email_sent: booking.emailSent,
      email_sent_at: booking.emailSentAt?.toISOString(),
      created_at: booking.createdAt.toISOString(),
      updated_at: booking.updatedAt.toISOString(),
      // Create items array from tour data for compatibility
      items: [{
        id: booking.tour?.id || 0,
        tour_title: booking.tour?.title || "Unknown Tour",
        travel_date: booking.startDate.toISOString(),
        number_of_guests: booking.guestCount,
        tour_price: booking.tour?.price ? Number(booking.tour.price) : 0,
        total_price: Number(booking.totalAmount)
      }],
      // Add tour information for details view
      tour: booking.tour ? {
        id: booking.tour.id,
        title: booking.tour.title,
        slug: booking.tour.slug,
        duration: booking.tour.duration,
        location_country: booking.tour.locationCountry,
        location_region: booking.tour.locationRegion,
        price: Number(booking.tour.price),
        featured_image_data: booking.tour.featuredImageData ? Buffer.from(booking.tour.featuredImageData).toString('base64') : null,
        featured_image_name: booking.tour.featuredImageName,
        featured_image_type: booking.tour.featuredImageType
      } : null,
      // Add customer information
      customer: booking.customer ? {
        id: booking.customer.id,
        name: booking.customer.name,
        email: booking.customer.email,
        phone: booking.customer.phone,
        country: booking.customer.country,
        city: booking.customer.city,
        total_bookings: booking.customer.totalBookings,
        total_spent: Number(booking.customer.totalSpent),
        customer_type: booking.customer.customerType,
        loyalty_points: booking.customer.loyaltyPoints
      } : null,
      // Add user information
      user: booking.user ? {
        id: booking.user.id,
        email: booking.user.email,
        full_name: booking.user.profile?.fullName || `${booking.user.profile?.firstName || ''} ${booking.user.profile?.lastName || ''}`.trim()
      } : null,
      guests: booking.guests.map(guest => ({
        id: guest.id,
        guest_name: guest.guestName || '',
        guest_age: guest.guestAge,
        dietary_restrictions: guest.dietaryRestrictions || '',
        medical_conditions: guest.medicalConditions || '',
        passport_number: guest.passportNumber || '',
        nationality: guest.nationality || '',
        emergency_contact: guest.emergencyContact || '',
        created_at: guest.createdAt.toISOString()
      })),
      communications: booking.communications.map(comm => ({
        id: comm.id,
        communication_type: comm.communicationType,
        communication_date: comm.communicationDate.toISOString(),
        staff_member: comm.staffMember || '',
        subject: comm.subject || '',
        message: comm.message || '',
        outcome: comm.outcome || '',
        next_follow_up_date: comm.nextFollowUpDate?.toISOString(),
        created_at: comm.createdAt.toISOString()
      })),
      payments: booking.payments.map(payment => ({
        id: payment.id,
        payment_reference: payment.paymentReference,
        amount: Number(payment.amount),
        currency: payment.currency,
        payment_method: payment.paymentMethod,
        payment_provider: payment.paymentProvider,
        status: payment.status,
        payment_date: payment.paymentDate.toISOString(),
        created_at: payment.createdAt.toISOString()
      }))
    }))

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
      total,
      page,
      limit,
      hasMore: total > page * limit,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
