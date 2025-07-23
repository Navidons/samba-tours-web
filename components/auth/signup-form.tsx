"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User, Phone, Chrome, Facebook, Apple } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUserAuth } from "@/components/auth/user-auth-provider"

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
  })
  const router = useRouter()
  const { signUp } = useUserAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      await signUp({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })

      // Redirect to account page
      router.push("/account")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign up failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignUp = (provider: string) => {
    console.log(`Signing up with ${provider}`)
    // Implement social signup
  }

  return (
    <div className="space-y-6">
      {/* Social Signup */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full bg-transparent" onClick={() => handleSocialSignUp("google")}>
          <Chrome className="h-4 w-4 mr-2" />
          Sign up with Google
        </Button>
        <Button variant="outline" className="w-full bg-transparent" onClick={() => handleSocialSignUp("facebook")}>
          <Facebook className="h-4 w-4 mr-2" />
          Sign up with Facebook
        </Button>
        <Button variant="outline" className="w-full bg-transparent" onClick={() => handleSocialSignUp("apple")}>
          <Apple className="h-4 w-4 mr-2" />
          Sign up with Apple
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                type="text"
                required
                className="pl-10"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="lastName"
                type="text"
                required
                className="pl-10"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>
        </div>

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
          <Label htmlFor="phone">Phone number (optional)</Label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              className="pl-10"
              placeholder="+256 700 123 456"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              placeholder="Create a password (min. 6 characters)"
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

        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              className="pl-10 pr-10"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm leading-5">
              I agree to the{" "}
              <Link href="/terms" className="text-orange-600 hover:text-orange-500 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-orange-600 hover:text-orange-500 underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.subscribeNewsletter}
              onCheckedChange={(checked) => setFormData({ ...formData, subscribeNewsletter: checked as boolean })}
            />
            <Label htmlFor="newsletter" className="text-sm">
              Subscribe to our newsletter for travel tips and exclusive offers
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          By creating an account, you'll be able to save tours, track bookings, and receive personalized
          recommendations.
        </p>
      </div>
    </div>
  )
}
