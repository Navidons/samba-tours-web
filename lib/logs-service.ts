import { PrismaClient, PrismaClientInitializationError, PrismaClientKnownRequestError } from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export interface VisitorData {
  ipAddress?: string
  userAgent?: string
  pageVisited?: string
  referrer?: string
  country?: string
  city?: string
  latitude?: number
  longitude?: number
  timezone?: string
  language?: string
  isMobile?: boolean
  deviceType?: string
  browser?: string
  operatingSystem?: string
}

export class LogsService {
  /**
   * Track a new visitor or update existing visitor
   */
  static async trackVisitor(request: NextRequest, pageVisited: string): Promise<void> {
    try {
      const ipAddress = this.getClientIP(request)
      const userAgent = request.headers.get('user-agent') || undefined
      const referrer = request.headers.get('referer') || undefined
      const acceptLanguage = request.headers.get('accept-language') || undefined
      
      // Generate unique identifier (IP + User Agent hash)
      const uniqueIdentifier = this.generateUniqueIdentifier(ipAddress, userAgent)
      
      // Detect device and browser info
      const deviceInfo = this.parseUserAgent(userAgent)
      
      // Use upsert to handle race conditions properly
      const now = new Date()
      
      try {
        await prisma.visitor.upsert({
          where: { uniqueIdentifier },
          update: {
            lastVisitAt: now,
            pageVisited,
            referrer,
            userAgent,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            operatingSystem: deviceInfo.operatingSystem,
            isMobile: deviceInfo.isMobile,
            language: acceptLanguage?.split(',')[0]?.split(';')[0]
          },
          create: {
            uniqueIdentifier,
            ipAddress,
            userAgent,
            pageVisited,
            referrer,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            operatingSystem: deviceInfo.operatingSystem,
            isMobile: deviceInfo.isMobile,
            language: acceptLanguage?.split(',')[0]?.split(';')[0],
            firstVisitAt: now,
            lastVisitAt: now,
            totalVisits: 1
          }
        })
      } catch (upsertError) {
        // If upsert fails due to unique constraint, try to update existing record
        if (upsertError instanceof PrismaClientKnownRequestError && upsertError.code === 'P2002') {
          try {
            await prisma.visitor.update({
              where: { uniqueIdentifier },
              data: {
                lastVisitAt: now,
                pageVisited,
                referrer,
                userAgent,
                deviceType: deviceInfo.deviceType,
                browser: deviceInfo.browser,
                operatingSystem: deviceInfo.operatingSystem,
                isMobile: deviceInfo.isMobile,
                language: acceptLanguage?.split(',')[0]?.split(';')[0]
              }
            })
          } catch (updateError) {
            console.error('Failed to update existing visitor:', updateError)
          }
        } else {
          console.error('Upsert error:', upsertError)
        }
      }
    } catch (error) {
      console.error('Error tracking visitor:', error)
    }
  }

  /**
   * Get visitor statistics
   */
  static async getVisitorStats(period: 'today' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const [
      totalVisitors,
      newVisitors,
      returningVisitors,
      totalVisits,
      topPages,
      topCountries,
      deviceStats,
      browserStats,
      hourlyStats
    ] = await Promise.all([
      // Total unique visitors in period
      prisma.visitor.count({
        where: { lastVisitAt: { gte: startDate } }
      }),
      // New visitors in period
      prisma.visitor.count({
        where: { firstVisitAt: { gte: startDate } }
      }),
      // Returning visitors (visited before period but also during period)
      prisma.visitor.count({
        where: {
          firstVisitAt: { lt: startDate },
          lastVisitAt: { gte: startDate }
        }
      }),
      // Total visits in period
      prisma.visitor.aggregate({
        where: { lastVisitAt: { gte: startDate } },
        _sum: { totalVisits: true }
      }),
      // Top visited pages
      prisma.visitor.groupBy({
        by: ['pageVisited'],
        where: { lastVisitAt: { gte: startDate } },
        _count: { pageVisited: true },
        orderBy: { _count: { pageVisited: 'desc' } },
        take: 10
      }),
      // Top countries
      prisma.visitor.groupBy({
        by: ['country'],
        where: { 
          lastVisitAt: { gte: startDate },
          country: { not: null }
        },
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
        take: 10
      }),
      // Device statistics
      prisma.visitor.groupBy({
        by: ['deviceType'],
        where: { 
          lastVisitAt: { gte: startDate },
          deviceType: { not: null }
        },
        _count: { deviceType: true }
      }),
      // Browser statistics
      prisma.visitor.groupBy({
        by: ['browser'],
        where: { 
          lastVisitAt: { gte: startDate },
          browser: { not: null }
        },
        _count: { browser: true },
        orderBy: { _count: { browser: 'desc' } },
        take: 10
      }),
      // Hourly visit trends
      prisma.$queryRaw`
        SELECT HOUR(last_visit_at) as hour, COUNT(*) as count
        FROM visitors
        WHERE last_visit_at >= ${startDate}
        GROUP BY HOUR(last_visit_at)
        ORDER BY hour
      `
    ])

    return {
      period,
      totalVisitors,
      newVisitors,
      returningVisitors,
      totalVisits: totalVisits._sum.totalVisits || 0,
      topPages: topPages.map(page => ({
        page: page.pageVisited || 'Unknown',
        count: page._count.pageVisited
      })),
      topCountries: topCountries.map(country => ({
        country: country.country || 'Unknown',
        count: country._count.country
      })),
      deviceStats: deviceStats.map(device => ({
        device: device.deviceType || 'Unknown',
        count: device._count.deviceType
      })),
      browserStats: browserStats.map(browser => ({
        browser: browser.browser || 'Unknown',
        count: browser._count.browser
      })),
      hourlyStats: hourlyStats.map((stat: any) => ({
        hour: Number(stat.hour),
        count: Number(stat.count)
      }))
    }
  }

  /**
   * Get recent visitors
   */
  static async getRecentVisitors(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        skip,
        take: limit,
        orderBy: { lastVisitAt: 'desc' },
        select: {
          id: true,
          uniqueIdentifier: true,
          ipAddress: true,
          userAgent: true,
          deviceType: true,
          browser: true,
          operatingSystem: true,
          country: true,
          city: true,
          pageVisited: true,
          referrer: true,
          isMobile: true,
          firstVisitAt: true,
          lastVisitAt: true,
          totalVisits: true,
          language: true
        }
      }),
      prisma.visitor.count()
    ])

    return {
      visitors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Get visitor details by ID
   */
  static async getVisitorDetails(id: number) {
    return await prisma.visitor.findUnique({
      where: { id },
      select: {
        id: true,
        uniqueIdentifier: true,
        ipAddress: true,
        userAgent: true,
        deviceType: true,
        browser: true,
        operatingSystem: true,
        country: true,
        city: true,
        latitude: true,
        longitude: true,
        timezone: true,
        language: true,
        referrer: true,
        pageVisited: true,
        isMobile: true,
        firstVisitAt: true,
        lastVisitAt: true,
        totalVisits: true
      }
    })
  }

  /**
   * Search visitors
   */
  static async searchVisitors(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where: {
          OR: [
            { ipAddress: { contains: query } },
            { country: { contains: query } },
            { city: { contains: query } },
            { browser: { contains: query } },
            { operatingSystem: { contains: query } },
            { pageVisited: { contains: query } }
          ]
        },
        skip,
        take: limit,
        orderBy: { lastVisitAt: 'desc' }
      }),
      prisma.visitor.count({
        where: {
          OR: [
            { ipAddress: { contains: query } },
            { country: { contains: query } },
            { city: { contains: query } },
            { browser: { contains: query } },
            { operatingSystem: { contains: query } },
            { pageVisited: { contains: query } }
          ]
        }
      })
    ])

    return {
      visitors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Get client IP address
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return request.ip || 'unknown'
  }

  /**
   * Generate unique identifier for visitor
   */
  private static generateUniqueIdentifier(ipAddress: string, userAgent?: string): string {
    // Create a more robust unique identifier
    const data = `${ipAddress}-${userAgent || 'unknown'}`
    
    // Use a more sophisticated hash function
    let hash = 0
    const prime = 31
    const mod = 1e9 + 7
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash * prime + char) % mod
    }
    
    // Add timestamp component to make it more unique
    const timestamp = Date.now().toString(36)
    return `${Math.abs(hash).toString(36)}-${timestamp}`
  }

  /**
   * Parse user agent string to extract device and browser info
   */
  private static parseUserAgent(userAgent?: string) {
    if (!userAgent) {
      return {
        deviceType: 'Unknown',
        browser: 'Unknown',
        operatingSystem: 'Unknown',
        isMobile: false
      }
    }

    const ua = userAgent.toLowerCase()
    
    // Detect device type
    let deviceType = 'Desktop'
    let isMobile = false
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
      deviceType = 'Mobile'
      isMobile = true
    } else if (ua.includes('tablet')) {
      deviceType = 'Tablet'
      isMobile = true
    }

    // Detect browser
    let browser = 'Unknown'
    if (ua.includes('chrome')) browser = 'Chrome'
    else if (ua.includes('firefox')) browser = 'Firefox'
    else if (ua.includes('safari')) browser = 'Safari'
    else if (ua.includes('edge')) browser = 'Edge'
    else if (ua.includes('opera')) browser = 'Opera'

    // Detect operating system
    let operatingSystem = 'Unknown'
    if (ua.includes('windows')) operatingSystem = 'Windows'
    else if (ua.includes('mac')) operatingSystem = 'macOS'
    else if (ua.includes('linux')) operatingSystem = 'Linux'
    else if (ua.includes('android')) operatingSystem = 'Android'
    else if (ua.includes('ios')) operatingSystem = 'iOS'

    return {
      deviceType,
      browser,
      operatingSystem,
      isMobile
    }
  }
} 