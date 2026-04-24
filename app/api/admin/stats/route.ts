import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [totalTours, totalBookings, totalUsers, totalRevenue] = await Promise.all([
      prisma.tour.count({ where: { status: "active" } }),
      prisma.booking.count(),
      prisma.user.count(),
      prisma.booking.aggregate({
        where: { status: "confirmed" },
        _sum: { totalAmount: true }
      })
    ])

    const stats = {
      totalTours,
      totalBookings,
      totalUsers,
      totalRevenue: totalRevenue._sum.totalAmount?.toNumber() || 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
