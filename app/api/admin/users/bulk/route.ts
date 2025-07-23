import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userIds, data } = body

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'Invalid request: action and userIds array required' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    switch (action) {
      case 'activate':
        await prisma.profile.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: true }
        })
        results.success = userIds.length
        break

      case 'deactivate':
        await prisma.profile.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false }
        })
        results.success = userIds.length
        break

      case 'changeRole':
        if (!data?.roleId) {
          return NextResponse.json(
            { error: 'Role ID is required for role change' },
            { status: 400 }
          )
        }
        await prisma.profile.updateMany({
          where: { id: { in: userIds } },
          data: { roleId: parseInt(data.roleId) }
        })
        results.success = userIds.length
        break

      case 'delete':
        // For delete, we'll deactivate users instead of actually deleting them
        await prisma.profile.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false }
        })
        results.success = userIds.length
        break

      case 'unlock':
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            failedLoginAttempts: 0,
            accountLockedUntil: null
          }
        })
        results.success = userIds.length
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
} 
