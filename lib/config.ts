import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Authentication (if you add auth later)
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  
  // External APIs (if you add them later)
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  
  // Email Configuration
  GMAIL_USER: z.string(),
  GMAIL_APP_PASSWORD: z.string(),
  EMAIL_FROM_NAME: z.string().default('Samba Tours Uganda'),
  EMAIL_REPLY_TO: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  
  // Legacy email config (for future use with other providers)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // File upload (if you add file uploads)
  UPLOAD_MAX_SIZE: z.string().transform(Number).default('5242880'), // 5MB
  ALLOWED_FILE_TYPES: z.string().default('jpg,jpeg,png,gif,webp,pdf,doc,docx'),
  
  // Rate limiting
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'), // 15 minutes
  
  // Caching
  CACHE_TTL: z.string().transform(Number).default('3600'), // 1 hour
  
  // Monitoring
  ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('false'),
  ENABLE_ERROR_TRACKING: z.string().transform(val => val === 'true').default('false'),
})

// Validate environment variables
const envParse = envSchema.safeParse(process.env)

if (!envParse.success) {
  console.error('❌ Invalid environment variables:', envParse.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = envParse.data

// Application configuration
export const config = {
  app: {
    name: 'Samba Tours',
    description: 'Discover the beauty of Uganda with Samba Tours',
    url: env.NEXT_PUBLIC_APP_URL || (env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://sambatours.co'),
    environment: env.NODE_ENV,
  },
  
  database: {
    url: env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
  },
  
  api: {
    rateLimit: {
      max: env.RATE_LIMIT_MAX,
      windowMs: env.RATE_LIMIT_WINDOW,
    },
    cors: {
      origin: env.NEXT_PUBLIC_APP_URL || (env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://sambatours.co'),
      credentials: true,
    },
  },
  
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(','),
  },
  
  cache: {
    ttl: env.CACHE_TTL,
  },
  
  monitoring: {
    performance: env.ENABLE_PERFORMANCE_MONITORING,
    errors: env.ENABLE_ERROR_TRACKING,
  },
  
  features: {
    blog: true,
    tours: true,
    bookings: true,
    reviews: true,
    newsletter: true,
    contact: true,
  },
} as const

// Type-safe config access
export type Config = typeof config

// Feature flags
export const isFeatureEnabled = (feature: keyof Config['features']): boolean => {
  return config.features[feature]
}

// Environment helpers
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test' 
