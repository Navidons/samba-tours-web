import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            role: true
          }
        },
        bookings: {
          include: {
            tour: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        tourReviews: {
          include: {
            tour: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        blogComments: {
          include: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            },
            user: true,
            parentComment: true,
            replies: true
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 10
        },
        _count: {
          select: {
            bookings: true,
            tourReviews: true,
            blogComments: true,
            wishlistItems: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: user.emailConfirmed,
        lastSignInAt: user.lastSignInAt,
        failedLoginAttempts: user.failedLoginAttempts,
        accountLockedUntil: user.accountLockedUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile ? {
          id: user.profile.id,
          fullName: user.profile.fullName,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          phone: user.profile.phone,
          dateOfBirth: user.profile.dateOfBirth,
          gender: user.profile.gender,
          nationality: user.profile.nationality,
          country: user.profile.country,
          city: user.profile.city,
          address: user.profile.address,
          isActive: user.profile.isActive,
          lastActivity: user.profile.lastActivity,
          role: user.profile.role ? {
            id: user.profile.role.id,
            roleName: user.profile.role.roleName,
            description: user.profile.role.description
          } : null
        } : null,
        recentActivity: {
          bookings: user.bookings,
          reviews: user.tourReviews,
          comments: user.blogComments
        },
        stats: {
          totalBookings: user._count.bookings,
          totalReviews: user._count.tourReviews,
          totalComments: user._count.blogComments,
          totalWishlistItems: user._count.wishlistItems
        }
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    const body = await request.json()
    
    const {
      email,
      firstName,
      lastName,
      phone,
      roleId,
      isActive,
      dateOfBirth,
      gender,
      nationality,
      country,
      city,
      address
    } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Update user and profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email || undefined,
        profile: {
          upsert: {
            create: {
              firstName,
              lastName,
              fullName: `${firstName} ${lastName}`.trim(),
              phone,
              roleId: roleId && roleId !== "" ? parseInt(roleId) : 1,
              isActive: isActive !== undefined ? isActive : true,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
              gender,
              nationality,
              country,
              city,
              address
            },
            update: {
              firstName,
              lastName,
              fullName: `${firstName} ${lastName}`.trim(),
              phone,
              roleId: roleId && roleId !== "" ? parseInt(roleId) : undefined,
              isActive: isActive !== undefined ? isActive : undefined,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
              gender,
              nationality,
              country,
              city,
              address
            }
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
        id: updatedUser.id,
        email: updatedUser.email,
        emailConfirmed: updatedUser.emailConfirmed,
        updatedAt: updatedUser.updatedAt,
        profile: updatedUser.profile ? {
          id: updatedUser.profile.id,
          fullName: updatedUser.profile.fullName,
          firstName: updatedUser.profile.firstName,
          lastName: updatedUser.profile.lastName,
          phone: updatedUser.profile.phone,
          dateOfBirth: updatedUser.profile.dateOfBirth,
          gender: updatedUser.profile.gender,
          nationality: updatedUser.profile.nationality,
          country: updatedUser.profile.country,
          city: updatedUser.profile.city,
          address: updatedUser.profile.address,
          isActive: updatedUser.profile.isActive,
          role: updatedUser.profile.role ? {
            id: updatedUser.profile.role.id,
            roleName: updatedUser.profile.role.roleName
          } : null
        } : null
      }
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Instead of deleting, deactivate the user
    await prisma.profile.updateMany({
      where: { id: userId },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate user' },
      { status: 500 }
    )
  }
} 