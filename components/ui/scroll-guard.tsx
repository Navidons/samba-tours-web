"use client"

import { useEffect, useRef } from "react"
import { usePreventScrollToBottom } from "@/hooks/use-scroll-management"

interface ScrollGuardProps {
  children: React.ReactNode
  enabled?: boolean
}

export default function ScrollGuard({ children, enabled = true }: ScrollGuardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Use the prevent scroll to bottom hook
  usePreventScrollToBottom()

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

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

    // Prevent scroll to bottom during content changes
    const preventScrollToBottom = () => {
      const currentScrollY = window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      
      // If we're near the bottom and content changes, prevent auto-scroll
      if (currentScrollY + windowHeight >= documentHeight - 100) {
        requestAnimationFrame(() => {
          if (window.scrollY > currentScrollY) {
            window.scrollTo(0, currentScrollY)
          }
        })
      }
    }

    // Use ResizeObserver to detect content height changes
    const resizeObserver = new ResizeObserver(() => {
      if (!isDataLoading) {
        preventScrollToBottom()
      }
    })

    // Use MutationObserver to detect DOM changes
    const mutationObserver = new MutationObserver(() => {
      if (!isDataLoading) {
        preventScrollToBottom()
      }
    })

    // Add event listeners
    window.addEventListener('data-loading', handleDataLoading)
    window.addEventListener('data-loaded', handleDataLoaded)

    // Start observing
    resizeObserver.observe(document.body)
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    return () => {
      window.removeEventListener('data-loading', handleDataLoading)
      window.removeEventListener('data-loaded', handleDataLoaded)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [enabled])

  return (
    <div ref={containerRef} className="w-full">
      {children}
    </div>
  )
} 