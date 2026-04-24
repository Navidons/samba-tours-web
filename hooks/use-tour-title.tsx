"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// Simple in-memory cache for tour titles
const tourTitleCache = new Map<string, string>()

export function useTourTitle() {
  const [currentTourTitle, setCurrentTourTitle] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const pathname = usePathname()

  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch current tour title only when necessary
  useEffect(() => {
    if (!isClient || !pathname.startsWith('/tours/') || pathname === '/tours') {
      setCurrentTourTitle("")
      return
    }

    const tourSlug = pathname.split('/').pop()
    if (!tourSlug) return

    // Check cache first
    if (tourTitleCache.has(tourSlug)) {
      setCurrentTourTitle(tourTitleCache.get(tourSlug) || "")
      return
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    const fetchCurrentTour = async () => {
      try {
        const response = await fetch(`/api/tours/${tourSlug}`, {
          signal: abortControllerRef.current!.signal
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.tour) {
            const title = data.tour.title
            // Cache the result
            tourTitleCache.set(tourSlug, title)
            setCurrentTourTitle(title)
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching tour details:', error)
        }
      }
    }

    fetchCurrentTour()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [pathname, isClient])

  // Clear cache when component unmounts (optional - for memory management)
  useEffect(() => {
    return () => {
      // Optionally clear cache after some time or when memory usage is high
      // For now, we'll keep the cache as it's useful for navigation
    }
  }, [])

  return currentTourTitle
} 
