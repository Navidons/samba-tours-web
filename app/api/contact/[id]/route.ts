import { type NextRequest, NextResponse } from "next/server"

// Mock database for storing contact submissions
const contactSubmissions: any[] = []

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const submission = contactSubmissions.find((s) => s.id === params.id)

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, priority, notes } = body

    const submissionIndex = contactSubmissions.findIndex((s) => s.id === params.id)

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const submissionIndex = contactSubmissions.findIndex((s) => s.id === params.id)

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
