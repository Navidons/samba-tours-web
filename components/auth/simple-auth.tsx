"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "@/lib/auth"
import { useAuth } from "./auth-provider"

export function SimpleAuth() {
  const [email, setEmail] = useState("admin@sambatours.com")
  const [password, setPassword] = useState("admin123")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { user, signOut: authSignOut } = useAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn(email, password)
      if (!result) {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("Sign in failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await authSignOut()
  }

  if (user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Signed In</CardTitle>
          <CardDescription>Welcome, {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Role: {user.role || "user"}</p>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Admin Sign In</CardTitle>
        <CardDescription>Sign in to manage tours</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>Demo Credentials:</strong>
            <br />
            Email: admin@sambatours.com
            <br />
            Password: admin123
            <br />
            <em>Create this user through Supabase Auth first</em>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
