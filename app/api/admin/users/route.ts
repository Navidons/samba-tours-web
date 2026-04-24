import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where conditions
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { fullName: { contains: search, mode: 'insensitive' } } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (role) {
      where.profile = { ...where.profile, roleId: parseInt(role) }
    }

    if (status) {
      if (status === 'active') {
        where.profile = { ...where.profile, isActive: true }
      } else if (status === 'inactive') {
        where.profile = { ...where.profile, isActive: false }
      }
    }

    // Build orderBy
    let orderBy: any = {}
    if (sortBy === 'profile.fullName') {
      orderBy.profile = { fullName: sortOrder }
    } else if (sortBy === 'lastSignInAt') {
      orderBy.lastSignInAt = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Get total count
    const total = await prisma.user.count({ where })

    // Get users with stats
    const users = await prisma.user.findMany({
      where,
      include: {
        profile: {
          select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            nationality: true,
            country: true,
            city: true,
            isActive: true,
            lastActivity: true,
            role: {
              select: {
                id: true,
                roleName: true,
                description: true
              }
            }
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    // Get user stats
    const userStats = await Promise.all(
      users.map(async (user) => {
        const [bookings, reviews, comments] = await Promise.all([
          prisma.booking.count({ where: { userId: user.id } }),
          prisma.tourReview.count({ where: { userId: user.id } }),
          prisma.blogComment.count({ where: { userId: user.id } })
        ])
        return { userId: user.id, bookings, reviews, comments }
      })
    )

    // Get available roles for filters
    const roles = await prisma.userRole.findMany({
      select: { id: true, roleName: true },
      orderBy: { roleName: 'asc' }
    })

    const transformedUsers = users.map(user => {
      const stats = userStats.find(s => s.userId === user.id) || { bookings: 0, reviews: 0, comments: 0 }
      return {
        id: user.id,
        email: user.email,
        emailConfirmed: user.emailConfirmed,
        lastSignInAt: user.lastSignInAt?.toISOString(),
        failedLoginAttempts: user.failedLoginAttempts,
        accountLockedUntil: user.accountLockedUntil?.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        profile: user.profile ? {
          id: user.profile.id,
          fullName: user.profile.fullName,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          phone: user.profile.phone,
          dateOfBirth: user.profile.dateOfBirth?.toISOString(),
          gender: user.profile.gender,
          nationality: user.profile.nationality,
          country: user.profile.country,
          city: user.profile.city,
          isActive: user.profile.isActive,
          lastActivity: user.profile.lastActivity?.toISOString(),
          role: user.profile.role
        } : null,
        stats
      }
    })

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        roles
      }
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      roleId,
      isActive = true
    } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password (you'll need to implement this)
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailConfirmed: true, // Admin created users are confirmed
        profile: {
          create: {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
            phone,
            roleId: roleId ? parseInt(roleId) : 1, // Default to regular user
            isActive
          }
        }
      },
      include: {
        profile: {
          include: {
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: user.emailConfirmed,
        createdAt: user.createdAt,
        profile: user.profile ? {
          id: user.profile.id,
          fullName: user.profile.fullName,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          phone: user.profile.phone,
          isActive: user.profile.isActive,
          role: user.profile.role ? {
            id: user.profile.role.id,
            roleName: user.profile.role.roleName
          } : null
        } : null
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 
