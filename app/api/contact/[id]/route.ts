import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

// Mock database for storing contact submissions
const contactSubmissions: any[] = []

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const submission = contactSubmissions.find((s) => s.id === id)

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: submission,
    })
  } catch (error) {
    console.error("Error fetching contact submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { status, priority, notes } = body

    const submissionIndex = contactSubmissions.findIndex((s) => s.id === id)

    if (submissionIndex === -1) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Update submission
    contactSubmissions[submissionIndex] = {
      ...contactSubmissions[submissionIndex],
      status: status || contactSubmissions[submissionIndex].status,
      priority: priority || contactSubmissions[submissionIndex].priority,
      notes: notes || contactSubmissions[submissionIndex].notes,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      message: "Submission updated successfully",
      data: contactSubmissions[submissionIndex],
    })
  } catch (error) {
    console.error("Error updating contact submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const submissionIndex = contactSubmissions.findIndex((s) => s.id === id)

    if (submissionIndex === -1) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Remove submission
    contactSubmissions.splice(submissionIndex, 1)

    return NextResponse.json({
      success: true,
      message: "Submission deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting contact submission:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
