"use client"

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitorTracker() {
  // Temporarily disabled until database is configured
  return null

  const pathname = usePathname()
  const lastTrackedRef = useRef<string>('')

  useEffect(() => {
    // Skip tracking for admin routes
    if (pathname.startsWith('/admin')) {
      return
    }

    // Track the visit
    trackVisit(pathname)
  }, [pathname])

  const trackVisit = async (pagePath: string) => {
    try {
      // Check if we should track this visit (avoid duplicate tracking)
      const now = Date.now()
      const lastTracked = sessionStorage.getItem('lastTracked')
      const lastPath = sessionStorage.getItem('lastPath')
      
      // Only track if:
      // 1. It's been more than 30 seconds since last tracking, OR
      // 2. It's a different page than last tracked
      const timeDiff = lastTracked ? now - parseInt(lastTracked) : Infinity
      const isDifferentPage = lastPath !== pagePath
      
      if (lastTracked && timeDiff < 30000 && !isDifferentPage) {
        return
      }

      // Track the visit
      const response = await fetch('/api/track-visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pagePath,
          timestamp: now,
          referrer: document.referrer || null,
        }),
      })

      if (response.ok) {
        // Mark as tracked
        sessionStorage.setItem('lastTracked', now.toString())
        sessionStorage.setItem('lastPath', pagePath)
        lastTrackedRef.current = pagePath
      }
    } catch (error) {
      // Silently fail to avoid breaking user experience
      console.error('Error tracking visit:', error)
    }
  }

  return null // This component doesn't render anything
} 