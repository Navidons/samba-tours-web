import { NextRequest, NextResponse } from 'next/server'
import { BackupService } from '@/lib/backup-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await BackupService.restoreBackup(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error restoring backup:', error)
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    )
  }
} 