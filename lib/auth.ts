// Simple authentication system
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "customer"
  createdAt: string
}

// Mock users data
const users: User[] = [
  {
    id: "1",
    email: "admin@sambatours.com",
    name: "Admin User",
    role: "admin",
    createdAt: "2024-01-01",
  },
]

// Simple auth state management
let currentUser: User | null = null

export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  // Simple validation for demo
  if (email === "admin@sambatours.com" && password === "admin123") {
    currentUser = users[0]
    return { user: currentUser, error: null }
  }

  return { user: null, error: "Invalid credentials" }
}

export const signOut = async (): Promise<void> => {
  currentUser = null
}

export const getCurrentUser = (): User | null => {
  return currentUser
}

export const isAdmin = (): boolean => {
  return currentUser?.role === "admin"
}

export const requireAuth = (): User => {
  if (!currentUser) {
    throw new Error("Authentication required")
  }
  return currentUser
}

export const requireAdmin = (): User => {
  const user = requireAuth()
  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }
  return user
}
