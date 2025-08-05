import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

// Type guard to check if an object has File-like properties
function isFileLike(obj: any): obj is File {
  return obj && 
    typeof obj.type === 'string' && 
    typeof obj.name === 'string' && 
    typeof obj.size === 'number' &&
    typeof obj.arrayBuffer === 'function'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files")

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadedImages = []

    for (const file of files) {
      // Skip if not a valid file object
      if (!isFileLike(file)) {
        console.warn('Skipping invalid file object:', file)
        continue
      }

      if (!file.type?.startsWith("image/")) {
        continue // Skip non-image files
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name?.split(".").pop() || 'jpg'
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
