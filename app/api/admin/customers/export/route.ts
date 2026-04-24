import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const customerType = searchParams.get("customerType")

    // Build where clause
    const where: any = {}
    
    if (status && status !== "all") {
      where.status = status
    }

    if (customerType && customerType !== "all") {
      where.customerType = customerType
    }

    // Get all customers for export
    const customers = await prisma.customer.findMany({
      where,
      include: {
        bookings: {
          select: {
            id: true,
            bookingReference: true,
            startDate: true,
            totalAmount: true,
            status: true
          }
        }
      },
      orderBy: { joinDate: 'desc' }
    })

    // Create CSV content
    const csvHeaders = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Country",
      "City",
      "Address",
      "Total Bookings",
      "Total Spent",
      "Status",
      "Customer Type",
      "Loyalty Points",
      "Preferred Contact Method",
      "Preferred Contact Time",
      "Notes",
      "Join Date",
      "Last Booking Date",
      "Last Booking Reference"
    ]

    const csvRows = customers.map(customer => [
      customer.id,
      customer.name,
      customer.email,
      customer.phone || "",
      customer.country || "",
      customer.city || "",
      customer.address || "",
      customer.totalBookings,
      customer.totalSpent.toString(),
      customer.status,
      customer.customerType,
      customer.loyaltyPoints,
      customer.preferredContactMethod,
      customer.preferredContactTime || "",
      customer.notes || "",
      customer.joinDate.toISOString().split('T')[0],
      customer.lastBookingDate ? customer.lastBookingDate.toISOString().split('T')[0] : "",
      customer.bookings.length > 0 ? customer.bookings[0].bookingReference : ""
    ])

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n")

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
