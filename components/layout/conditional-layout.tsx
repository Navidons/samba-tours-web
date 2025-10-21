"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { usePathname } from "next/navigation"
import Header from "./header"
import Footer from "./footer"
import WhatsAppFloat from "./whatsapp-float"
import CopyProtection from "./copy-protection"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only call usePathname after ensuring we're on the client
  const currentPathname = isClient ? pathname : ''

  // Routes that should not have header/footer
  const noLayoutRoutes = ["/admin", "/signup"]

  // Check if current route should exclude layout
  const shouldExcludeLayout = isClient && noLayoutRoutes.some((route) =>
    currentPathname === route || currentPathname.startsWith(`${route}/`)
  )

  // For admin routes, always exclude layout immediately
  if (currentPathname.startsWith('/admin')) {
    return <>{children}</>
  }

  // During SSR or before hydration, render with layout to prevent flicker
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col">
        <CopyProtection />
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </div>
    )
  }

  if (shouldExcludeLayout) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CopyProtection />
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
        <Header />
      </Suspense>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
