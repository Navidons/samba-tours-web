import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { getUploadConfig, getDeploymentLimits, logDeploymentInfo, validateFile, UPLOAD_CONFIG } from "@/lib/config/upload"

// For backward compatibility
const MAX_FILE_SIZE = UPLOAD_CONFIG.MAX_FILE_SIZE
const ALLOWED_IMAGE_TYPES = UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES

// POST /api/admin/gallery/images/single - Upload single image to gallery (Vercel-friendly)
export async function POST(request: NextRequest) {
  try {
    console.log('📁 Single gallery image upload started')
    
    // Log deployment configuration for debugging
    logDeploymentInfo()
    
    const config = getUploadConfig()
    const { platform, limits } = getDeploymentLimits()
    
    // Check content length for deployment
    const contentLength = request.headers.get('content-length')
    console.log(`📊 Content-Length: ${contentLength}`)
    
    if (contentLength && parseInt(contentLength) > limits.maxRequestSize) {
      console.log(`❌ Request too large: ${contentLength} > ${limits.maxRequestSize}`)
      return NextResponse.json(
        { error: `Request too large for ${platform}. Maximum: ${(limits.maxRequestSize / 1024 / 1024).toFixed(2)}MB` },
        { status: 413 }
      )
    }
    
    const formData = await request.formData()
    
    const galleryId = parseInt(formData.get('galleryId') as string)
    const title = formData.get('title') as string || null
    const description = formData.get('description') as string || null
    const alt = formData.get('alt') as string || null
    const file = formData.get('image') as File | null // Single file
    
    console.log(`📊 Upload details: Gallery ID: ${galleryId}`)
    
    if (!galleryId) {
      return NextResponse.json(
        { error: 'Gallery ID is required' },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Check if gallery exists
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId }
    })

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery not found' },
        { status: 404 }
      )
    }

    // Enhanced logging for deployment debugging
    console.log(`📄 File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB, ${file.type})`)

    // Use centralized validation
    const validation = validateFile(file)
    if (!validation.valid) {
      console.log(`❌ Validation failed: ${validation.error}`)
      return NextResponse.json(
        { error: validation.error || 'Validation failed' },
        { status: 400 }
      )
    }

    // Additional deployment-specific checks
    if (file.size > limits.maxFileSize) {
      console.log(`❌ File exceeds platform limit: ${(file.size / 1024 / 1024).toFixed(2)}MB > ${(limits.maxFileSize / 1024 / 1024).toFixed(2)}MB`)
      return NextResponse.json(
        { error: `File too large for ${platform}: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: ${(limits.maxFileSize / 1024 / 1024).toFixed(2)}MB` },
        { status: 413 }
      )
    }

    // Convert file to buffer with enhanced error handling for deployment
    let buffer: Buffer
    try {
      console.log(`📦 Converting to buffer: ${file.name}`)
      
      // Check if file is valid before processing
      if (!file || !file.stream) {
        console.log(`❌ Invalid file object: ${file.name}`)
        return NextResponse.json(
          { error: 'Invalid file object' },
          { status: 400 }
        )
      }
      
      const arrayBuffer = await file.arrayBuffer()
      
      // Additional validation for deployment
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        console.log(`❌ Empty or invalid arrayBuffer: ${file.name}`)
        return NextResponse.json(
          { error: 'Failed to read file data' },
          { status: 400 }
        )
      }
      
      buffer = Buffer.from(arrayBuffer)
      
      // Validate buffer has content
      if (buffer.length === 0) {
        console.log(`❌ Empty buffer: ${file.name}`)
        return NextResponse.json(
          { error: 'File contains no data' },
          { status: 400 }
        )
      }
      
      // Validate buffer length matches file size
      if (buffer.length !== file.size) {
        console.log(`⚠️ Buffer size mismatch for ${file.name}: buffer=${buffer.length}, file=${file.size}`)
      }
      
    } catch (bufferError) {
      console.error(`❌ Buffer error for ${file.name}:`, bufferError)
      return NextResponse.json(
        { error: `Failed to process file: ${bufferError instanceof Error ? bufferError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
    
    // Extract filename without extension for title
    const imageTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
    
    console.log(`💾 Saving to database: ${file.name}`)
    
    try {
      // Create image record with better error handling
      const image = await prisma.galleryImage.create({
        data: {
          galleryId,
          imageData: buffer,
          imageName: file.name,
          imageType: file.type,
          imageSize: file.size,
          alt: alt || imageTitle,
          title: title || imageTitle,
          description: description
        },
        include: {
          gallery: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      const uploadedImage = {
        id: image.id,
        title: image.title,
        description: image.description,
        alt: image.alt,
        imageName: image.imageName,
        imageType: image.imageType,
        imageSize: image.imageSize,
        featured: image.featured,
        views: image.views,
        createdAt: image.createdAt,
        gallery: image.gallery
      }

      console.log(`✅ Successfully uploaded: ${file.name} (ID: ${image.id})`)

      // Update gallery count
      try {
        await prisma.gallery.update({
          where: { id: galleryId },
          data: {
            imageCount: {
              increment: 1
            }
          }
        })
        console.log(`📈 Updated gallery count: +1`)
      } catch (updateError) {
        console.error('Error updating gallery count:', updateError)
        // Don't fail the entire request if count update fails
      }

      // Return single image response
      const response = {
        image: uploadedImage,
        message: `Successfully uploaded image: ${file.name}`,
        success: true
      }

      console.log(`🎉 Upload complete: ${file.name}`)
      return NextResponse.json(response, { status: 200 })

    } catch (dbError) {
      console.error(`❌ Database error for ${file.name}:`, dbError)
      return NextResponse.json(
        { error: `Failed to save image: ${dbError instanceof Error ? dbError.message : 'Database error'}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Error uploading image:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { error: 'Database connection failed', type: 'CONNECTION_ERROR' },
        { status: 503 }
      )
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database operation failed', type: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
