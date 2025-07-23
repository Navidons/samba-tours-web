import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

// GET /api/tours/categories - Get all tour categories
export async function GET(request: NextRequest) {
  try {
    // Get all active categories
    const categories = await prisma.tourCategory.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        displayOrder: true,
        isActive: true,
        _count: {
          select: {
            tours: true
          }
        }
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })

    // Transform categories for response
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      tourCount: category._count.tours
    }))

    return NextResponse.json({
      categories: transformedCategories,
      success: true
    })

  } catch (error) {
    console.error('Error fetching tour categories:', error)
    
    if (error instanceof PrismaClientInitializationError) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please try again later.',
          type: 'CONNECTION_ERROR',
          success: false
        },
        { status: 503 }
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
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while fetching categories.',
        type: 'UNKNOWN_ERROR',
        success: false
      },
      { status: 500 }
    )
  }
} 
