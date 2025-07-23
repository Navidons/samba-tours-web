"use client"

import React, { useState, useEffect, useMemo, useCallback, memo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Menu, ShoppingCart, Phone, Mail, X, Star, Calendar, ArrowRight } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useTourTitle } from "@/hooks/use-tour-title"

// Memoized navigation link components
const NavLink = memo(({ href, children, pathname }: { href: string; children: React.ReactNode; pathname: string }) => (
    <Link
      href={href}
      className={`font-medium transition-colors hover:text-emerald-600 ${
        pathname === href ? "text-emerald-600" : "text-gray-700"
      }`}
    >
      {children}
    </Link>
))
NavLink.displayName = 'NavLink'

const TourNavLink = memo(({ href, children, pathname }: { href: string; children: React.ReactNode; pathname: string }) => (
    <Link
      href={href}
      className={`font-medium transition-colors hover:text-emerald-600 ${
        pathname.startsWith("/tours") ? "text-emerald-600" : "text-gray-700"
      }`}
    >
      {children}
    </Link>
))
TourNavLink.displayName = 'TourNavLink'

const MobileNavLink = memo(({ href, children, pathname }: { href: string; children: React.ReactNode; pathname: string }) => (
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
))
MobileNavLink.displayName = 'MobileNavLink'

// Memoized logo component
const Logo = memo(({ currentTourTitle }: { currentTourTitle: string }) => (
  <Link href="/" className="flex items-center space-x-3 group">
    <div className="w-12 h-14 md:w-16 md:h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden rounded-full">
      <img 
        src="/logo/samba tours-01.png" 
        alt="Samba Tours Logo" 
        className="w-full h-full object-contain rounded-full"
        loading="eager"
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
))
Logo.displayName = 'Logo'

// Memoized top bar component
const TopBar = memo(({ pathname }: { pathname: string }) => (
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
))
TopBar.displayName = 'TopBar'

// Memoized search bar component
const SearchBar = memo(({ 
  isSearchOpen, 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  setIsSearchOpen 
}: {
  isSearchOpen: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleSearch: (e: React.FormEvent) => void
  setIsSearchOpen: (open: boolean) => void
}) => {
  if (!isSearchOpen) return null
  
  return (
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
  )
})
SearchBar.displayName = 'SearchBar'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  const { getItemCount } = useCart()
  const pathname = usePathname()
  const router = useRouter()
  const currentTourTitle = useTourTitle()

  // Memoize cart items count to prevent unnecessary re-renders
  const cartItems = useMemo(() => getItemCount(), [getItemCount])

  // Memoize scroll handler
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10)
  }, [])

  // Memoize search handler
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/tours?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }, [searchQuery, router])

  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Optimized scroll listener with throttling
  useEffect(() => {
    if (!isClient) return

    let ticking = false
    const handleScrollThrottled = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScrollThrottled, { passive: true })
    return () => window.removeEventListener("scroll", handleScrollThrottled)
  }, [isClient, handleScroll])



  // Memoize navigation items to prevent re-creation
  const navItems = useMemo(() => [
    { href: "/", label: "Home" },
    { href: "/tours", label: "Tours", isTour: true },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/gallery", label: "Gallery" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" }
  ], [])

  return (
    <>
      <TopBar pathname={pathname} />

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
            <Logo currentTourTitle={currentTourTitle} />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => 
                item.isTour ? (
                  <TourNavLink key={item.href} href={item.href} pathname={pathname}>
                    {item.label}
                  </TourNavLink>
                ) : (
                  <NavLink key={item.href} href={item.href} pathname={pathname}>
                    {item.label}
                  </NavLink>
                )
              )}
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
                      {navItems.map((item) => (
                        <MobileNavLink key={item.href} href={item.href} pathname={pathname}>
                          {item.label}
                        </MobileNavLink>
                      ))}

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
          <SearchBar 
            isSearchOpen={isSearchOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            setIsSearchOpen={setIsSearchOpen}
          />
        </div>
      </header>
    </>
  )
}
