"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, Chrome, Facebook, Apple } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUserAuth } from "@/components/auth/user-auth-provider"

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const router = useRouter()
  const { signIn } = useUserAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await signIn(formData.email, formData.password)

      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/account")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign in failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = (provider: string) => {
    console.log(`Signing in with ${provider}`)
    // Implement social signin
  }

  return (
    <div className="space-y-6">
      {/* Demo Credentials */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-2">Demo Credentials</h3>
        <div className="text-sm text-orange-800 space-y-1">
          <p>
            <strong>Admin:</strong> admin@sambatours.com / admin123
          </p>
          <p>
            <strong>Customer:</strong> john@example.com / password123
          </p>
        </div>
      </div>

      {/* Social Signin */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full bg-transparent" onClick={() => handleSocialSignIn("google")}>
          <Chrome className="h-4 w-4 mr-2" />
          Sign in with Google
        </Button>
        <Button variant="outline" className="w-full bg-transparent" onClick={() => handleSocialSignIn("facebook")}>
          <Facebook className="h-4 w-4 mr-2" />
          Sign in with Facebook
        </Button>
        <Button variant="outline" className="w-full bg-transparent" onClick={() => handleSocialSignIn("apple")}>
          <Apple className="h-4 w-4 mr-2" />
          Sign in with Apple
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
        )}

        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              required
              className="pl-10"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              className="pl-10 pr-10"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-500">
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-orange-600 hover:text-orange-500">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}
