"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ShoppingCart, Menu, ArrowRight, Calendar, X } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useTourTitle } from "@/hooks/use-tour-title"

// Memoized navigation link components
const NavLink = memo(({ href, children, pathname }: { href: string; children: React.ReactNode; pathname: string }) => (
    <Link
      href={href}
      className={`font-medium transition-colors hover:text-green-700 ${
        pathname === href ? "text-green-700" : "text-gray-700"
      }`}
    >
      {children}
    </Link>
))
NavLink.displayName = 'NavLink'

const TourNavLink = memo(({ href, children, pathname }: { href: string; children: React.ReactNode; pathname: string }) => (
    <Link
      href={href}
      className={`font-medium transition-colors hover:text-green-700 ${
        pathname.startsWith("/tours") ? "text-green-700" : "text-gray-700"
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
          pathname === href ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-100"
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
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
        Samba Tours
      </h2>
      <p className="text-xs text-gray-600 -mt-1">
        {currentTourTitle ? `Viewing: ${currentTourTitle}` : "Uganda's Premier Safari Company"}
      </p>
    </div>
  </Link>
))
Logo.displayName = 'Logo'

// Top bar component
const TopBar = memo(function TopBar({ pathname }: { pathname: string }) {
  if (pathname.startsWith('/admin')) return null

  return (
    <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white py-2">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Book your adventure today!
            </span>
            <span className="inline-flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              Live chat available
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="tel:+256791742494" className="hover:text-emerald-200 transition-colors">
              +256 791 742 494
            </a>
            <a href="mailto:info@sambatours.co" className="hover:text-emerald-200 transition-colors hidden sm:inline">
              info@sambatours.co
            </a>
          </div>
        </div>
      </div>
    </div>
  )
})
TopBar.displayName = 'TopBar'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
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
                className="text-gray-600 hover:text-green-700 hover:bg-green-50 relative"
                onClick={() => router.push('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">
                    {cartItems}
                  </Badge>
                )}
              </Button>
              
              <Button
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-4 py-2 rounded-full shadow-lg hidden lg:flex transition-all duration-300 hover:shadow-xl"
                onClick={() => router.push('/contact')}
              >
                Book Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {/* Mobile Menu Trigger */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden hover:bg-green-50">
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
        </div>
      </header>
    </>
  )
}
