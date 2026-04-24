export interface MockUser {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  avatar?: string
  createdAt: Date
}

export interface AuthState {
  user: MockUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

class MockAuthService {
  private users: MockUser[] = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@sambatours.com",
      role: "admin",
      avatar: "/placeholder-user.jpg",
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      name: "Demo User",
      email: "demo@sambatours.com",
      role: "user",
      avatar: "/placeholder-user.jpg",
      createdAt: new Date("2024-01-15"),
    },
  ]

  private currentUser: MockUser | null = null

  constructor() {
    // Load user from localStorage on initialization
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("mockAuthUser")
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser)
        } catch (error) {
          console.error("Error parsing saved user:", error)
          localStorage.removeItem("mockAuthUser")
        }
      }
    }
  }

  async signIn(email: string, password: string): Promise<MockUser> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Demo credentials
    const validCredentials = [
      { email: "admin@sambatours.com", password: "admin123" },
      { email: "demo@sambatours.com", password: "demo123" },
    ]

    const isValid = validCredentials.some((cred) => cred.email === email && cred.password === password)

    if (!isValid) {
      throw new Error("Invalid email or password")
    }

    const user = this.users.find((u) => u.email === email)
    if (!user) {
      throw new Error("User not found")
    }

    this.currentUser = user
    if (typeof window !== "undefined") {
      localStorage.setItem("mockAuthUser", JSON.stringify(user))
    }

    return user
  }

  async signOut(): Promise<void> {
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("mockAuthUser")
    }
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }
}

export const mockAuthService = new MockAuthService()
