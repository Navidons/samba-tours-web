"use client"

import type React from "react"
import { useEffect, useState, Suspense } from "react"
import { usePathname } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  
  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only call usePathname after ensuring we're on the client
  const pathname = isClient ? usePathname() : ''

  // Routes that should not have header/footer
  const noLayoutRoutes = ["/admin", "/signin", "/signup"]

  // Check if current route should exclude layout
  const shouldExcludeLayout = isClient && noLayoutRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  )



  // For admin routes, always exclude layout immediately
  if (pathname.startsWith('/admin')) {
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
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
