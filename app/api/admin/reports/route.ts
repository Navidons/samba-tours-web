import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseISO, startOfDay, endOfDay } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, dateFrom, dateTo } = body
    const from = dateFrom ? startOfDay(parseISO(dateFrom)) : undefined
    const to = dateTo ? endOfDay(parseISO(dateTo)) : undefined

    let data = []
    let columns: string[] = []
    let filename = `${type}-report.csv`

    if (type === "revenue") {
      columns = ["Date", "Total Revenue", "Bookings"]
      const results = await prisma.booking.groupBy({
        by: ["createdAt"],
        where: {
          ...(from && to ? { createdAt: { gte: from, lte: to } } : {}),
          status: { in: ["confirmed", "completed"] },
        },
        _sum: { finalAmount: true },
        _count: { id: true },
        orderBy: { createdAt: "asc" },
      })
      data = results.map(r => [r.createdAt.toISOString().split("T")[0], r._sum.finalAmount?.toString() || "0", r._count.id.toString()])
    } else if (type === "bookings") {
      columns = ["Booking Reference", "Customer Name", "Tour", "Date", "Guests", "Amount", "Status"]
      const bookings = await prisma.booking.findMany({
        where: {
          ...(from && to ? { createdAt: { gte: from, lte: to } } : {}),
        },
        include: { tour: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      })
      data = bookings.map(b => [
        b.bookingReference,
        b.customerName,
        b.tour?.title || "",
        b.createdAt.toISOString().split("T")[0],
        b.guestCount.toString(),
        b.totalAmount.toString(),
        b.status,
      ])
    } else if (type === "customers") {
      columns = ["Name", "Email", "Country", "Total Bookings", "Total Spent", "Type", "Joined"]
      const customers = await prisma.customer.findMany({
        where: {
          ...(from && to ? { joinDate: { gte: from, lte: to } } : {}),
        },
        orderBy: { joinDate: "desc" },
      })
      data = customers.map(c => [
        c.name,
        c.email,
        c.country || "",
        c.totalBookings.toString(),
        c.totalSpent.toString(),
        c.customerType,
        c.joinDate.toISOString().split("T")[0],
      ])
    } else if (type === "tours") {
      columns = ["Tour Title", "Category", "Price", "Bookings", "Revenue", "Rating"]
      const tours = await prisma.tour.findMany({
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      })
      data = tours.map(t => [
        t.title,
        t.category?.name || "",
        t.price.toString(),
        t.bookingCount?.toString() || "0",
        t.price && t.bookingCount ? (Number(t.price) * t.bookingCount).toString() : "0",
        t.rating?.toString() || "0",
      ])
    } else {
      return NextResponse.json({ error: "Unknown report type" }, { status: 400 })
    }

    // CSV export (simple)
    const csv = [columns.join(",")].concat(data.map(row => row.map(v => `"${v}"`).join(","))).join("\n")
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

export async function GET() {
  // For now, return dummy recent/scheduled reports (can be extended to use DB)
  return NextResponse.json({
    recent: [],
    scheduled: [],
  })
} 