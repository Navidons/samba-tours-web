import { NextResponse } from 'next/server'
import { BackupService } from '@/lib/backup-service'

export async function GET() {
  try {
    const stats = await BackupService.getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting backup stats:', error)
    return NextResponse.json(
      { error: 'Failed to get backup stats' },
      { status: 500 }
    )
  }
} 