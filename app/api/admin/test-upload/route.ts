import { NextRequest, NextResponse } from "next/server"
import { getUploadConfig, getDeploymentLimits, logDeploymentInfo } from "@/lib/config/upload"

// GET /api/admin/test-upload - Test upload configuration
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing upload configuration...')
    
    // Log deployment configuration
    logDeploymentInfo()
    
    const config = getUploadConfig()
    const { platform, limits } = getDeploymentLimits()
    
    // Get headers for debugging
    const headers = Object.fromEntries(request.headers.entries())
    
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      platform: platform,
      config: {
        maxFileSize: `${(config.MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB`,
        maxTotalSize: `${(config.MAX_TOTAL_SIZE / 1024 / 1024).toFixed(2)}MB`,
        allowedTypes: config.ALLOWED_IMAGE_TYPES,
        timeout: `${config.REQUEST_TIMEOUT}ms`,
        isProduction: config.isProduction
      },
      limits: {
        maxFileSize: `${(limits.maxFileSize / 1024 / 1024).toFixed(2)}MB`,
        maxRequestSize: `${(limits.maxRequestSize / 1024 / 1024).toFixed(2)}MB`,
        maxDuration: `${limits.maxDuration}ms`
      },
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      },
      headers: {
        'content-length': headers['content-length'] || 'not set',
        'content-type': headers['content-type'] || 'not set',
        'user-agent': headers['user-agent'] || 'not set',
        'x-forwarded-for': headers['x-forwarded-for'] || 'not set',
        'x-real-ip': headers['x-real-ip'] || 'not set'
      },
      recommendations: generateRecommendations(platform, limits)
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('❌ Error testing upload configuration:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/test-upload - Test actual file upload
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing file upload...')
    
    const contentLength = request.headers.get('content-length')
    console.log(`📊 Content-Length: ${contentLength}`)
    
    const formData = await request.formData()
    const file = formData.get('testFile') as File | null
    
    if (!file) {
      return NextResponse.json(
        { 
          status: 'error',
          error: 'No test file provided',
          usage: 'POST with FormData containing "testFile"'
        },
        { status: 400 }
      )
    }

    const { platform, limits } = getDeploymentLimits()
    
    // Test file properties
    const fileInfo = {
      name: file.name,
      size: file.size,
      sizeFormatted: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    }

    // Check against limits
    const withinLimits = {
      fileSize: file.size <= limits.maxFileSize,
      requestSize: contentLength ? parseInt(contentLength) <= limits.maxRequestSize : true
    }

    // Try to read file buffer (test processing)
    let bufferTest = { success: false, size: 0 }
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      bufferTest = {
        success: true,
        size: buffer.length
      }
    } catch (bufferError) {
      console.error('Buffer test failed:', bufferError)
    }

    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      platform: platform,
      file: fileInfo,
      validation: {
        withinFileSizeLimit: withinLimits.fileSize,
        withinRequestSizeLimit: withinLimits.requestSize,
        bufferProcessing: bufferTest.success,
        maxFileSize: `${(limits.maxFileSize / 1024 / 1024).toFixed(2)}MB`,
        maxRequestSize: `${(limits.maxRequestSize / 1024 / 1024).toFixed(2)}MB`
      },
      processing: {
        bufferCreated: bufferTest.success,
        bufferSize: bufferTest.size,
        sizesMatch: bufferTest.size === file.size
      },
      message: withinLimits.fileSize && withinLimits.requestSize 
        ? '✅ File upload test passed! Your configuration should work.'
        : '❌ File upload test failed. Check server configuration.'
    }

    return NextResponse.json(response, { 
      status: withinLimits.fileSize && withinLimits.requestSize ? 200 : 413 
    })

  } catch (error) {
    console.error('❌ Error testing file upload:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        message: 'File upload test failed. This indicates server configuration issues.'
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(platform: string, limits: any): string[] {
  const recommendations = []

  if (platform === 'vps') {
    recommendations.push('✅ VPS detected - you have full control over upload limits')
    recommendations.push('🔧 Check Nginx: client_max_body_size should be ≥100M')
    recommendations.push('🔧 Check OpenLiteSpeed: Max Request Body Size should be ≥100M')
    recommendations.push('⏱️ Increase proxy timeouts to 300s for large uploads')
  } else if (platform === 'vercel') {
    recommendations.push('⚠️ Vercel detected - limited to 4.5MB on hobby plan')
    recommendations.push('💡 Consider upgrading to Pro plan for higher limits')
  } else {
    recommendations.push('❓ Platform not detected - assuming VPS configuration')
    recommendations.push('🔧 Configure your web server for larger uploads')
  }

  if (limits.maxFileSize < 10 * 1024 * 1024) {
    recommendations.push('📏 Current file size limit is quite low - consider increasing')
  }

  recommendations.push('🧪 Test uploads with: curl -X POST -F "testFile=@image.jpg" /api/admin/test-upload')

  return recommendations
}
