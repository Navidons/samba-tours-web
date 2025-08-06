/**
 * Upload configuration for different environments
 */

export const UPLOAD_CONFIG = {
  // File size limits (optimized for VPS hosting)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB per file (VPS can handle this)
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB for batch uploads (restore batch capability)
  
  // Allowed file types
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  
  // Request timeout (for deployment)
  REQUEST_TIMEOUT: process.env.NODE_ENV === 'production' ? 30000 : 60000, // 30s prod, 60s dev
  
  // Chunk size for large uploads (future feature)
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Environment specific settings
  PRODUCTION: {
    MAX_CONCURRENT_UPLOADS: 3,
    ENABLE_COMPRESSION: true,
    LOG_LEVEL: 'error'
  },
  
  DEVELOPMENT: {
    MAX_CONCURRENT_UPLOADS: 5,
    ENABLE_COMPRESSION: false,
    LOG_LEVEL: 'debug'
  }
}

/**
 * Get environment-specific upload configuration
 */
export function getUploadConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  const baseConfig = UPLOAD_CONFIG
  const envConfig = isProduction ? UPLOAD_CONFIG.PRODUCTION : UPLOAD_CONFIG.DEVELOPMENT
  
  return {
    ...baseConfig,
    ...envConfig,
    isProduction
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const config = getUploadConfig()
  
  // Check file type
  if (!config.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: ${config.ALLOWED_IMAGE_TYPES.join(', ')}`
    }
  }
  
  // Check file size
  if (file.size > config.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: ${(config.MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB`
    }
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty'
    }
  }
  
  return { valid: true }
}

/**
 * Check if deployment environment supports large uploads
 */
export function getDeploymentLimits() {
  // Common deployment platform limits
  const PLATFORM_LIMITS = {
    vercel: {
      maxFileSize: 3.5 * 1024 * 1024, // 3.5MB (conservative for FormData overhead)
      maxRequestSize: 3.5 * 1024 * 1024, // Account for FormData padding
      maxDuration: 10000 // 10 seconds for hobby plan
    },
    netlify: {
      maxFileSize: 6 * 1024 * 1024, // 6MB
      maxRequestSize: 6 * 1024 * 1024,
      maxDuration: 10000
    },
    railway: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxRequestSize: 100 * 1024 * 1024,
      maxDuration: 30000
    },
    render: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxRequestSize: 100 * 1024 * 1024,
      maxDuration: 30000
    },
    vps: {
      maxFileSize: 50 * 1024 * 1024, // 50MB (VPS with Nginx/OpenLiteSpeed)
      maxRequestSize: 100 * 1024 * 1024, // 100MB total request
      maxDuration: 300000 // 5 minutes
    }
  }
  
  // Try to detect platform from environment variables
  const platform = process.env.VERCEL ? 'vercel' 
    : process.env.NETLIFY ? 'netlify'
    : process.env.RAILWAY_ENVIRONMENT ? 'railway'
    : process.env.RENDER ? 'render'
    : 'vps' // Default to VPS for custom hosting
  
  return {
    platform,
    limits: PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS] || {
      maxFileSize: 50 * 1024 * 1024, // 50MB default for VPS
      maxRequestSize: 100 * 1024 * 1024, // 100MB default
      maxDuration: 300000 // 5 minutes default
    }
  }
}

/**
 * Log deployment info for debugging
 */
export function logDeploymentInfo() {
  const { platform, limits } = getDeploymentLimits()
  const config = getUploadConfig()
  
  console.log('🚀 Deployment Info:')
  console.log(`   Platform: ${platform}`)
  console.log(`   Max File Size: ${(limits.maxFileSize / 1024 / 1024).toFixed(2)}MB`)
  console.log(`   Max Request Size: ${(limits.maxRequestSize / 1024 / 1024).toFixed(2)}MB`)
  console.log(`   Max Duration: ${limits.maxDuration}ms`)
  console.log(`   Current Config Max: ${(config.MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB`)
  console.log(`   Production Mode: ${config.isProduction}`)
}
