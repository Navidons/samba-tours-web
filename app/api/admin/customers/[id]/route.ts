import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        bookings: {
          select: {
            id: true,
            bookingReference: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            tour: {
              select: {
                id: true,
                title: true,
                slug: true,
                duration: true,
                locationCountry: true,
                locationRegion: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        notifications: {
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const transformedCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      country: customer.country,
      city: customer.city,
      address: customer.address,
      total_bookings: customer.totalBookings,
      total_spent: Number(customer.totalSpent),
      first_booking_date: customer.firstBookingDate?.toISOString(),
      last_booking_date: customer.lastBookingDate?.toISOString(),
      status: customer.status,
      customer_type: customer.customerType,
      loyalty_points: customer.loyaltyPoints,
      preferred_contact_method: customer.preferredContactMethod,
      preferred_contact_time: customer.preferredContactTime,
      notes: customer.notes,
      join_date: customer.joinDate.toISOString(),
      updated_at: customer.updatedAt.toISOString(),
      bookings: customer.bookings.map(booking => ({
        id: booking.id,
        reference: booking.bookingReference,
        start_date: booking.startDate.toISOString(),
        end_date: booking.endDate.toISOString(),
        amount: Number(booking.totalAmount),
        status: booking.status,
        payment_status: booking.paymentStatus,
        created_at: booking.createdAt.toISOString(),
        tour: booking.tour ? {
          id: booking.tour.id,
          title: booking.tour.title,
          slug: booking.tour.slug,
          duration: booking.tour.duration,
          location_country: booking.tour.locationCountry,
          location_region: booking.tour.locationRegion
        } : null
      })),
      notifications: customer.notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        status: notification.status,
        created_at: notification.createdAt.toISOString()
      }))
    }

    return NextResponse.json({ customer: transformedCustomer })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const customer = await prisma.customer.update({
      where: { id: parseInt(params.id) },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        country: body.country,
        city: body.city,
        address: body.address,
        status: body.status,
        customerType: body.customerType,
        preferredContactMethod: body.preferredContactMethod,
        preferredContactTime: body.preferredContactTime,
        notes: body.notes
      }
    })

    return NextResponse.json({ success: true, customer })
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
    
    if (body.customerType) {
      updateData.customerType = body.customerType
    }

    if (body.loyaltyPoints !== undefined) {
      updateData.loyaltyPoints = body.loyaltyPoints
    }

    if (body.notes) {
      updateData.notes = body.notes
    }

    const customer = await prisma.customer.update({
      where: { id: parseInt(params.id) },
      data: updateData
    })

    return NextResponse.json({ success: true, customer })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.customer.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 