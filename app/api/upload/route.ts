import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {

    const formData = await request.formData()
    const files = formData.getAll("files")

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadedImages = []

    for (const file of files) {
      // Check if it's a file object
      if (!(file instanceof Blob)) {
        continue // Skip non-file items
      }

      // Type guard to ensure we have a file with the expected properties
      if (!('type' in file) || !('name' in file) || !('size' in file)) {
        continue
      }

      if (!file.type.startsWith("image/")) {
        continue // Skip non-image files
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = (file as any).name.split(".").pop()
      const filename = `tours/${timestamp}-${randomString}.${extension}`

      try {
        // Upload to Vercel Blob
        const blob = await put(filename, file, {
          access: "public",
        })

        uploadedImages.push({
          url: blob.url,
          filename: filename,
          size: (file as any).size,
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
