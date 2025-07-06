import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            shortDescription: true,
            duration: true,
            groupSize: true,
            maxGroupSize: true,
            price: true,
            originalPrice: true,
            difficulty: true,
            locationCountry: true,
            locationRegion: true,
            locationCoordinatesLat: true,
            locationCoordinatesLng: true,
            featuredImageData: true,
            featuredImageName: true,
            featuredImageType: true,
            status: true,
            featured: true,
            popular: true,
            isNew: true,
            rating: true,
            reviewCount: true,
            viewCount: true,
            bookingCount: true,
            bestTime: true,
            physicalRequirements: true,
            whatToBring: true,
            createdAt: true,
            updatedAt: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true
              }
            }
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
            address: true,
            totalBookings: true,
            totalSpent: true,
            firstBookingDate: true,
            lastBookingDate: true,
            status: true,
            customerType: true,
            loyaltyPoints: true,
            preferredContactMethod: true,
            preferredContactTime: true,
            notes: true,
            joinDate: true,
            updatedAt: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
            profile: {
              select: {
                fullName: true,
                firstName: true,
                lastName: true,
                phone: true,
                country: true,
                city: true
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
            transactionId: true,
            status: true,
            gatewayResponse: true,
            paymentDate: true,
            refundDate: true,
            refundAmount: true,
            refundReason: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const transformedBooking = {
      id: booking.id,
      booking_reference: booking.bookingReference,
      tour_id: booking.tourId,
      user_id: booking.userId,
      customer_id: booking.customerId,
      customer_name: booking.customerName,
      customer_email: booking.customerEmail,
      customer_phone: booking.customerPhone,
      customer_country: booking.customerCountry,
      start_date: booking.startDate.toISOString(),
      end_date: booking.endDate.toISOString(),
      guests: booking.guestCount,
      total_amount: Number(booking.totalAmount),
      discount_amount: Number(booking.discountAmount),
      final_amount: Number(booking.finalAmount),
      special_requests: booking.specialRequests,
      status: booking.status,
      payment_status: booking.paymentStatus,
      cancellation_reason: booking.cancellationReason,
      staff_notes: booking.staffNotes,
      contact_method: booking.contactMethod,
      preferred_contact_time: booking.preferredContactTime,
      email_sent: booking.emailSent,
      email_sent_at: booking.emailSentAt?.toISOString(),
      created_at: booking.createdAt.toISOString(),
      updated_at: booking.updatedAt.toISOString(),
      tour: booking.tour ? {
        tour_id: booking.tour.id,
        title: booking.tour.title,
        slug: booking.tour.slug,
        description: booking.tour.description,
        short_description: booking.tour.shortDescription,
        duration: booking.tour.duration,
        group_size: booking.tour.groupSize,
        max_group_size: booking.tour.maxGroupSize,
        price: Number(booking.tour.price),
        original_price: booking.tour.originalPrice ? Number(booking.tour.originalPrice) : null,
        difficulty: booking.tour.difficulty,
        location_country: booking.tour.locationCountry,
        location_region: booking.tour.locationRegion,
        location_coordinates_lat: booking.tour.locationCoordinatesLat ? Number(booking.tour.locationCoordinatesLat) : null,
        location_coordinates_lng: booking.tour.locationCoordinatesLng ? Number(booking.tour.locationCoordinatesLng) : null,
        featured_image_data: booking.tour.featuredImageData ? Buffer.from(booking.tour.featuredImageData).toString('base64') : null,
        featured_image_name: booking.tour.featuredImageName,
        featured_image_type: booking.tour.featuredImageType,
        tour_status: booking.tour.status,
        featured: booking.tour.featured,
        popular: booking.tour.popular,
        is_new: booking.tour.isNew,
        rating: Number(booking.tour.rating),
        review_count: booking.tour.reviewCount,
        view_count: booking.tour.viewCount,
        booking_count: booking.tour.bookingCount,
        best_time: booking.tour.bestTime,
        physical_requirements: booking.tour.physicalRequirements,
        what_to_bring: booking.tour.whatToBring,
        tour_created_at: booking.tour.createdAt.toISOString(),
        tour_updated_at: booking.tour.updatedAt.toISOString(),
        category: booking.tour.category ? {
          category_id: booking.tour.category.id,
          category_name: booking.tour.category.name,
          slug: booking.tour.category.slug,
          description: booking.tour.category.description
        } : null
      } : null,
      customer: booking.customer ? {
        customer_id: booking.customer.id,
        customer_name: booking.customer.name,
        email: booking.customer.email,
        phone: booking.customer.phone,
        country: booking.customer.country,
        city: booking.customer.city,
        address: booking.customer.address,
        total_bookings: booking.customer.totalBookings,
        total_spent: Number(booking.customer.totalSpent),
        first_booking_date: booking.customer.firstBookingDate?.toISOString(),
        last_booking_date: booking.customer.lastBookingDate?.toISOString(),
        customer_status: booking.customer.status,
        customer_type: booking.customer.customerType,
        loyalty_points: booking.customer.loyaltyPoints,
        preferred_contact_method: booking.customer.preferredContactMethod,
        preferred_contact_time: booking.customer.preferredContactTime,
        notes: booking.customer.notes,
        join_date: booking.customer.joinDate.toISOString(),
        customer_updated_at: booking.customer.updatedAt.toISOString()
      } : null,
      user: booking.user ? {
        user_id: booking.user.id,
        email: booking.user.email,
        user_created_at: booking.user.createdAt.toISOString(),
        full_name: booking.user.profile?.fullName || `${booking.user.profile?.firstName || ''} ${booking.user.profile?.lastName || ''}`.trim(),
        phone: booking.user.profile?.phone,
        country: booking.user.profile?.country,
        city: booking.user.profile?.city
      } : null,
      guest_details: booking.guests.map(guest => ({
        guest_id: guest.id,
        guest_name: guest.guestName,
        guest_age: guest.guestAge,
        dietary_restrictions: guest.dietaryRestrictions,
        medical_conditions: guest.medicalConditions,
        passport_number: guest.passportNumber,
        nationality: guest.nationality,
        emergency_contact: guest.emergencyContact,
        guest_created_at: guest.createdAt.toISOString()
      })),
      communications: booking.communications.map(comm => ({
        comm_id: comm.id,
        communication_type: comm.communicationType,
        communication_date: comm.communicationDate.toISOString(),
        staff_member: comm.staffMember,
        subject: comm.subject,
        message: comm.message,
        outcome: comm.outcome,
        next_follow_up_date: comm.nextFollowUpDate?.toISOString(),
        comm_created_at: comm.createdAt.toISOString()
      })),
      payments: booking.payments.map(payment => ({
        payment_id: payment.id,
        payment_reference: payment.paymentReference,
        amount: Number(payment.amount),
        currency: payment.currency,
        payment_method: payment.paymentMethod,
        payment_provider: payment.paymentProvider,
        transaction_id: payment.transactionId,
        payment_status: payment.status,
        gateway_response: payment.gatewayResponse,
        payment_date: payment.paymentDate.toISOString(),
        refund_date: payment.refundDate?.toISOString(),
        refund_amount: payment.refundAmount ? Number(payment.refundAmount) : null,
        refund_reason: payment.refundReason,
        payment_created_at: payment.createdAt.toISOString(),
        payment_updated_at: payment.updatedAt.toISOString()
      }))
    }

    return NextResponse.json({ booking: transformedBooking })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const booking = await prisma.booking.update({
      where: { id: parseInt(params.id) },
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        customerCountry: body.customerCountry,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        guestCount: body.guests,
        totalAmount: body.totalAmount,
        finalAmount: body.totalAmount,
        discountAmount: body.discountAmount || 0,
        specialRequests: body.specialRequests,
        status: body.status,
        paymentStatus: body.paymentStatus,
        cancellationReason: body.cancellationReason,
        staffNotes: body.staffNotes,
        contactMethod: body.contactMethod,
        preferredContactTime: body.preferredContactTime,
        emailSent: body.emailSent,
        emailSentAt: body.emailSentAt ? new Date(body.emailSentAt) : null
      }
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const updateData: any = {}
    
    if (body.status) {
      updateData.status = body.status
    }
    
    if (body.payment_status) {
      updateData.paymentStatus = body.payment_status
    }

    if (body.customer_name) {
      updateData.customerName = body.customer_name
    }

    if (body.customer_email) {
      updateData.customerEmail = body.customer_email
    }

    if (body.customer_phone) {
      updateData.customerPhone = body.customer_phone
    }

    if (body.staff_notes) {
      updateData.staffNotes = body.staff_notes
    }

    if (body.special_requests) {
      updateData.specialRequests = body.special_requests
    }

    if (body.cancellation_reason) {
      updateData.cancellationReason = body.cancellation_reason
    }

    // Update the booking first
    const booking = await prisma.booking.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            price: true
          }
        }
      }
    })

    // Check if booking is confirmed and paid - if so, create/update customer record
    const newStatus = body.status || booking.status
    const newPaymentStatus = body.payment_status || booking.paymentStatus

    if (newStatus === 'confirmed' && newPaymentStatus === 'paid') {
      try {
        // Check if customer already exists
        const existingCustomer = await prisma.customer.findUnique({
          where: { email: booking.customerEmail },
          include: {
            bookings: {
              select: {
                id: true,
                totalAmount: true,
                createdAt: true
              }
            }
          }
        })

        if (existingCustomer) {
          // Update existing customer
          const customerBookings = await prisma.booking.findMany({
            where: { 
              customerEmail: booking.customerEmail,
              status: 'confirmed',
              paymentStatus: 'paid'
            },
            select: {
              totalAmount: true,
              createdAt: true
            }
          })

          const totalSpent = customerBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0)
          const totalBookings = customerBookings.length
          const firstBookingDate = customerBookings.length > 0 
            ? customerBookings[customerBookings.length - 1].createdAt 
            : booking.createdAt
          const lastBookingDate = customerBookings.length > 0 
            ? customerBookings[0].createdAt 
            : booking.createdAt

          // Determine customer type based on booking count
          let customerType = 'new'
          if (totalBookings >= 5) customerType = 'vip'
          else if (totalBookings >= 2) customerType = 'repeat'
          else if (totalBookings >= 1) customerType = 'regular'

          // Calculate loyalty points (basic calculation: $1 = 1 point)
          const loyaltyPoints = Math.floor(totalSpent)

          await prisma.customer.update({
            where: { email: booking.customerEmail },
            data: {
              name: booking.customerName,
              phone: booking.customerPhone,
              country: booking.customerCountry,
              totalBookings: totalBookings,
              totalSpent: totalSpent,
              firstBookingDate: firstBookingDate,
              lastBookingDate: lastBookingDate,
              customerType: customerType as any,
              loyaltyPoints: loyaltyPoints,
              preferredContactMethod: booking.contactMethod,
              preferredContactTime: booking.preferredContactTime,
              status: 'active'
            }
          })

          console.log(`Updated existing customer: ${booking.customerEmail}`)
        } else {
          // Create new customer
          const customerType = 'new'
          const loyaltyPoints = Math.floor(Number(booking.totalAmount))

          await prisma.customer.create({
            data: {
              name: booking.customerName,
              email: booking.customerEmail,
              phone: booking.customerPhone,
              country: booking.customerCountry,
              city: booking.customerCountry, // Using country as city for now
              totalBookings: 1,
              totalSpent: Number(booking.totalAmount),
              firstBookingDate: booking.createdAt,
              lastBookingDate: booking.createdAt,
              customerType: customerType as any,
              loyaltyPoints: loyaltyPoints,
              preferredContactMethod: booking.contactMethod,
              preferredContactTime: booking.preferredContactTime,
              status: 'active'
            }
          })

          console.log(`Created new customer: ${booking.customerEmail}`)
        }

        // Update the booking to link to the customer
        await prisma.booking.update({
          where: { id: parseInt(params.id) },
          data: {
            customerId: existingCustomer?.id || (await prisma.customer.findUnique({
              where: { email: booking.customerEmail }
            }))?.id
          }
        })

      } catch (customerError) {
        console.error('Error creating/updating customer:', customerError)
        // Don't fail the booking update if customer creation fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      booking,
      customerCreated: newStatus === 'confirmed' && newPaymentStatus === 'paid'
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.booking.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
