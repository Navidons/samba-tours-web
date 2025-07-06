"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/mock-auth-provider"
import AdminLayout from "@/components/admin/admin-layout"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Allow access to tours pages without authentication
    const toursPages = ["/admin/tours", "/admin/tours/new"]
    const isToursPage = toursPages.some(page => pathname.startsWith(page))
    
    if (!isLoading && !isAuthenticated && pathname !== "/admin/signin" && !isToursPage) {
      router.push("/admin/signin")
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // Show signin page without admin layout
  if (pathname === "/admin/signin") {
    return <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">{children}</div>
  }

  // Show loading or redirect to signin (except for tours pages)
  const toursPages = ["/admin/tours", "/admin/tours/new"]
  const isToursPage = toursPages.some(page => pathname.startsWith(page))
  
  if ((isLoading || !isAuthenticated) && !isToursPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return <AdminLayout>{children}</AdminLayout>
}
