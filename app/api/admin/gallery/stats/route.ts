import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// GET /api/admin/gallery/stats - Get gallery statistics for admin dashboard
export async function GET(request: NextRequest) {
  try {
    // Get basic counts
    const [
      totalGalleries,
      totalImages,
      totalVideos,
      featuredImages,
      featuredGalleries,
      storageUsed
    ] = await Promise.all([
      prisma.gallery.count(),
      prisma.galleryImage.count(),
      prisma.galleryVideo.count(),
      prisma.galleryImage.count({
        where: { featured: true }
      }),
      prisma.gallery.count({
        where: { featured: true }
      }),
      prisma.galleryImage.aggregate({
        _sum: {
          imageSize: true
        }
      })
    ])

    // Get recent activity
    const recentGalleries = await prisma.gallery.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageCount: true,
        videoCount: true,
        createdAt: true
      }
    })

    const recentImages = await prisma.galleryImage.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        imageName: true,
        photographer: true,
        createdAt: true,
        gallery: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // Get category stats - fixed to use proper counting
    const categories = await prisma.galleryMediaCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const [imageCount, videoCount] = await Promise.all([
          prisma.galleryImage.count({
            where: { categoryId: category.id }
          }),
          prisma.galleryVideo.count({
            where: { categoryId: category.id }
          })
        ])
        
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          color: category.color,
          imageCount,
          videoCount,
          totalCount: imageCount + videoCount
        }
      })
    )

    // Get location stats - fixed to use proper counting
    const locations = await prisma.galleryMediaLocation.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    const locationStats = await Promise.all(
      locations.map(async (location) => {
        const [imageCount, videoCount] = await Promise.all([
          prisma.galleryImage.count({
            where: { locationId: location.id }
          }),
          prisma.galleryVideo.count({
            where: { locationId: location.id }
          })
        ])
        
        return {
          id: location.id,
          name: location.name,
          slug: location.slug,
          country: location.country,
          region: location.region,
          imageCount,
          videoCount,
          totalCount: imageCount + videoCount
        }
      })
    )

    // Sort locations by total count and take top 10
    const sortedLocationStats = locationStats
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 10)

    // Get monthly upload stats for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyStats = await prisma.galleryImage.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group by month
    const monthlyUploads = monthlyStats.reduce((acc, stat) => {
      const month = stat.createdAt.toISOString().substring(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Convert storage to MB
    const storageUsedMB = storageUsed._sum.imageSize ? 
      Math.round((storageUsed._sum.imageSize / 1024 / 1024) * 100) / 100 : 0

    return NextResponse.json({
      overview: {
        totalGalleries,
        totalImages,
        totalVideos,
        featuredImages,
        featuredGalleries,
        storageUsedMB
      },
      recentActivity: {
        galleries: recentGalleries,
        images: recentImages
      },
      categoryStats,
      locationStats: sortedLocationStats,
      monthlyUploads,
      success: true
    })

  } catch (error) {
    console.error('Error fetching gallery stats:', error)
    
    // Handle specific database connection errors
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check if the database server is running.',
          type: 'CONNECTION_ERROR',
          success: false
        },
        { status: 503 } // Service Unavailable
      )
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Database query failed. Please try again.',
          type: 'QUERY_ERROR',
          success: false
        },
        { status: 500 }
      )
    }
    
    // Generic error
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while fetching gallery stats.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 
