"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Download, 
  Upload, 
  Database, 
  Clock, 
  HardDrive, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  Shield
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BackupInfo {
  id: string
  filename: string
  size: string
  createdAt: string
  status: 'completed' | 'in_progress' | 'failed'
  type: 'manual' | 'auto'
  tables: string[]
  recordCount: number
}

interface BackupStats {
  totalBackups: number
  totalSize: string
  lastBackup: string
  autoBackupsEnabled: boolean
  nextAutoBackup: string
  storageUsed: string
  storageLimit: string
}

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  useEffect(() => {
    loadBackups()
    loadStats()
  }, [])

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/admin/backup')
      if (response.ok) {
        const data = await response.json()
        setBackups(data.backups)
      }
    } catch (error) {
      console.error('Error loading backups:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/backup/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const createBackup = async () => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual' })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Backup Created Successfully",
          description: `Backup created: ${data.backup.filename} (${data.backup.size})`,
        })
        loadBackups()
        loadStats()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Backup creation error:', error)
      toast({
        title: "Backup Failed",
        description: error instanceof Error ? error.message : "There was an error creating the backup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const downloadBackup = async (backupId: string) => {
    try {
      console.log('Downloading backup:', backupId)
      
      const response = await fetch(`/api/admin/backup/${backupId}/download`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      console.log('Backup blob size:', blob.size)
      
      if (blob.size === 0) {
        throw new Error('Backup file is empty')
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${backupId}.sql`
      a.style.display = 'none'
      
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)
      
      toast({
        title: "Download Started",
        description: "Your backup file is being downloaded.",
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "There was an error downloading the backup.",
        variant: "destructive",
      })
    }
  }

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/backup/${backupId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Backup Deleted",
          description: "The backup has been permanently deleted.",
        })
        loadBackups()
        loadStats()
      } else {
        throw new Error('Failed to delete backup')
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the backup.",
        variant: "destructive",
      })
    }
  }

  const restoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite your current database.')) {
      return
    }

    setIsRestoring(true)
    try {
      const response = await fetch(`/api/admin/backup/${backupId}/restore`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: "Backup Restored Successfully",
          description: "Your database has been restored from the backup.",
        })
      } else {
        throw new Error('Failed to restore backup')
      }
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "There was an error restoring the backup.",
        variant: "destructive",
      })
    } finally {
      setIsRestoring(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('backup', file)

    try {
      const response = await fetch('/api/admin/backup/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast({
          title: "Backup Uploaded Successfully",
          description: "The backup file has been uploaded and verified.",
        })
        loadBackups()
        loadStats()
      } else {
        throw new Error('Failed to upload backup')
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the backup file.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-yellow-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Backup</h1>
          <p className="text-muted-foreground">
            Manage your database backups and restore points
          </p>
        </div>
        <Button
          onClick={createBackup}
          disabled={isCreating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isCreating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Creating Backup...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Create Backup
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="restore">Restore</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBackups}</div>
                  <p className="text-xs text-muted-foreground">
                    Last: {formatDate(stats.lastBackup)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Storage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.storageUsed}</div>
                  <Progress value={70} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.storageLimit} memory limit
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Auto Backups</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.autoBackupsEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Next: {formatDate(stats.nextAutoBackup)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSize}</div>
                  <p className="text-xs text-muted-foreground">
                    All backups combined
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Backup System:</strong> Backups are generated in memory and downloaded immediately to your browser. 
              Recent backups (last 10) are kept in memory for quick access. For long-term storage, download and save backups to your local system.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="backups" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Backup History</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={loadBackups}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".sql"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Backup
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {backups.map((backup) => (
              <Card key={backup.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(backup.status)}`}></div>
                      <div>
                        <h3 className="font-semibold">{backup.filename}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(backup.createdAt)} • {backup.size} • {backup.recordCount} records
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={backup.type === 'manual' ? 'default' : 'secondary'}>
                            {backup.type === 'manual' ? 'Manual' : 'Auto'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {backup.tables.length} tables
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadBackup(backup.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreBackup(backup.id)}
                        disabled={isRestoring}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBackup(backup.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restore" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Restore Database</CardTitle>
              <CardDescription>
                Choose a backup to restore your database. This will overwrite your current data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {backups.filter(b => b.status === 'completed').map((backup) => (
                  <div
                    key={backup.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedBackup === backup.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedBackup(backup.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{backup.filename}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(backup.createdAt)} • {backup.size}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={backup.type === 'manual' ? 'default' : 'secondary'}>
                          {backup.type}
                        </Badge>
                        {selectedBackup === backup.id && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedBackup && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => restoreBackup(selectedBackup)}
                    disabled={isRestoring}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isRestoring ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Restoring...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Restore Selected Backup
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
              <CardDescription>
                Configure automatic backup settings and retention policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Automatic Backups</h3>
                    <p className="text-sm text-muted-foreground">
                      Daily backups at 2:00 AM
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Retention Policy</h3>
                    <p className="text-sm text-muted-foreground">
                      Keep backups for 30 days
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Compression</h3>
                    <p className="text-sm text-muted-foreground">
                      Compress backups to save space
                    </p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 