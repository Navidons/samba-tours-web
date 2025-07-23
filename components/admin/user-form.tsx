"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Lock,
  Eye,
  EyeOff,
  Save,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  email: string
  emailConfirmed: boolean
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
    role: {
      id: number
      roleName: string
    } | null
  } | null
}

interface UserRole {
  id: number
  roleName: string
}

interface UserFormProps {
  user?: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function UserForm({ user, open, onOpenChange, onSuccess }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleId: '',
    isActive: true,
    dateOfBirth: '',
    gender: '',
    nationality: '',
    country: '',
    city: '',
    address: ''
  })
  const [showNewRoleForm, setShowNewRoleForm] = useState(false)
  const [newRoleData, setNewRoleData] = useState({
    roleName: '',
    description: ''
  })
  const { toast } = useToast()

  const isEditing = !!user

  useEffect(() => {
    if (open) {
      loadRoles()
      if (user) {
        setFormData({
          email: user.email,
          password: '',
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          phone: user.profile?.phone || '',
          roleId: user.profile?.role?.id.toString() || '',
          isActive: user.profile?.isActive ?? true,
          dateOfBirth: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '',
          gender: user.profile?.gender || '',
          nationality: user.profile?.nationality || '',
          country: user.profile?.country || '',
          city: user.profile?.city || '',
          address: user.profile?.address || ''
        })
      } else {
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
          roleId: '',
          isActive: true,
          dateOfBirth: '',
          gender: '',
          nationality: '',
          country: '',
          city: '',
          address: ''
        })
      }
    }
  }, [open, user])

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setRoles(data.filters.roles)
      }
    } catch (error) {
      console.error('Error loading roles:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/admin/users/${user.id}` : '/api/admin/users'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${isEditing ? 'updated' : 'created'} successfully`,
        })
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save user')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateRole = async () => {
    if (!newRoleData.roleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/admin/users/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoleData)
      })

      if (response.ok) {
        const newRole = await response.json()
        setRoles(prev => [...prev, newRole])
        setFormData(prev => ({ ...prev, roleId: newRole.id.toString() }))
        setShowNewRoleForm(false)
        setNewRoleData({ roleName: '', description: '' })
        toast({
          title: "Success",
          description: "Role created successfully",
        })
      } else {
        throw new Error('Failed to create role')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{isEditing ? 'Edit User' : 'Create New User'}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update user information' : 'Add a new user to the system'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        disabled={isEditing}
                      />
                    </div>
                    
                    {!isEditing && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender || "none"} onValueChange={(value) => handleInputChange('gender', value === "none" ? "" : value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select gender</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.roleId || "none"} onValueChange={(value) => handleInputChange('roleId', value === "none" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select role</SelectItem>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.roleName}
                          </SelectItem>
                        ))}
                        <SelectItem value="create-new">+ Create New Role</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {formData.roleId === "create-new" && (
                      <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="newRoleName">Role Name *</Label>
                            <Input
                              id="newRoleName"
                              value={newRoleData.roleName}
                              onChange={(e) => setNewRoleData(prev => ({ ...prev, roleName: e.target.value }))}
                              placeholder="Enter role name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="newRoleDescription">Description</Label>
                            <Input
                              id="newRoleDescription"
                              value={newRoleData.description}
                              onChange={(e) => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Enter role description"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleCreateRole}
                            >
                              Create Role
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, roleId: "none" }))
                                setNewRoleData({ roleName: '', description: '' })
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Account is active</Label>
                  </div>

                  {isEditing && (
                    <Alert>
                      <AlertDescription>
                        To change the password, use the "Reset Password" action in the user details.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
