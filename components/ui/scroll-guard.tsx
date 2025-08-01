"use client"

import { useEffect, useRef } from "react"

interface ScrollGuardProps {
  children: React.ReactNode
  enabled?: boolean
}

export default function ScrollGuard({ children, enabled = true }: ScrollGuardProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return

    let scrollPosition = 0
    let isDataLoading = false

    // Preserve scroll position before data changes
    const preserveScroll = () => {
      scrollPosition = window.scrollY
    }

    // Restore scroll position after data changes
    const restoreScroll = () => {
      if (scrollPosition > 0 && !isDataLoading) {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPosition)
        })
      }
    }

    // Listen for data loading events
    const handleDataLoading = () => {
      isDataLoading = true
      preserveScroll()
    }

    const handleDataLoaded = () => {
      setTimeout(() => {
        isDataLoading = false
        restoreScroll()
      }, 100)
    }

    // Add event listeners
    window.addEventListener('data-loading', handleDataLoading)
    window.addEventListener('data-loaded', handleDataLoaded)

    return () => {
      window.removeEventListener('data-loading', handleDataLoading)
      window.removeEventListener('data-loaded', handleDataLoaded)
    }
  }, [enabled])

  return (
    <div ref={containerRef} className="w-full">
      {children}
    </div>
  )
} 