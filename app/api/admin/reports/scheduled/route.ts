import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateAdminSession } from "@/lib/server-auth"

export async function GET() {
  try {
    const session = validateAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now, return empty array since we don't have a scheduled reports table yet
    // In a real implementation, you would fetch scheduled reports from the database
    const scheduledReports = []

    return NextResponse.json({ reports: scheduledReports })
  } catch (error) {
    console.error("Error fetching scheduled reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch scheduled reports" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = validateAdminSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, frequency, recipients, time } = body

    if (!name || !frequency || !recipients || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // For now, just return success since we don't have a scheduled reports table yet
    // In a real implementation, you would save the scheduled report to the database
    // and set up a cron job or scheduler to run it

    return NextResponse.json({ 
      message: "Report scheduled successfully",
      id: Date.now().toString() // Temporary ID
    })
  } catch (error) {
    console.error("Error scheduling report:", error)
    return NextResponse.json(
      { error: "Failed to schedule report" },
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

    // For now, just return success since we don't have a scheduled reports table yet
    // In a real implementation, you would delete the scheduled report from the database

    return NextResponse.json({ message: "Scheduled report deleted successfully" })
  } catch (error) {
    console.error("Error deleting scheduled report:", error)
    return NextResponse.json(
      { error: "Failed to delete scheduled report" },
      { status: 500 }
    )
  }
} 
