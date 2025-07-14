"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Clock, Award, Shield, Heart, CheckCircle, AlertCircle, Globe, Star, Users, Calendar, Car, Camera, Map, Hotel } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const quickLinks = [
  { name: "About Us", href: "/about", icon: "🏛️" },
  { name: "Our Tours", href: "/tours", icon: "🌍" },
  { name: "Gallery", href: "/gallery", icon: "📸" },
  { name: "Blog", href: "/blog", icon: "📝" },
  { name: "Contact", href: "/contact", icon: "📞" },
]

const tourCategories = [
  { name: "Gorilla Trekking", href: "/tours?category=gorilla-trekking", icon: "🦍" },
  { name: "Wildlife Safari", href: "/tours?category=wildlife-safari", icon: "🦁" },
  { name: "Mountain Trekking", href: "/tours?category=mountain-trekking", icon: "⛰️" },
  { name: "Cultural Tours", href: "/tours?category=cultural", icon: "🏺" },
  { name: "Bird Watching", href: "/tours?category=bird-watching", icon: "🦅" },
  { name: "Adventure Tours", href: "/tours?category=adventure", icon: "🎯" },
]

const services = [
  { name: "Safari Tours", href: "/tours?category=wildlife-safari", icon: Camera, description: "Wildlife safaris in Uganda's national parks" },
  { name: "Gorilla Trekking", href: "/tours?category=gorilla-trekking", icon: Users, description: "Mountain gorilla encounters in Bwindi" },
  { name: "Hotel Booking", href: "/contact", icon: Hotel, description: "Reserve accommodations across Uganda" },
  { name: "Visa Processes", href: "/contact", icon: Map, description: "Assistance with visa applications" },
  { name: "Airport Pickups", href: "/contact", icon: Car, description: "Reliable airport transfer services" },
  { name: "Visitors Transportation", href: "/contact", icon: Car, description: "Comprehensive transport solutions" },
  { name: "Travel Insurance", href: "/contact", icon: Shield, description: "Comprehensive travel protection" },
  { name: "Currency Exchange", href: "/contact", icon: Globe, description: "Convenient currency services" },
  { name: "Customer Tours", href: "/contact", icon: Map, description: "Tailored experiences for your needs" },
  { name: "Photography Tours", href: "/tours?category=photography", icon: Camera, description: "Professional photography expeditions" },
]

const socialLinks = [
  { name: "Facebook", href: "#", icon: Facebook, color: "hover:text-blue-500" },
  { name: "Twitter", href: "#", icon: Twitter, color: "hover:text-sky-500" },
  { name: "Instagram", href: "#", icon: Instagram, color: "hover:text-pink-500" },
  { name: "YouTube", href: "#", icon: Youtube, color: "hover:text-emerald-500" },
]

export default function Footer() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to subscribe.",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setSubscriptionStatus("idle")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubscriptionStatus("success")
        setEmail("")
        toast({
          title: "Successfully Subscribed! 🎉",
          description: data.message || "You'll receive our latest updates and exclusive offers.",
        })
      } else {
        setSubscriptionStatus("error")
        toast({
          title: "Subscription Failed",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setSubscriptionStatus("error")
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-green-500/30 backdrop-blur-sm">
              <Mail className="h-4 w-4 mr-2" />
              Stay Updated with Safari Deals
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Get Exclusive Safari Deals & Travel Tips
            </h3>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
              Join over <span className="text-green-400 font-semibold">10,000+</span> adventure seekers who receive our monthly newsletter with special offers, travel guides,
              and insider tips for unforgettable Uganda experiences.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">500+</div>
                <div className="text-xs text-gray-400">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">50+</div>
                <div className="text-xs text-gray-400">Tour Packages</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">4.9★</div>
                <div className="text-xs text-gray-400">Average Rating</div>
              </div>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-green-500 pr-10 transition-all duration-300 ${
                    subscriptionStatus === "success" ? "border-green-500" : 
                    subscriptionStatus === "error" ? "border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                />
                {subscriptionStatus === "success" && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
                {subscriptionStatus === "error" && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                )}
              </div>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-semibold px-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            <p className="text-xs text-gray-400 mt-3">No spam, unsubscribe anytime. We respect your privacy.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4 group">
              <div className="w-12 h-14 md:w-14 md:h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden">
                <img 
                  src="/logo/samba tours-01.png" 
                  alt="Samba Tours Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <span className="text-white font-bold text-xl hidden">ST</span>
              </div>
              <div>
                <h2 className="text-xl font-bold group-hover:text-emerald-400 transition-colors">Samba Tours</h2>
                <p className="text-xs text-gray-400">Uganda Safari Adventures</p>
              </div>
            </Link>

            <p className="text-gray-300 mb-4 leading-relaxed text-sm">
              Your trusted partner for authentic Uganda safari experiences. We create unforgettable adventures that
              connect you with Uganda's incredible wildlife and rich culture.
            </p>

            {/* Trust Indicators */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-xs group">
                <Award className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-emerald-400 transition-colors">Licensed Tour Operator</span>
              </div>
              <div className="flex items-center space-x-2 text-xs group">
                <Shield className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-emerald-400 transition-colors">Fully Insured & Bonded</span>
              </div>
              <div className="flex items-center space-x-2 text-xs group">
                <Heart className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-emerald-400 transition-colors">98% Customer Satisfaction</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-2">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Button 
                    key={social.name}
                    size="sm" 
                    variant="ghost" 
                    className={`text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 ${social.color}`}
                    asChild
                  >
                    <Link href={social.href} aria-label={social.name}>
                      <Icon className="h-4 w-4" />
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold mb-4 text-green-400">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group text-sm"
                  >
                    <span className="mr-2 text-sm">{link.icon}</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-200">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Offered */}
          <div>
            <h3 className="text-base font-bold mb-4 text-green-400">Services Offered</h3>
            <ul className="space-y-2">
              {services.map((service) => {
                const Icon = service.icon
                return (
                  <li key={service.name}>
                    <Link
                      href={service.href}
                      className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group text-sm"
                    >
                      <Icon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{service.name}</span>
                    </Link>
                  </li>
                )
              })}
              <li>
                <Link
                  href="/services"
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group text-sm"
                >
                  <Map className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">View All Services</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Tour Categories */}
          <div>
            <h3 className="text-base font-bold mb-4 text-green-400">Popular Tours</h3>
            <ul className="space-y-2">
              {tourCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group text-sm"
                  >
                    <span className="mr-2 text-sm">{category.icon}</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-200">{category.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-base font-bold mb-4 text-green-400">Contact & Support</h3>

            {/* Contact Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start space-x-2 group">
                <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-sm">
                  <p className="text-gray-300 group-hover:text-white transition-colors">Plot 123, Kampala Road</p>
                  <p className="text-gray-300 group-hover:text-white transition-colors">Kampala, Uganda</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 group">
                <Phone className="h-4 w-4 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-sm">
                  <p className="text-gray-300 group-hover:text-white transition-colors">+256 703 267 150</p>
                  <p className="text-gray-300 group-hover:text-white transition-colors">+256 771 023 297</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 group">
                <Mail className="h-4 w-4 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <p className="text-gray-300 group-hover:text-white transition-colors text-sm">sambatours256@gmail.com</p>
              </div>

              <div className="flex items-center space-x-2 group">
                <Clock className="h-4 w-4 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-sm">
                  <p className="text-gray-300 group-hover:text-white transition-colors">Mon - Fri: 8AM - 6PM</p>
                  <p className="text-gray-300 group-hover:text-white transition-colors">Sat - Sun: 9AM - 5PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4 text-xs text-gray-400">
              <p>&copy; {new Date().getFullYear()} Samba Tours Uganda. All rights reserved.</p>
              <div className="flex items-center space-x-3">
                <Link href="/terms" className="hover:text-green-400 transition-colors">
                  Terms of Service
                </Link>
                <span>•</span>
                <Link href="/privacy" className="hover:text-green-400 transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link href="/cookies" className="hover:text-green-400 transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span>in Uganda</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
