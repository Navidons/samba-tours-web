import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch email templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const isSystem = searchParams.get('isSystem')
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit
    const where: any = {}

    if (isSystem !== null) {
      where.isSystem = isSystem === 'true'
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { sentEmails: true }
        }
      }),
      prisma.emailTemplate.count({ where })
    ])

    return NextResponse.json({
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Template API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new email template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, subject, htmlContent, textContent, variables, isSystem } = body

    if (!name || !slug || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if slug already exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { slug }
    })

    if (existingTemplate) {
      return NextResponse.json({ error: 'Template slug already exists' }, { status: 400 })
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        slug,
        description,
        subject,
        htmlContent,
        textContent,
        variables,
        isSystem: isSystem || false,
        isActive: true
      }
    })

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Template creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update email template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    // Check if slug is being updated and if it already exists
    if (updateData.slug) {
      const existingTemplate = await prisma.emailTemplate.findFirst({
        where: {
          slug: updateData.slug,
          id: { not: parseInt(id) }
        }
      })

      if (existingTemplate) {
        return NextResponse.json({ error: 'Template slug already exists' }, { status: 400 })
      }
    }

    const template = await prisma.emailTemplate.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Template update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete email template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    // Check if template is system template
    const template = await prisma.emailTemplate.findUnique({
      where: { id: parseInt(id) }
    })

    if (template?.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system templates' }, { status: 400 })
    }

    // Check if template is being used
    const usageCount = await prisma.emailSent.count({
      where: { templateId: parseInt(id) }
    })

    if (usageCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete template. It has been used ${usageCount} times.` 
      }, { status: 400 })
    }

    await prisma.emailTemplate.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true, message: 'Template deleted' })
  } catch (error) {
    console.error('Template deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
