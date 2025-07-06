"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Routes that should not have header/footer
  const noLayoutRoutes = ["/admin", "/signin", "/signup"]

  // Check if current route should exclude layout
  const shouldExcludeLayout = noLayoutRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (shouldExcludeLayout) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
