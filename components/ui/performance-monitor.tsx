"use client"

import { useEffect, useState } from "react"

interface PerformanceMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
  imageLoadTimes: Record<string, number>
  debug: {
    lcpEntries: number
    navigationEntries: number
    resourceEntries: number
  }
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    imageLoadTimes: {},
    debug: {
      lcpEntries: 0,
      navigationEntries: 0,
      resourceEntries: 0
    }
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_PERFORMANCE_MONITOR === 'true') {
      setIsVisible(true)
    }

    if (!isVisible) return

    let lcpObserver: PerformanceObserver | null = null
    let fidObserver: PerformanceObserver | null = null
    let clsObserver: PerformanceObserver | null = null
    let imageObserver: PerformanceObserver | null = null

    // Fallback LCP measurement using web-vitals approach
    const measureLCPFallback = () => {
      let lcpValue = 0
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        console.log('LCP Observer triggered with entries:', entries.length)
        
        setMetrics(prev => ({ 
          ...prev, 
          debug: { ...prev.debug, lcpEntries: entries.length }
        }))
        
        const lastEntry = entries[entries.length - 1]
        if (lastEntry && lastEntry.startTime > lcpValue) {
          lcpValue = lastEntry.startTime
          console.log('LCP updated:', lcpValue)
          setMetrics(prev => ({ ...prev, lcp: lcpValue }))
        }
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
        console.log('LCP observer started successfully')
      } catch (error) {
        console.warn('LCP observer not supported:', error)
      }

      // Manual LCP measurement for hero image
      const measureHeroImageLCP = () => {
        const heroImage = document.querySelector('img[data-lcp="true"]') as HTMLImageElement
        if (heroImage) {
          console.log('Hero image found, measuring LCP manually')
          const imgLoadTime = performance.now()
          if (heroImage.complete) {
            console.log('Hero image already loaded, LCP:', imgLoadTime)
            setMetrics(prev => ({ ...prev, lcp: imgLoadTime }))
          } else {
            heroImage.addEventListener('load', () => {
              const loadTime = performance.now()
              console.log('Hero image loaded, LCP:', loadTime)
              setMetrics(prev => ({ ...prev, lcp: loadTime }))
            })
          }
        } else {
          console.log('Hero image not found')
        }
      }

      // Try manual measurement after a short delay
      setTimeout(measureHeroImageLCP, 100)

      // Fallback: measure after a delay if no LCP is detected
      setTimeout(() => {
        if (lcpValue === 0) {
          console.log('LCP fallback triggered - checking existing entries')
          // Try to get LCP from existing entries
          const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
          console.log('Existing LCP entries:', lcpEntries.length)
          if (lcpEntries.length > 0) {
            const lastEntry = lcpEntries[lcpEntries.length - 1]
            console.log('Setting LCP from existing entries:', lastEntry.startTime)
            setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
          } else {
            // Final fallback: use page load time
            const pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
            console.log('Using page load time as LCP fallback:', pageLoadTime)
            setMetrics(prev => ({ ...prev, lcp: pageLoadTime }))
          }
        }
      }, 5000)

      return observer
    }

    // Measure image loading performance
    const measureImagePerformance = () => {
      imageObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        setMetrics(prev => ({ 
          ...prev, 
          debug: { ...prev.debug, resourceEntries: entries.length }
        }))
        
        entries.forEach((entry) => {
          // Track all images, not just specific paths
          if (entry.name.includes('.jpg') || entry.name.includes('.jpeg') || entry.name.includes('.png') || entry.name.includes('.webp')) {
            const loadTime = entry.responseEnd - entry.fetchStart
            if (loadTime > 0) {
              console.log('Image loaded:', entry.name, loadTime)
              setMetrics(prev => ({
                ...prev,
                imageLoadTimes: {
                  ...prev.imageLoadTimes,
                  [entry.name]: loadTime
                }
              }))
            }
          }
        })
      })
      
      try {
        imageObserver.observe({ entryTypes: ['resource'] })
      } catch (error) {
        console.warn('Resource observer not supported:', error)
      }
    }

    // Measure Core Web Vitals
    const measureCoreWebVitals = () => {
      // Largest Contentful Paint - improved detection
      lcpObserver = measureLCPFallback()

      // First Input Delay
      fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstEntry = entries[0]
        if (firstEntry && firstEntry.processingStart && firstEntry.startTime) {
          setMetrics(prev => ({ ...prev, fid: firstEntry.processingStart - firstEntry.startTime }))
        }
      })
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (error) {
        console.warn('FID observer not supported:', error)
      }

      // Cumulative Layout Shift
      clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        setMetrics(prev => ({ ...prev, cls: clsValue }))
      })
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('CLS observer not supported:', error)
      }

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry && navigationEntry.responseStart && navigationEntry.requestStart) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
        console.log('TTFB calculated:', ttfb)
        setMetrics(prev => ({ 
          ...prev, 
          ttfb,
          debug: { ...prev.debug, navigationEntries: performance.getEntriesByType('navigation').length }
        }))
      }

      // Fallback CLS measurement after a delay
      setTimeout(() => {
        const clsEntries = performance.getEntriesByType('layout-shift')
        if (clsEntries.length > 0) {
          let clsValue = 0
          for (const entry of clsEntries) {
            if (!entry.hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          console.log('CLS fallback calculated:', clsValue)
          setMetrics(prev => ({ ...prev, cls: clsValue }))
        }
      }, 3000)
    }

    // Start measurements
    measureCoreWebVitals()
    measureImagePerformance()

    // Cleanup
    return () => {
      lcpObserver?.disconnect()
      fidObserver?.disconnect()
      clsObserver?.disconnect()
      imageObserver?.disconnect()
    }
  }, [isVisible])

  if (!isVisible) return null

  const getPerformanceGrade = (metric: number | null, thresholds: { good: number; needsImprovement: number }) => {
    if (metric === null) return 'N/A'
    if (metric <= thresholds.good) return '🟢 Good'
    if (metric <= thresholds.needsImprovement) return '🟡 Needs Improvement'
    return '🔴 Poor'
  }

  const averageImageLoadTime = Object.values(metrics.imageLoadTimes).length > 0
    ? Object.values(metrics.imageLoadTimes).reduce((a, b) => a + b, 0) / Object.values(metrics.imageLoadTimes).length
    : 0

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Performance Monitor</h3>
        <div className="flex gap-1">
          <button
            onClick={() => {
              // Force refresh of metrics
              const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
              const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
              const ttfb = navigationEntry ? navigationEntry.responseStart - navigationEntry.requestStart : null
              const clsEntries = performance.getEntriesByType('layout-shift')
              const resourceEntries = performance.getEntriesByType('resource')
              
              // Calculate CLS
              let clsValue = 0
              for (const entry of clsEntries) {
                if (!entry.hadRecentInput) {
                  clsValue += (entry as any).value
                }
              }
              
              // Get image load times
              const imageLoadTimes: Record<string, number> = {}
              resourceEntries.forEach((entry) => {
                if (entry.name.includes('.jpg') || entry.name.includes('.jpeg') || entry.name.includes('.png') || entry.name.includes('.webp')) {
                  const loadTime = entry.responseEnd - entry.fetchStart
                  if (loadTime > 0) {
                    imageLoadTimes[entry.name] = loadTime
                  }
                }
              })
              
              console.log('Manual refresh - LCP entries:', lcpEntries.length)
              console.log('Manual refresh - CLS value:', clsValue)
              console.log('Manual refresh - Images found:', Object.keys(imageLoadTimes).length)
              
              setMetrics(prev => ({
                ...prev,
                lcp: lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : null,
                ttfb,
                cls: clsValue,
                imageLoadTimes,
                debug: {
                  lcpEntries: lcpEntries.length,
                  navigationEntries: performance.getEntriesByType('navigation').length,
                  resourceEntries: resourceEntries.length
                }
              }))
            }}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={metrics.lcp && metrics.lcp > 2500 ? 'text-red-600' : 'text-green-600'}>
            {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Loading...'}
          </span>
          <span>{getPerformanceGrade(metrics.lcp, { good: 2500, needsImprovement: 4000 })}</span>
        </div>
        
        <div className="flex justify-between">
          <span>FID:</span>
          <span className={metrics.fid && metrics.fid > 100 ? 'text-red-600' : 'text-green-600'}>
            {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'Loading...'}
          </span>
          <span>{getPerformanceGrade(metrics.fid, { good: 100, needsImprovement: 300 })}</span>
        </div>
        
        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={metrics.cls && metrics.cls > 0.1 ? 'text-red-600' : 'text-green-600'}>
            {metrics.cls ? metrics.cls.toFixed(3) : 'Loading...'}
          </span>
          <span>{getPerformanceGrade(metrics.cls, { good: 0.1, needsImprovement: 0.25 })}</span>
        </div>
        
        <div className="flex justify-between">
          <span>TTFB:</span>
          <span className={metrics.ttfb && metrics.ttfb > 600 ? 'text-red-600' : 'text-green-600'}>
            {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'Loading...'}
          </span>
          <span>{getPerformanceGrade(metrics.ttfb, { good: 600, needsImprovement: 1800 })}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Avg Image Load:</span>
          <span className={averageImageLoadTime > 1000 ? 'text-red-600' : 'text-green-600'}>
            {Math.round(averageImageLoadTime)}ms
          </span>
          <span>{getPerformanceGrade(averageImageLoadTime, { good: 1000, needsImprovement: 2000 })}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Images Loaded:</span>
          <span>{Object.keys(metrics.imageLoadTimes).length}</span>
        </div>
        
        {/* Performance Summary */}
        <div className="border-t pt-2 mt-2">
          <div className="text-xs font-semibold text-gray-700 mb-1">Performance Summary:</div>
          <div className="text-xs text-gray-600">
            {metrics.lcp && metrics.lcp <= 2500 && metrics.ttfb && metrics.ttfb <= 600 && metrics.fid && metrics.fid <= 100 ? (
              <span className="text-green-600">✅ Excellent Performance</span>
            ) : metrics.lcp && metrics.lcp <= 4000 && metrics.ttfb && metrics.ttfb <= 1800 ? (
              <span className="text-yellow-600">⚠️ Good Performance</span>
            ) : (
              <span className="text-red-600">❌ Needs Improvement</span>
            )}
          </div>
        </div>
        
        {/* Debug Information */}
        <div className="border-t pt-2 mt-2">
          <div className="text-xs text-gray-500">
            <div>LCP Entries: {metrics.debug.lcpEntries}</div>
            <div>Nav Entries: {metrics.debug.navigationEntries}</div>
            <div>Resource Entries: {metrics.debug.resourceEntries}</div>
          </div>
        </div>
      </div>
      
    </div>
  )
} 