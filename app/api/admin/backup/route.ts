import { NextRequest, NextResponse } from 'next/server'
import { BackupService } from '@/lib/backup-service'

export async function GET() {
  try {
    const backups = await BackupService.listBackups()
    return NextResponse.json({ backups })
  } catch (error) {
    console.error('Error listing backups:', error)
    return NextResponse.json(
      { error: 'Failed to list backups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type = 'manual' } = body

    const backup = await BackupService.createBackup(type)
    return NextResponse.json({ backup })
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    )
  }
} 