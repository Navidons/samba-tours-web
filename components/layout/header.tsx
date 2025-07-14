"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Menu, ShoppingCart, Phone, Mail, ChevronDown, X, Star, Calendar, Car, Plane, Hotel, Camera, Map, Users, Shield, Globe, ArrowRight } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

interface TourStats {
  totalTours: number
}





const services = [
  {
    name: "Safari Tours",
    description: "Wildlife safaris in Uganda's national parks",
    icon: Camera,
    href: "/services",
    features: ["Big Five Game Drives", "Professional Guides", "Luxury Lodges"]
  },
  {
    name: "Gorilla Trekking",
    description: "Mountain gorilla encounters in Bwindi",
    icon: Users,
    href: "/services",
    features: ["Permit Included", "Expert Trackers", "Conservation Focus"]
  },
  {
    name: "Hotel Booking",
    description: "Reserve accommodations across Uganda",
    icon: Hotel,
    href: "/services",
    features: ["Luxury Lodges", "Eco-Friendly", "Prime Locations"]
  },
  {
    name: "Visa Processes",
    description: "Assistance with visa applications",
    icon: Map,
    href: "/services",
    features: ["Application Support", "Documentation Help", "Fast Processing"]
  },
  {
    name: "Airport Pickups",
    description: "Reliable airport transfer services",
    icon: Car,
    href: "/services",
    features: ["Meet & Greet", "Flight Monitoring", "Comfortable Vehicles"]
  },
  {
    name: "Visitors Transportation",
    description: "Comprehensive transport solutions",
    icon: Car,
    href: "/services",
    features: ["Safari Vehicles", "Private Chauffeurs", "Group Transport"]
  },
  {
    name: "Travel Insurance",
    description: "Comprehensive travel protection",
    icon: Shield,
    href: "/services",
    features: ["Medical Coverage", "Trip Cancellation", "24/7 Support"]
  },
  {
    name: "Currency Exchange",
    description: "Convenient currency services",
    icon: Globe,
    href: "/services",
    features: ["Competitive Rates", "Multiple Currencies", "Secure Transactions"]
  },
  {
    name: "Customer Tours",
    description: "Tailored experiences for your needs",
    icon: Map,
    href: "/services",
    features: ["Personalized Itineraries", "Flexible Scheduling", "Private Groups"]
  },
  {
    name: "Photography Tours",
    description: "Professional photography expeditions",
    icon: Camera,
    href: "/services",
    features: ["Expert Photographers", "Specialized Equipment", "Prime Locations"]
  }
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { getItemCount } = useCart()
  const cartItems = getItemCount()
  const [tourStats, setTourStats] = useState<TourStats>({
    totalTours: 0
  })
  const [currentTourTitle, setCurrentTourTitle] = useState<string>("")
  
  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only call usePathname after ensuring we're on the client
  const pathname = isClient ? usePathname() : ''
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch tour statistics
  useEffect(() => {
    if (!isClient) return

    const fetchTourData = async () => {
      try {
        const toursResponse = await fetch('/api/tours?limit=1')
        
        if (toursResponse.ok) {
          const toursData = await toursResponse.json()
          if (toursData.success) {
            setTourStats(prev => ({
              ...prev,
              totalTours: toursData.pagination.total
            }))
          }
        }
      } catch (error) {
        console.error('Error fetching tour data:', error)
      }
    }

    fetchTourData()
  }, [isClient])

  // Fetch current tour title if on tour detail page
  useEffect(() => {
    if (!isClient) return

    const fetchCurrentTour = async () => {
      if (pathname.startsWith('/tours/') && pathname !== '/tours') {
        const tourSlug = pathname.split('/').pop()
        if (tourSlug) {
          try {
            const response = await fetch(`/api/tours/${tourSlug}`)
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.tour) {
                setCurrentTourTitle(data.tour.title)
              }
            }
          } catch (error) {
            console.error('Error fetching tour details:', error)
          }
        }
      } else {
        setCurrentTourTitle("")
      }
    }

    fetchCurrentTour()
  }, [pathname, isClient])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tours?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={`font-medium transition-colors hover:text-emerald-600 ${
        pathname === href ? "text-emerald-600" : "text-gray-700"
      }`}
    >
      {children}
    </Link>
  )

  const TourNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={`font-medium transition-colors hover:text-emerald-600 ${
        pathname.startsWith("/tours") ? "text-emerald-600" : "text-gray-700"
      }`}
    >
      {children}
    </Link>
  )

  const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <SheetClose asChild>
      <Link
        href={href}
        className={`block py-3 px-4 rounded-lg font-medium transition-colors ${
          pathname === href ? "bg-emerald-50 text-emerald-600" : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {children}
      </Link>
    </SheetClose>
  )

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 hidden md:block">
        <div className="container mx-auto max-w-7xl flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <a href="tel:+256703267150" className="flex items-center space-x-2 hover:text-emerald-200 transition-colors">
              <Phone className="h-4 w-4" />
              <span>+256 703 267 150</span>
            </a>
            <a
              href="mailto:sambatours256@gmail.com"
              className="flex items-center space-x-2 hover:text-emerald-200 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>sambatours256@gmail.com</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            {pathname.startsWith("/tours") && (
              <div className="flex items-center space-x-1 bg-green-400/20 px-2 py-1 rounded-full border border-green-400/50">
                <Calendar className="h-3 w-3 text-green-400" />
                <span className="font-bold text-xs">
                  {pathname === "/tours" ? "Exploring Tours" : "Tour Details"}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-1 bg-green-400/20 px-2 py-1 rounded-full border border-green-400/50">
              <Star className="h-3 w-3 text-green-400 fill-current" />
              <span className="font-bold text-xs">4.9/5 Customer Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-gray-200"
            : "bg-white/80 backdrop-blur-sm shadow-sm border-transparent"
        }`}
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-14 md:w-16 md:h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden rounded-full">
                <img 
                  src="/logo/samba tours-01.png" 
                  alt="Samba Tours Logo" 
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <span className="text-white font-bold text-lg md:text-xl hidden">ST</span>
              </div>
              <div className="hidden sm:block">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  Samba Tours
                </h2>
                <p className="text-xs text-gray-600 -mt-1">
                  {currentTourTitle ? `Viewing: ${currentTourTitle}` : "Uganda's Premier Safari Company"}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <NavLink href="/">Home</NavLink>
              <TourNavLink href="/tours">Tours</TourNavLink>
              <NavLink href="/services">Services</NavLink>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/gallery">Gallery</NavLink>
              <NavLink href="/blog">Blog</NavLink>
              <NavLink href="/contact">Contact</NavLink>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 md:space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-600 hover:text-green-600 hover:bg-green-50 hidden lg:flex"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-gray-600 hover:text-green-600 hover:bg-green-50 relative"
              >
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0 animate-pulse">
                      {cartItems}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-4 py-2 rounded-full shadow-lg hidden lg:flex transition-all duration-300 hover:shadow-xl"
                asChild
              >
                <Link href="/contact">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Link>
              </Button>

              {/* Mobile Menu Trigger */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden hover:bg-emerald-50">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] p-0 flex flex-col bg-white animate-slide-in-from-right">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <nav className="flex flex-col space-y-2">
                      <MobileNavLink href="/">Home</MobileNavLink>
                      <MobileNavLink href="/tours">Tours</MobileNavLink>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="services" className="border-b-0">
                          <AccordionTrigger className="flex justify-between items-center w-full py-3 px-4 rounded-lg font-medium transition-colors hover:bg-gray-100 text-gray-700">
                            Services
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pl-4">
                            <div className="flex flex-col space-y-1">
                              <SheetClose asChild>
                                <Link
                                  href="/services"
                                  className="flex items-center space-x-3 py-2 px-4 rounded-md transition-colors text-green-600 hover:text-green-700 hover:bg-green-50 font-medium"
                                >
                                  <ArrowRight className="h-4 w-4" />
                                  <span>View All Services</span>
                                </Link>
                              </SheetClose>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <MobileNavLink href="/about">About</MobileNavLink>
                      <MobileNavLink href="/gallery">Gallery</MobileNavLink>
                      <MobileNavLink href="/blog">Blog</MobileNavLink>
                      <MobileNavLink href="/contact">Contact</MobileNavLink>
                    </nav>
                  </div>

                  <div className="p-4 border-t space-y-4 bg-gray-50">
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/cart">
                        <ShoppingCart className="h-4 w-4 mr-2" /> Cart ({cartItems})
                      </Link>
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold"
                      asChild
                    >
                      <Link href="/contact">
                        <Calendar className="h-4 w-4 mr-2" /> Book Your Adventure
                      </Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Search Bar */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 w-full border-t bg-white py-4 shadow-lg animate-fade-in z-50">
              <div className="container mx-auto max-w-2xl px-4">
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <Input
                    placeholder="Search tours, destinations, activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-green-300 focus:border-green-500 focus:ring-green-500"
                    autoFocus
                  />
                  <Button type="submit" className="bg-green-500 hover:bg-green-600">
                    <Search className="h-4 w-4 mr-2" /> Search
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsSearchOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
