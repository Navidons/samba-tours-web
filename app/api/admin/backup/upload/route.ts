import { NextRequest, NextResponse } from 'next/server'
import { BackupService } from '@/lib/backup-service'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('backup') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No backup file provided' },
        { status: 400 }
      )
    }

    const backup = await BackupService.uploadBackup(file)
    return NextResponse.json({ backup })
  } catch (error) {
    console.error('Error uploading backup:', error)
    return NextResponse.json(
      { error: 'Failed to upload backup' },
      { status: 500 }
    )
  }
} 