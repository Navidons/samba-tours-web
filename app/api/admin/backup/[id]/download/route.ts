import { NextRequest, NextResponse } from 'next/server'
import { BackupService } from '@/lib/backup-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Download request for backup:', params.id)
    
    const backupData = await BackupService.downloadBackup(params.id)
    
    if (!backupData || backupData.length === 0) {
      return NextResponse.json(
        { error: 'Backup content is empty' },
        { status: 404 }
      )
    }
    
    console.log('Backup data length:', backupData.length)
    
    // Create response with proper headers for file download
    const response = new NextResponse(backupData, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="backup-${params.id}.sql"`,
        'Content-Length': backupData.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })
    
    return response
  } catch (error) {
    console.error('Error downloading backup:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download backup' },
      { status: 500 }
    )
  }
} 