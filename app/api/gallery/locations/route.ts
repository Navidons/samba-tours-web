import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/gallery/locations - Get all gallery locations for client side
export async function GET(request: NextRequest) {
  try {
    const locations = await prisma.galleryMediaLocation.findMany({
      include: {
        _count: {
          select: {
            images: true,
            videos: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const transformedLocations = locations.map(location => ({
      id: location.id,
      name: location.name,
      slug: location.slug,
      description: location.description,
      country: location.country,
      region: location.region,
      coordinates: location.coordinatesLat && location.coordinatesLng ? {
        lat: location.coordinatesLat,
        lng: location.coordinatesLng
      } : null,
      imageCount: location._count.images,
      videoCount: location._count.videos
    }))

    return NextResponse.json({ locations: transformedLocations })

  } catch (error) {
    console.error('Error fetching gallery locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery locations' },
      { status: 500 }
    )
  }
} 
