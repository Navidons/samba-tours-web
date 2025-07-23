import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get total bookings
    const totalBookings = await prisma.booking.count()

    // Get pending bookings
    const pendingBookings = await prisma.booking.count({
      where: { status: "pending" }
    })

    // Get total revenue from confirmed bookings
    const revenueData = await prisma.booking.findMany({
      where: { status: "confirmed" },
      select: { totalAmount: true }
    })

    const totalRevenue = revenueData.reduce((sum: number, booking) => 
      sum + booking.totalAmount.toNumber(), 0
    )

    // Calculate monthly growth (simplified - comparing this month to last month)
    const currentMonth = new Date()
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const thisMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

    const thisMonthBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: thisMonthStart
        }
      }
    })

    const lastMonthBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lt: thisMonthStart
        }
      }
    })

    const monthlyGrowth = lastMonthBookings > 0
      ? Math.round(((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100)
      : 0

    return NextResponse.json({
      totalBookings,
      pendingBookings,
      totalRevenue,
      monthlyGrowth,
    })
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
