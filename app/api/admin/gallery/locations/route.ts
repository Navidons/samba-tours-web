import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/admin/gallery/locations - Get all gallery locations
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
      videoCount: location._count.videos,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt
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

// POST /api/admin/gallery/locations - Create new gallery location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, country, region, coordinates } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    // Check if slug already exists
    const existingLocation = await prisma.galleryMediaLocation.findUnique({
      where: { slug }
    })

    if (existingLocation) {
      return NextResponse.json(
        { error: 'Location with this name already exists' },
        { status: 400 }
      )
    }

    const location = await prisma.galleryMediaLocation.create({
      data: {
        name,
        slug,
        description,
        country,
        region,
        coordinatesLat: coordinates?.lat || null,
        coordinatesLng: coordinates?.lng || null
      }
    })

    return NextResponse.json({
      location: {
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
        imageCount: 0,
        videoCount: 0,
        createdAt: location.createdAt,
        updatedAt: location.updatedAt
      }
    })

  } catch (error) {
    console.error('Error creating gallery location:', error)
    return NextResponse.json(
      { error: 'Failed to create gallery location' },
      { status: 500 }
    )
  }
} 
