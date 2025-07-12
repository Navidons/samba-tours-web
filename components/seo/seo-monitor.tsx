"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// TypeScript declarations for global objects
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
  
  interface PerformanceEntry {
    processingStart?: number
  }
}

export default function SEOMonitor() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page views for SEO analytics
    const trackPageView = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: pathname,
          page_title: document.title,
          page_location: window.location.href
        })
      }
    }

    // Track Core Web Vitals
    const trackWebVitals = () => {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        // Track Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            console.log('LCP:', lastEntry.startTime)
            // Send to analytics
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'LCP',
                value: Math.round(lastEntry.startTime)
              })
            }
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Track First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            const fid = (entry as any).processingStart - entry.startTime
            console.log('FID:', fid)
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'FID',
                value: Math.round(fid)
              })
            }
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Track Cumulative Layout Shift (CLS)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          console.log('CLS:', clsValue)
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'CLS',
              value: Math.round(clsValue * 1000) / 1000
            })
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      }
    }

    // Track SEO metrics
    const trackSEOMetrics = () => {
      // Track meta tag presence
      const metaTags = {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
        ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
        twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')
      }

      console.log('SEO Meta Tags:', metaTags)

      // Track structured data
      const structuredData = document.querySelectorAll('script[type="application/ld+json"]')
      console.log('Structured Data Count:', structuredData.length)

      // Track image optimization
      const images = document.querySelectorAll('img')
      const optimizedImages = Array.from(images).filter(img => 
        img.src.includes('next/image') || img.src.includes('optimized')
      )
      console.log('Optimized Images:', optimizedImages.length, 'of', images.length)
    }

    // Initialize tracking
    trackPageView()
    trackWebVitals()
    trackSEOMetrics()

    // Cleanup observers on unmount
    return () => {
      // PerformanceObserver cleanup is handled automatically
    }
  }, [pathname])

  return null // This component doesn't render anything
} 