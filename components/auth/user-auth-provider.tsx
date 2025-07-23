"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  getCurrentUser,
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
  updateProfile as authUpdateProfile,
} from "@/lib/user-auth"
import type { User } from "@/lib/user-auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (userData: { name: string; email: string; phone?: string; password: string }) => Promise<User>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<User>
  refreshUser: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
    }
  }

  const signIn = async (email: string, password: string): Promise<User> => {
    const result = await authSignIn(email, password)
    if (result.user) {
      setUser(result.user)
      return result.user
    }
    throw new Error(result.error || "Sign in failed")
  }

  const signUp = async (userData: { name: string; email: string; phone?: string; password: string }): Promise<User> => {
    const result = await authSignUp(userData)
    if (result.user) {
      setUser(result.user)
      return result.user
    }
    throw new Error(result.error || "Sign up failed")
  }

  const signOut = async () => {
    await authSignOut()
    setUser(null)
  }

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!user) throw new Error("No user logged in")

    const result = await authUpdateProfile(user.id, updates)
    if (result.user) {
      setUser(result.user)
      return result.user
    }
    throw new Error(result.error || "Profile update failed")
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error initializing auth:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshUser,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useUserAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider")
  }
  return context
}
