import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateAdminSession } from "@/lib/server-auth"

export async function GET() {
  try {
    const session = validateAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now, return empty array since we don't have a reports table yet
    // In a real implementation, you would store generated reports in the database
    const recentReports = []

    return NextResponse.json({ reports: recentReports })
  } catch (error) {
    console.error("Error fetching recent reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent reports" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = validateAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get("id")

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
    }

    // For now, just return success since we don't have a reports table
    // In a real implementation, you would delete the report from the database
    return NextResponse.json({ message: "Report deleted successfully" })
  } catch (error) {
    console.error("Error deleting report:", error)
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    )
  }
} 
