"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { usePathname } from "next/navigation"
import Header from "./header"
import Footer from "./footer"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const scrollPositionRef = useRef<number>(0)
  const isDataLoadingRef = useRef<boolean>(false)

  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only call usePathname after ensuring we're on the client
  const currentPathname = isClient ? pathname : ''

  // Routes that should not have header/footer
  const noLayoutRoutes = ["/admin", "/signin", "/signup"]

  // Check if current route should exclude layout
  const shouldExcludeLayout = isClient && noLayoutRoutes.some((route) => 
    currentPathname === route || currentPathname.startsWith(`${route}/`)
  )

  // Preserve scroll position when data is loading
  useEffect(() => {
    if (!isClient) return

    const handleBeforeUnload = () => {
      scrollPositionRef.current = window.scrollY
    }

    const handleLoad = () => {
      // Restore scroll position after data loads
      if (scrollPositionRef.current > 0 && !isDataLoadingRef.current) {
        window.scrollTo(0, scrollPositionRef.current)
      }
    }

    // Prevent scroll to bottom during data loading
    const preventScrollToBottom = () => {
      isDataLoadingRef.current = true
      const currentScrollY = window.scrollY
      
      // Use requestAnimationFrame to restore position after DOM updates
      requestAnimationFrame(() => {
        if (window.scrollY !== currentScrollY) {
          window.scrollTo(0, currentScrollY)
        }
        isDataLoadingRef.current = false
      })
    }

    // Listen for data loading events
    const handleDataLoading = () => {
      isDataLoadingRef.current = true
    }

    const handleDataLoaded = () => {
      setTimeout(() => {
        isDataLoadingRef.current = false
      }, 100)
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('load', handleLoad)
    
    // Custom events for data loading states
    window.addEventListener('data-loading', handleDataLoading)
    window.addEventListener('data-loaded', handleDataLoaded)

    // Prevent scroll restoration on initial load
    if (typeof window !== 'undefined' && window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual'
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('load', handleLoad)
      window.removeEventListener('data-loading', handleDataLoading)
      window.removeEventListener('data-loaded', handleDataLoaded)
    }
  }, [isClient, currentPathname])

  // Prevent scroll to bottom on route changes
  useEffect(() => {
    if (!isClient) return
    
    const currentScrollY = window.scrollY
    
    // Use a small delay to ensure DOM has updated
    const timer = setTimeout(() => {
      if (window.scrollY !== currentScrollY && currentScrollY > 0) {
        window.scrollTo(0, currentScrollY)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [isClient, currentPathname])

  // For admin routes, always exclude layout immediately
  if (currentPathname.startsWith('/admin')) {
    return <>{children}</>
  }

  // During SSR or before hydration, render with layout to prevent flicker
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    )
  }

  if (shouldExcludeLayout) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
        <Header />
      </Suspense>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
