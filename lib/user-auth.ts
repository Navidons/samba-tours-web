// User authentication system with localStorage persistence
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: "customer" | "admin"
  createdAt: string
  avatar?: string
  preferences?: {
    newsletter: boolean
    notifications: boolean
    language: string
  }
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@sambatours.com",
    name: "Admin User",
    role: "admin",
    createdAt: "2024-01-01",
    avatar: "/placeholder-user.jpg",
    preferences: {
      newsletter: true,
      notifications: true,
      language: "en",
    },
  },
  {
    id: "2",
    email: "john@example.com",
    name: "John Doe",
    phone: "+256 700 123 456",
    role: "customer",
    createdAt: "2024-01-15",
    avatar: "/placeholder-user.jpg",
    preferences: {
      newsletter: true,
      notifications: false,
      language: "en",
    },
  },
]

// Get users from localStorage or use mock data
const getUsers = (): User[] => {
  if (typeof window === "undefined") return mockUsers
  const stored = localStorage.getItem("samba_users")
  return stored ? JSON.parse(stored) : mockUsers
}

// Save users to localStorage
const saveUsers = (users: User[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("samba_users", JSON.stringify(users))
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("samba_current_user")
  return stored ? JSON.parse(stored) : null
}

// Save current user to localStorage
const saveCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("samba_current_user", JSON.stringify(user))
  } else {
    localStorage.removeItem("samba_current_user")
  }
}

// Sign in function
export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const users = getUsers()
  const user = users.find((u) => u.email === email)

  // Simple password validation (in real app, use proper hashing)
  const validCredentials = [
    { email: "admin@sambatours.com", password: "admin123" },
    { email: "john@example.com", password: "password123" },
  ]

  const isValid = validCredentials.some((cred) => cred.email === email && cred.password === password)

  if (user && isValid) {
    saveCurrentUser(user)
    return { user, error: null }
  }

  return { user: null, error: "Invalid email or password" }
}

// Sign up function
export const signUp = async (userData: {
  name: string
  email: string
  phone?: string
  password: string
}): Promise<{ user: User | null; error: string | null }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const users = getUsers()

  // Check if user already exists
  if (users.some((u) => u.email === userData.email)) {
    return { user: null, error: "User with this email already exists" }
  }

  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email: userData.email,
    name: userData.name,
    phone: userData.phone,
    role: "customer",
    createdAt: new Date().toISOString(),
    avatar: "/placeholder-user.jpg",
    preferences: {
      newsletter: true,
      notifications: true,
      language: "en",
    },
  }

  // Save to mock database
  const updatedUsers = [...users, newUser]
  saveUsers(updatedUsers)
  saveCurrentUser(newUser)

  return { user: newUser, error: null }
}

// Sign out function
export const signOut = async (): Promise<void> => {
  saveCurrentUser(null)
}

// Update user profile
export const updateProfile = async (
  userId: string,
  updates: Partial<User>,
): Promise<{ user: User | null; error: string | null }> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    return { user: null, error: "User not found" }
  }

  const updatedUser = { ...users[userIndex], ...updates }
  users[userIndex] = updatedUser

  saveUsers(users)
  saveCurrentUser(updatedUser)

  return { user: updatedUser, error: null }
}

// Helper functions
export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin"
}

export const requireAuth = (): User => {
  const user = getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export const requireAdmin = (): User => {
  const user = requireAuth()
  if (!isAdmin(user)) {
    throw new Error("Admin access required")
  }
  return user
}
