"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Activity, 
  Lock, 
  Unlock,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  recentActivity?: {
    bookings: any[]
    reviews: any[]
    comments: any[]
  }
  stats: {
    totalBookings: number
    totalReviews: number
    totalComments: number
    totalWishlistItems: number
  }
}

interface UserDetailModalProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdate: () => void
}

export function UserDetailModal({ user, open, onOpenChange, onUserUpdate }: UserDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [fullUserData, setFullUserData] = useState<User | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const { toast } = useToast()

  // Fetch full user details when modal opens
  useEffect(() => {
    if (open && user && !fullUserData) {
      fetchUserDetails()
    }
  }, [open, user])

  const fetchUserDetails = async () => {
    setLoadingDetails(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setFullUserData(data.user)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Use full user data if available, otherwise use the basic user data
  const displayUser = fullUserData || user

  const handleAction = async (action: string, data?: any) => {
    setLoading(true)
    try {
      let response
      
      switch (action) {
        case 'resetPassword':
          const newPassword = Math.random().toString(36).slice(-8)
          response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
          })
          if (response.ok) {
            toast({
              title: "Password Reset",
              description: `New password: ${newPassword}`,
            })
          }
          break
          
        case 'activate':
        case 'deactivate':
          response = await fetch(`/api/admin/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: action === 'activate' })
          })
          if (response.ok) {
            toast({
              title: "User Updated",
              description: `User ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
            })
            onUserUpdate()
            // Refresh user details
            fetchUserDetails()
          }
          break
          
        case 'unlock':
          response = await fetch(`/api/admin/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unlockAccount: true })
          })
          if (response.ok) {
            toast({
              title: "Account Unlocked",
              description: "User account has been unlocked",
            })
            onUserUpdate()
            // Refresh user details
            fetchUserDetails()
          }
          break
          
        case 'delete':
          if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            response = await fetch(`/api/admin/users/${user.id}`, {
              method: 'DELETE'
            })
            if (response.ok) {
              toast({
                title: "User Deleted",
                description: "User has been deleted successfully",
              })
              onOpenChange(false)
              onUserUpdate()
            }
          }
          break
      }

      if (response && !response.ok) {
        throw new Error('Action failed')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = () => {
    if (displayUser.accountLockedUntil && new Date(displayUser.accountLockedUntil) > new Date()) {
      return <Badge variant="destructive">Locked</Badge>
    }
    if (!displayUser.profile?.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (!displayUser.emailConfirmed) {
      return <Badge variant="outline">Unconfirmed</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getRoleBadge = () => {
    if (!displayUser.profile?.role) return <Badge variant="outline">No Role</Badge>
    
    const variants: { [key: string]: any } = {
      'admin': 'destructive',
      'moderator': 'default',
      'user': 'secondary'
    }
    
    return (
      <Badge variant={variants[displayUser.profile.role.roleName.toLowerCase()] || 'outline'}>
        {displayUser.profile.role.roleName}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Details</span>
            {getStatusBadge()}
          </DialogTitle>
          <DialogDescription>
            View and manage user account information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{displayUser.email}</span>
                    {displayUser.emailConfirmed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  {displayUser.profile?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span>{displayUser.profile.phone}</span>
                    </div>
                  )}
                  
                  {displayUser.profile?.dateOfBirth && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Date of Birth:</span>
                      <span>{formatDate(displayUser.profile.dateOfBirth)}</span>
                    </div>
                  )}
                  
                  {displayUser.profile?.gender && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Gender:</span>
                      <span>{displayUser.profile.gender}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {displayUser.profile?.country && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span>{displayUser.profile.city}, {displayUser.profile.country}</span>
                    </div>
                  )}
                  
                  {displayUser.profile?.nationality && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Nationality:</span>
                      <span>{displayUser.profile.nationality}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Role:</span>
                    {getRoleBadge()}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Status:</span>
                    {getStatusBadge()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{displayUser.stats.totalBookings}</div>
                    <div className="text-sm text-muted-foreground">Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{displayUser.stats.totalReviews}</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{displayUser.stats.totalComments}</div>
                    <div className="text-sm text-muted-foreground">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{displayUser.stats.totalWishlistItems}</div>
                    <div className="text-sm text-muted-foreground">Wishlist Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {loadingDetails ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading activity data...
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Recent Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {displayUser.recentActivity?.bookings && displayUser.recentActivity.bookings.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tour</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayUser.recentActivity.bookings.map((booking: any) => (
                            <TableRow key={booking.id}>
                              <TableCell>{booking.tour?.title}</TableCell>
                              <TableCell>{formatDate(booking.createdAt)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{booking.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">No recent bookings</p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Reviews */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {displayUser.recentActivity?.reviews && displayUser.recentActivity.reviews.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tour</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayUser.recentActivity.reviews.map((review: any) => (
                            <TableRow key={review.id}>
                              <TableCell>{review.tour?.title}</TableCell>
                              <TableCell>{review.rating}/5</TableCell>
                              <TableCell>{formatDate(review.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">No recent reviews</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            {/* Security Information */}
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Failed Login Attempts</div>
                    <div className="text-2xl font-bold">{displayUser.failedLoginAttempts}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium">Account Locked Until</div>
                    <div className="text-sm">
                      {displayUser.accountLockedUntil ? formatDate(displayUser.accountLockedUntil) : 'Not locked'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium">Last Sign In</div>
                    <div className="text-sm">
                      {displayUser.lastSignInAt ? formatDate(displayUser.lastSignInAt) : 'Never'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium">Account Created</div>
                    <div className="text-sm">{formatDate(displayUser.createdAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {displayUser.accountLockedUntil && new Date(displayUser.accountLockedUntil) > new Date() && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This account is currently locked due to multiple failed login attempts.
                  The lock will expire on {formatDate(displayUser.accountLockedUntil)}.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>User Actions</CardTitle>
                <CardDescription>
                  Perform administrative actions on this user account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleAction('resetPassword')}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Password
                  </Button>
                  
                  {displayUser.profile?.isActive ? (
                    <Button
                      onClick={() => handleAction('deactivate')}
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Deactivate Account
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleAction('activate')}
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      <Unlock className="mr-2 h-4 w-4" />
                      Activate Account
                    </Button>
                  )}
                  
                  {displayUser.accountLockedUntil && new Date(displayUser.accountLockedUntil) > new Date() && (
                    <Button
                      onClick={() => handleAction('unlock')}
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      <Unlock className="mr-2 h-4 w-4" />
                      Unlock Account
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => handleAction('delete')}
                    disabled={loading}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 
