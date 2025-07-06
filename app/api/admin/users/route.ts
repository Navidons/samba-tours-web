import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: {
          select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            country: true,
            city: true,
            isActive: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      emailConfirmed: user.emailConfirmed,
      lastSignInAt: user.lastSignInAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      profile: user.profile ? {
        id: user.profile.id,
        fullName: user.profile.fullName,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: user.profile.phone,
        country: user.profile.country,
        city: user.profile.city,
        isActive: user.profile.isActive,
        createdAt: user.profile.createdAt.toISOString()
      } : null
    }))

    return NextResponse.json({ users: transformedUsers })
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
            roleId: roleId || 1, // Default to regular user
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