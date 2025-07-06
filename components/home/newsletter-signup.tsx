"use client"

import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Send, Gift, Star, Users, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const benefits = [
  "🎁 Exclusive 15% discount on your first booking",
  "📧 Early access to new tour packages",
  "🏆 VIP customer support and priority booking",
  "📸 Monthly photo contests with amazing prizes",
  "🌍 Insider tips from our expert guides",
  "💰 Special seasonal offers and flash sales",
]

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          source: "homepage"
        }),
      })

      if (response.ok) {
        setIsSubscribed(true)
        toast({
          title: "Welcome to the Samba Family! 🎉",
          description: "Check your email for your exclusive 15% discount code.",
        })
        setEmail("")
      } else {
        throw new Error("Failed to subscribe")
      }
    } catch (error) {
      toast({
        title: "Oops! Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <section className="py-20 bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-max px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Gift className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Welcome to the Samba Family!</h2>
            <p className="text-xl text-forest-100 mb-8">
              Your exclusive 15% discount code is on its way to your inbox. Start planning your dream Uganda adventure!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-bold rounded-full"
                asChild
              >
                <Link href="/tours">
                  Browse Tours Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-forest-900 px-8 py-4 text-lg font-bold rounded-full bg-transparent"
                asChild
              >
                <Link href="/contact">Plan Custom Trip</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="container-max px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-2">
                    Join the Adventure
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                      Community
                    </span>
                  </h2>
                </div>
              </div>

              <p className="text-xl text-forest-100 mb-8 leading-relaxed">
                Get exclusive access to special offers, insider travel tips, and be the first to know about new
                adventures. Plus, receive an instant 15% discount on your first booking!
              </p>

              {/* Benefits List */}
              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                    <span className="text-forest-100">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-yellow-400" />
                  <span className="text-forest-100">12,000+ subscribers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-forest-100">4.9/5 newsletter rating</span>
                </div>
              </div>
            </div>

            {/* Right Content - Signup Form */}
            <div>
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Get Your 15% Discount</h3>
                    <p className="text-forest-100">Join now and save on your first adventure!</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-lg py-6 rounded-xl focus:bg-white/30 focus:border-white/50 transition-all duration-300"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3" />
                          Subscribing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="h-6 w-6 mr-3" />
                          Get My 15% Discount Now
                        </div>
                      )}
                    </Button>
                  </form>

                  <p className="text-forest-200 text-sm text-center mt-4">
                    We respect your privacy. Unsubscribe at any time.{" "}
                    <Link href="/privacy" className="text-yellow-300 hover:text-yellow-200 underline">
                      Privacy Policy
                    </Link>
                  </p>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-white/20">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">12K+</div>
                      <div className="text-forest-200 text-xs">Happy Subscribers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">Weekly</div>
                      <div className="text-forest-200 text-xs">Travel Tips</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">15%</div>
                      <div className="text-forest-200 text-xs">Instant Savings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional CTAs */}
              <div className="mt-6 text-center">
                <p className="text-forest-200 mb-4">Not ready to subscribe? That's okay!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full bg-transparent"
                    asChild
                  >
                    <Link href="/tours">Browse Tours</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full bg-transparent"
                    asChild
                  >
                    <Link href="/gallery">View Gallery</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full bg-transparent"
                    asChild
                  >
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
