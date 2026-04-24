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
  { name: "YouTube", href: "#", icon: Youtube, color: "hover:text-green-600" },
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
            <div className="text-center mb-8">
              <div className="inline-flex items-center bg-gradient-to-r from-green-600/20 to-green-700/20 text-green-600 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-green-600/30 backdrop-blur-sm">
                🌿 Wildlife & Nature Tours
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Stay Connected with Nature
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Join over <span className="text-green-400 font-semibold">10,000+</span> adventure seekers who receive our monthly newsletter with special offers, travel guides,
                and exclusive wildlife photography tips.
              </p>
              
              <div className="flex justify-center items-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">500+</div>
                  <div className="text-sm text-gray-400">Happy Travelers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">50+</div>
                  <div className="text-sm text-gray-400">Tour Destinations</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">4.9★</div>
                  <div className="text-sm text-gray-400">Customer Rating</div>
                </div>
              </div>

              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-green-600 pr-10 transition-all duration-300 ${
                      subscriptionStatus === "success" ? "border-green-600" :
                      subscriptionStatus === "error" ? "border-red-500" : ""
                    }`}
                  />
                  {subscriptionStatus === "success" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                  )}
                  {subscriptionStatus === "error" && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold px-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
              <p className="text-xs text-gray-400 mt-3">No spam, unsubscribe anytime. We respect your privacy.</p>
            </div>
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
                <h2 className="text-xl font-bold group-hover:text-green-600 transition-colors">Samba Tours</h2>
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
                <Award className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-green-400 transition-colors">Licensed Tour Operator</span>
              </div>
              <div className="flex items-center space-x-2 text-xs group">
                <Shield className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-green-400 transition-colors">Fully Insured & Bonded</span>
              </div>
              <div className="flex items-center space-x-2 text-xs group">
                <Heart className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-green-400 transition-colors">98% Customer Satisfaction</span>
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

          <div className="space-y-4">
            <h3 className="text-base font-bold mb-4 text-green-500">Quick Links</h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-2 text-gray-300 hover:text-green-400 transition-colors group"
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold mb-4 text-green-500">Services Offered</h3>
            <div className="space-y-2">
              {services.map((service) => (
                <Link
                  key={service.name}
                  href={service.href}
                  className="flex items-start space-x-2 text-gray-300 hover:text-green-400 transition-colors group"
                >
                  <service.icon className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-xs text-gray-400">{service.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Map className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-green-500">Popular Tours</h3>
            </div>
            <div className="space-y-2">
              {tourCategories.map((tour) => (
                <Link
                  key={tour.name}
                  href={tour.href}
                  className="flex items-center space-x-2 text-gray-300 hover:text-green-400 transition-colors group"
                >
                  <span className="text-lg">{tour.icon}</span>
                  <span>{tour.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold mb-4 text-green-500">Contact & Support</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-gray-300">
                  <div className="font-medium">Kampala, Uganda</div>
                  <div className="text-sm text-gray-400">East Africa's Wildlife Capital</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+256791742494" className="text-gray-300 hover:text-green-400 transition-colors">
                  +256 791 742 494
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:sambatours256@gmail.com" className="text-gray-300 hover:text-green-400 transition-colors">
                  sambatours256@gmail.com
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-gray-300">
                  <div>24/7 Support Available</div>
                  <div className="text-sm text-gray-400">Emergency Contact</div>
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
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-green-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-green-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-green-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-green-500 animate-pulse" />
              <span>in Uganda</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
