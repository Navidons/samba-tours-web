import { prisma } from '@/lib/prisma'

export interface DatabaseStatus {
  connected: boolean
  tablesExist: boolean
  hasData: boolean
  error?: string
}

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check if tables exist by trying to count blog posts
    const postCount = await prisma.blogPost.count()
    
    return {
      connected: true,
      tablesExist: true,
      hasData: postCount > 0
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if it's a table doesn't exist error
    if (errorMessage.includes('does not exist')) {
      return {
        connected: true,
        tablesExist: false,
        hasData: false,
        error: 'Database tables do not exist. Please run migrations.'
      }
    }
    
    // Check if it's a connection error
    if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      return {
        connected: false,
        tablesExist: false,
        hasData: false,
        error: 'Cannot connect to database. Please check your connection settings.'
      }
    }
    
    return {
      connected: true,
      tablesExist: false,
      hasData: false,
      error: errorMessage
    }
  }
}

export async function isDatabaseReady(): Promise<boolean> {
  try {
    const status = await checkDatabaseStatus()
    return status.connected && status.tablesExist
  } catch (error) {
    console.warn('Database status check failed:', error)
    return false
  }
} 
