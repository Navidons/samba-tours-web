"use client"

import { useEffect, useRef } from "react"

interface UseScrollManagementOptions {
  preserveScroll?: boolean
  preventAutoScroll?: boolean
}

export function useScrollManagement(options: UseScrollManagementOptions = {}) {
  const { preserveScroll = true, preventAutoScroll = true } = options
  const scrollPositionRef = useRef<number>(0)
  const isLoadingRef = useRef<boolean>(false)

  // Signal data loading start
  const startLoading = () => {
    if (typeof window !== 'undefined') {
      isLoadingRef.current = true
      scrollPositionRef.current = window.scrollY
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('data-loading'))
    }
  }

  // Signal data loading end
  const endLoading = () => {
    if (typeof window !== 'undefined') {
      isLoadingRef.current = false
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('data-loaded'))
      
      // Restore scroll position if needed
      if (preserveScroll && scrollPositionRef.current > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPositionRef.current)
        })
      }
    }
  }

  // Prevent auto-scroll during data loading
  useEffect(() => {
    if (!preventAutoScroll) return

    const preventScroll = () => {
      if (isLoadingRef.current) {
        const currentScrollY = window.scrollY
        requestAnimationFrame(() => {
          if (window.scrollY !== currentScrollY) {
            window.scrollTo(0, currentScrollY)
          }
        })
      }
    }

    // Use MutationObserver to detect DOM changes
    const observer = new MutationObserver(preventScroll)
    
    if (typeof window !== 'undefined') {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [preventAutoScroll])

  return {
    startLoading,
    endLoading,
    isLoading: isLoadingRef.current
  }
}

// Hook for preserving scroll position on specific elements
export function usePreserveScrollPosition(elementRef: React.RefObject<HTMLElement>) {
  const scrollPositionRef = useRef<number>(0)

  const preservePosition = () => {
    if (elementRef.current) {
      scrollPositionRef.current = elementRef.current.scrollTop
    }
  }

  const restorePosition = () => {
    if (elementRef.current && scrollPositionRef.current > 0) {
      elementRef.current.scrollTop = scrollPositionRef.current
    }
  }

  return {
    preservePosition,
    restorePosition
  }
}

// Hook for preventing scroll to bottom on data updates
export function usePreventScrollToBottom() {
  useEffect(() => {
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
    const resizeObserver = new ResizeObserver(preventScrollToBottom)
    
    if (typeof window !== 'undefined') {
      resizeObserver.observe(document.body)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])
} 