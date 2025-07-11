"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Menu, ShoppingCart, Phone, Mail, ChevronDown, X, Star, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

interface TourStats {
  totalTours: number
  featuredTours: number
  categories: number
}

interface TourCategory {
  id: number
  name: string
  slug: string
  description: string
  displayOrder: number
  isActive: boolean
}

interface FeaturedTour {
  id: number
  title: string
  slug: string
  shortDescription: string
  price: number
  duration: string
  featuredImage: {
    data: string // This can be either base64 string or full data URL
    name: string | null
    type: string | null
  } | null
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { getItemCount } = useCart()
  const cartItems = getItemCount()
  const [tourStats, setTourStats] = useState<TourStats>({
    totalTours: 0,
    featuredTours: 0,
    categories: 0
  })
  const [tourCategories, setTourCategories] = useState<TourCategory[]>([])
  const [currentTourTitle, setCurrentTourTitle] = useState<string>("")
  const [featuredTours, setFeaturedTours] = useState<FeaturedTour[]>([])
  const [currentFeaturedTour, setCurrentFeaturedTour] = useState<FeaturedTour | null>(null)
  const [currentTourIndex, setCurrentTourIndex] = useState(0)
  
  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only call usePathname after ensuring we're on the client
  const pathname = isClient ? usePathname() : ''

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch tour statistics, categories, and featured tours
  useEffect(() => {
    if (!isClient) return

    const fetchTourData = async () => {
      try {
        const [toursResponse, categoriesResponse, featuredToursResponse] = await Promise.all([
          fetch('/api/tours?limit=1'),
          fetch('/api/tours/categories'),
          fetch('/api/tours?limit=4') // Fetch any tours, not just featured
        ])
        
        if (toursResponse.ok) {
          const toursData = await toursResponse.json()
          if (toursData.success) {
            setTourStats(prev => ({
              ...prev,
              totalTours: toursData.pagination.total
            }))
          }
        }
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          if (categoriesData.success) {
            setTourCategories(categoriesData.categories)
            setTourStats(prev => ({
              ...prev,
              categories: categoriesData.categories.length
            }))
          }
        }

        if (featuredToursResponse.ok) {
          const featuredData = await featuredToursResponse.json()
          console.log('Tours response:', featuredData)
          if (featuredData.success && featuredData.tours.length > 0) {
            console.log('Tours data:', featuredData.tours)
            console.log('First tour featured image:', featuredData.tours[0]?.featuredImage)
            setFeaturedTours(featuredData.tours)
            setCurrentFeaturedTour(featuredData.tours[0])
            setCurrentTourIndex(0)
          } else {
            console.log('No tours found or API error')
          }
        } else {
          console.log('Tours API response not ok:', featuredToursResponse.status)
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

  // Auto-rotate featured tours
  useEffect(() => {
    if (featuredTours.length > 1) {
      const interval = setInterval(() => {
        nextFeaturedTour()
      }, 5000) // Change every 5 seconds

      return () => clearInterval(interval)
    }
  }, [featuredTours, currentTourIndex])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/tours?search=${encodeURIComponent(searchQuery)}`
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  const nextFeaturedTour = () => {
    if (featuredTours.length > 1) {
      const nextIndex = (currentTourIndex + 1) % featuredTours.length
      setCurrentTourIndex(nextIndex)
      setCurrentFeaturedTour(featuredTours[nextIndex])
    }
  }

  const prevFeaturedTour = () => {
    if (featuredTours.length > 1) {
      const prevIndex = currentTourIndex === 0 ? featuredTours.length - 1 : currentTourIndex - 1
      setCurrentTourIndex(prevIndex)
      setCurrentFeaturedTour(featuredTours[prevIndex])
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
            <a href="tel:+256700123456" className="flex items-center space-x-2 hover:text-emerald-200 transition-colors">
              <Phone className="h-4 w-4" />
              <span>+256 700 123 456</span>
            </a>
            <a
              href="mailto:info@sambatours.com"
              className="flex items-center space-x-2 hover:text-emerald-200 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>info@sambatours.com</span>
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
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white font-bold text-lg md:text-xl">ST</span>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center space-x-1 font-medium transition-colors hover:text-green-600 hover:bg-green-50 ${
                      pathname.startsWith("/tours") ? "text-green-600 bg-green-50" : "text-gray-700"
                    }`}
                  >
                    <span>Tours</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[500px] p-4 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 px-3 mb-2">
                      Tour Categories ({tourStats.categories})
                    </h4>
                    {tourCategories.length > 0 ? (
                      tourCategories.map((category) => {
                        const isActiveCategory = pathname.startsWith("/tours") && 
                          new URLSearchParams(window.location.search).get('category') === category.slug
                        return (
                          <DropdownMenuItem key={category.id} asChild>
                            <Link
                              href={`/tours?category=${category.slug}`}
                              className={`flex items-center space-x-3 rounded-md p-3 leading-none no-underline outline-none transition-colors group ${
                                isActiveCategory 
                                  ? "bg-green-100 text-green-700 border-l-4 border-green-500" 
                                  : "hover:bg-green-50 hover:text-green-600"
                              }`}
                            >
                              <span className="text-2xl">🌍</span>
                              <div>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium">{category.name}</span>
                                  {isActiveCategory && (
                                    <Badge className="ml-2 bg-green-500 text-white text-xs">Active</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{category.description || 'Explore amazing tours'}</p>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        )
                      })
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">Loading categories...</div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 px-3">
                      Featured Tours
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {featuredTours.length > 0 ? (
                        featuredTours.slice(0, 4).map((tour, index) => (
                          <Link
                            key={tour.id}
                            href={`/tours/${tour.slug}`}
                            className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-300 transition-all duration-200 hover:shadow-md"
                          >
                            {tour.featuredImage?.data ? (
                              <img
                                src={tour.featuredImage.data.startsWith('data:') 
                                  ? tour.featuredImage.data 
                                  : `data:${tour.featuredImage.type || 'image/jpeg'};base64,${tour.featuredImage.data}`
                                }
                                alt={tour.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  console.error('Image failed to load for tour:', tour.title)
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  target.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center ${tour.featuredImage?.data ? 'hidden' : ''}`}>
                              <span className="text-2xl">🌍</span>
                            </div>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200"></div>
                            <div className="absolute bottom-1 left-1 right-1">
                              <p className="text-white text-xs font-semibold truncate">
                                {tour.title}
                              </p>
                              <div className="flex items-center justify-between text-xs text-white/90">
                                <span>${tour.price}</span>
                                <span>{tour.duration}</span>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        // Fallback when no featured tours
                        Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center"
                          >
                            <span className="text-2xl">🌍</span>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-200"></div>
                            <div className="absolute bottom-1 left-1 right-1">
                              <p className="text-white text-xs font-semibold truncate">
                                Tour {index + 1}
                              </p>
                              <div className="flex items-center justify-between text-xs text-white/90">
                                <span>Coming Soon</span>
                                <span>3 Days</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <Button 
                      asChild 
                      size="sm" 
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      <Link href="/tours">
                        View All Tours
                      </Link>
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
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
                className="text-gray-600 hover:text-green-600 hover:bg-green-50"
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
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <nav className="flex flex-col space-y-2">
                      <MobileNavLink href="/">Home</MobileNavLink>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="tours" className="border-b-0">
                          <AccordionTrigger
                            className={`flex justify-between items-center w-full py-3 px-4 rounded-lg font-medium transition-colors hover:bg-gray-100 ${
                              pathname.startsWith("/tours") ? "text-green-600 bg-green-50" : "text-gray-700"
                            }`}
                          >
                            Tours
                            {pathname.startsWith("/tours") && (
                              <Badge className="ml-2 bg-green-500 text-white text-xs">Active</Badge>
                            )}
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pl-4">
                            <div className="flex flex-col space-y-1">
                              <SheetClose asChild>
                                <Link
                                  href="/tours"
                                  className={`block py-2 px-4 rounded-md transition-colors ${
                                    pathname === "/tours" 
                                      ? "text-green-600 bg-green-50 font-medium" 
                                      : "text-gray-600 hover:text-green-600 hover:bg-gray-100"
                                  }`}
                                >
                                  All Tours
                                </Link>
                              </SheetClose>
                              {tourCategories.length > 0 ? (
                                tourCategories.map((category) => {
                                  const isActiveCategory = pathname.startsWith("/tours") && 
                                    new URLSearchParams(window.location.search).get('category') === category.slug
                                  return (
                                    <SheetClose key={category.id} asChild>
                                      <Link
                                        href={`/tours?category=${category.slug}`}
                                        className={`flex items-center space-x-3 py-2 px-4 rounded-md transition-colors ${
                                          isActiveCategory 
                                            ? "text-green-600 bg-green-50 font-medium" 
                                            : "text-gray-600 hover:text-green-600 hover:bg-gray-100"
                                        }`}
                                      >
                                        <span className="text-lg">🌍</span>
                                        <span>{category.name}</span>
                                        {isActiveCategory && (
                                          <Badge className="ml-auto bg-green-500 text-white text-xs">Active</Badge>
                                        )}
                                      </Link>
                                    </SheetClose>
                                  )
                                })
                              ) : (
                                <div className="py-2 px-4 text-gray-500 text-sm">Loading categories...</div>
                              )}
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
            <div className="absolute top-full left-0 w-full border-t bg-white py-4 shadow-lg animate-fade-in">
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
