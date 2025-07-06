import { NextRequest, NextResponse } from 'next/server'
import { BackupService } from '@/lib/backup-service'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await BackupService.deleteBackup(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting backup:', error)
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    )
  }
} 