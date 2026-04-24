"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock,
  Eye,
  Shield,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  Download,
  Upload
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { UserDetailModal } from "@/components/admin/user-detail-modal"
import { UserForm } from "@/components/admin/user-form"
import { UserBulkActions } from "@/components/admin/user-bulk-actions"

interface User {
  id: number
  email: string
  emailConfirmed: boolean
  lastSignInAt: string | null
  failedLoginAttempts: number
  accountLockedUntil: string | null
  createdAt: string
  updatedAt: string
  profile: {
    id: number
    fullName: string | null
    firstName: string | null
    lastName: string | null
    phone: string | null
    dateOfBirth: string | null
    gender: string | null
    nationality: string | null
    country: string | null
    city: string | null
    address: string | null
    isActive: boolean
    lastActivity: string | null
    role: {
      id: number
      roleName: string
      description: string | null
    } | null
  } | null
  stats: {
    totalBookings: number
    totalReviews: number
    totalComments: number
    totalWishlistItems: number
  }
}

interface UserRole {
  id: number
  roleName: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [currentPage, searchTerm, roleFilter, statusFilter, sortBy, sortOrder])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search: searchTerm,
        role: roleFilter === "all" ? "" : roleFilter,
        status: statusFilter === "all" ? "" : statusFilter,
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setRoles(data.filters.roles)
        setTotalPages(data.pagination.pages)
        setTotalUsers(data.pagination.total)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: number, action: string, data?: any) => {
    try {
      let response
      
      switch (action) {
        case 'resetPassword':
          response = await fetch(`/api/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: data.password })
          })
          break
          
        case 'activate':
        case 'deactivate':
          response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: action === 'activate' })
          })
          break
          
        case 'unlock':
          response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unlockAccount: true })
          })
          break
          
        case 'delete':
          response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
          })
          break
      }

      if (response?.ok) {
        toast({
          title: "Success",
          description: `User ${action} successful`,
        })
        loadUsers()
      } else {
        throw new Error('Action failed')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      })
    }
  }

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select users to perform bulk actions",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userIds: selectedUsers,
          data
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Bulk Action Complete",
          description: `${result.results.success} users updated successfully`,
        })
        setSelectedUsers([])
        loadUsers()
      } else {
        throw new Error('Bulk action failed')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      })
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (user: User) => {
    if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
      return <Badge variant="destructive">Locked</Badge>
    }
    if (!user.profile?.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (!user.emailConfirmed) {
      return <Badge variant="outline">Unconfirmed</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getRoleBadge = (role: any) => {
    if (!role) return <Badge variant="outline">No Role</Badge>
    
    const variants: { [key: string]: any } = {
      'admin': 'destructive',
      'moderator': 'default',
      'user': 'secondary'
    }
    
    return (
      <Badge variant={variants[role.roleName.toLowerCase()] || 'outline'}>
        {role.roleName}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
      <div className="flex items-center justify-between">
            <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
            </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowBulkActions(true)}
            disabled={selectedUsers.length === 0}
            variant="outline"
          >
            Bulk Actions ({selectedUsers.length})
          </Button>
          <Button
            onClick={() => setShowUserForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
                Add User
            </Button>
        </div>
          </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.profile?.isActive).length} active
            </p>
              </CardContent>
            </Card>

            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => {
                const created = new Date(u.createdAt)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length}
                  </div>
            <p className="text-xs text-muted-foreground">
              Registered this month
            </p>
              </CardContent>
            </Card>

            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Accounts</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.accountLockedUntil && new Date(u.accountLockedUntil) > new Date()).length}
                  </div>
            <p className="text-xs text-muted-foreground">
              Currently locked
            </p>
              </CardContent>
            </Card>

            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unconfirmed</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => !u.emailConfirmed).length}
                  </div>
            <p className="text-xs text-muted-foreground">
              Email not confirmed
            </p>
              </CardContent>
            </Card>
          </div>

              {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
                      </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="profile.fullName-asc">Name A-Z</SelectItem>
                <SelectItem value="profile.fullName-desc">Name Z-A</SelectItem>
                <SelectItem value="lastSignInAt-desc">Last Login</SelectItem>
              </SelectContent>
            </Select>
                  </div>
                </CardContent>
              </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {totalUsers} total users • Page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.profile?.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.profile?.fullName || 'No Name'}
                              </div>
                          <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.profile?.role)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Bookings: {user.stats.totalBookings}</div>
                        <div>Reviews: {user.stats.totalReviews}</div>
                        <div>Comments: {user.stats.totalComments}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(user.createdAt)}</div>
                        {user.lastSignInAt && (
                          <div className="text-muted-foreground">
                            Last: {formatDate(user.lastSignInAt)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserDetail(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                            >
                  Next
                            </Button>
                          </div>
            </div>
          )}
                </CardContent>
              </Card>

      {/* Modals */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          open={showUserDetail}
          onOpenChange={setShowUserDetail}
          onUserUpdate={loadUsers}
        />
      )}

      <UserForm
        user={selectedUser}
        open={showUserForm}
        onOpenChange={setShowUserForm}
        onSuccess={() => {
          setSelectedUser(null)
          loadUsers()
        }}
      />

      <UserBulkActions
        open={showBulkActions}
        onOpenChange={setShowBulkActions}
        selectedCount={selectedUsers.length}
        onAction={handleBulkAction}
        roles={roles}
      />
      </div>
  )
}
