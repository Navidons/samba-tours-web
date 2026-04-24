import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const roles = await prisma.userRole.findMany({
      select: {
        id: true,
        roleName: true,
        description: true,
        createdAt: true
      },
      orderBy: {
        roleName: 'asc'
      }
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { roleName, description } = await request.json()

    if (!roleName || !roleName.trim()) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      )
    }

    // Check if role already exists
    const existingRole = await prisma.userRole.findFirst({
      where: {
        roleName: roleName.trim()
      }
    })

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 }
      )
    }

    const newRole = await prisma.userRole.create({
      data: {
        roleName: roleName.trim(),
        description: description?.trim() || null,
        permissions: {} // Default empty permissions object
      },
      select: {
        id: true,
        roleName: true,
        description: true,
        createdAt: true
      }
    })

    return NextResponse.json(newRole, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
} 
