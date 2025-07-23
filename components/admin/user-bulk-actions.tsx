"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Shield, 
  Lock, 
  Unlock, 
  Trash2, 
  AlertTriangle,
  CheckCircle
} from "lucide-react"

interface UserRole {
  id: number
  roleName: string
}

interface UserBulkActionsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  onAction: (action: string, data?: any) => void
  roles: UserRole[]
}

export function UserBulkActions({ 
  open, 
  onOpenChange, 
  selectedCount, 
  onAction, 
  roles 
}: UserBulkActionsProps) {
  const [action, setAction] = useState("")
  const [roleId, setRoleId] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    if (!action) return

    setLoading(true)
    try {
      await onAction(action, { roleId })
      setAction("")
      setRoleId("")
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const getActionDescription = () => {
    switch (action) {
      case 'activate':
        return 'Activate all selected user accounts'
      case 'deactivate':
        return 'Deactivate all selected user accounts'
      case 'changeRole':
        return 'Change role for all selected users'
      case 'delete':
        return 'Delete all selected users (this action cannot be undone)'
      case 'unlock':
        return 'Unlock all selected user accounts'
      default:
        return 'Select an action to perform on the selected users'
    }
  }

  const getActionIcon = () => {
    switch (action) {
      case 'activate':
        return <Unlock className="h-4 w-4" />
      case 'deactivate':
        return <Lock className="h-4 w-4" />
      case 'changeRole':
        return <Shield className="h-4 w-4" />
      case 'delete':
        return <Trash2 className="h-4 w-4" />
      case 'unlock':
        return <Unlock className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const isDestructive = action === 'delete'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Bulk Actions</span>
          </DialogTitle>
          <DialogDescription>
            {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">Select Action</Label>
            <Select value={action || "none"} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Choose an action</SelectItem>
                <SelectItem value="activate">
                  <div className="flex items-center space-x-2">
                    <Unlock className="h-4 w-4" />
                    <span>Activate Users</span>
                  </div>
                </SelectItem>
                <SelectItem value="deactivate">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Deactivate Users</span>
                  </div>
                </SelectItem>
                <SelectItem value="changeRole">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Change Role</span>
                  </div>
                </SelectItem>
                <SelectItem value="unlock">
                  <div className="flex items-center space-x-2">
                    <Unlock className="h-4 w-4" />
                    <span>Unlock Accounts</span>
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Users</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {action && (
            <Alert>
              <div className="flex items-center space-x-2">
                {getActionIcon()}
                <AlertDescription>
                  {getActionDescription()}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {action === 'changeRole' && (
            <div className="space-y-2">
              <Label htmlFor="role">New Role</Label>
              <Select value={roleId || "default"} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Select new role</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {action === 'delete' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will permanently delete {selectedCount} user{selectedCount !== 1 ? 's' : ''}. 
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={!action || action === "none" || loading || (action === 'changeRole' && (!roleId || roleId === "default"))}
              variant={isDestructive ? "destructive" : "default"}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {getActionIcon()}
                  <span className="ml-2">
                    {action === 'activate' && 'Activate Users'}
                    {action === 'deactivate' && 'Deactivate Users'}
                    {action === 'changeRole' && 'Change Role'}
                    {action === 'delete' && 'Delete Users'}
                    {action === 'unlock' && 'Unlock Users'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
