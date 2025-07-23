import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadedImages = []

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue // Skip non-image files
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split(".").pop()
      const filename = `tours/${timestamp}-${randomString}.${extension}`

      try {
        // Upload to Vercel Blob
        const blob = await put(filename, file, {
          access: "public",
        })

        uploadedImages.push({
          url: blob.url,
          filename: filename,
          size: file.size,
          type: file.type,
        })
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError)
        // Continue with other files
      }
    }

    return NextResponse.json({
      success: true,
      images: uploadedImages,
    })
  } catch (error) {
    console.error("Error in upload API:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
