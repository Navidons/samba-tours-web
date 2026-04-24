import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure database URL with connection pooling
function getDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) return baseUrl
  
  // For MySQL, add connection pool parameters to prevent too many connections
  if (baseUrl.includes('mysql://')) {
    const url = new URL(baseUrl)
    url.searchParams.set('connection_limit', '10')
    url.searchParams.set('pool_timeout', '5')
    url.searchParams.set('acquire_timeout', '5')
    url.searchParams.set('max_connections', '10')
    return url.toString()
  }
  
  return baseUrl
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Production-level logging: only errors, no query logs
    log: ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Only add event listeners once to prevent memory leaks
if (!globalForPrisma.prisma) {
  // Graceful shutdown
  const gracefulShutdown = async () => {
    await prisma.$disconnect()
  }

  process.on('beforeExit', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
} 
