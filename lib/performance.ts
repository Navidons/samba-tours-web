export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private isEnabled = process.env.NODE_ENV === 'development'

  startTimer(name: string) {
    if (!this.isEnabled) return null
    
    const start = performance.now()
    return {
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - start
        this.recordMetric(name, duration, metadata)
      }
    }
  }

  recordMetric(name: string, duration: number, metadata?: Record<string, any>) {
    if (!this.isEnabled) return

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata
    }

    this.metrics.push(metric)
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metadata)
    }
  }

  getMetrics() {
    return this.metrics
  }

  clearMetrics() {
    this.metrics = []
  }

  getAverageDuration(name: string) {
    const relevantMetrics = this.metrics.filter(m => m.name === name)
    if (relevantMetrics.length === 0) return 0
    
    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0)
    return total / relevantMetrics.length
  }

  getSlowestOperations(limit: number = 10) {
    return this.metrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Database query performance wrapper
export const withPerformanceTracking = <T extends any[], R>(
  operationName: string,
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    const timer = performanceMonitor.startTimer(`db_${operationName}`)
    
    try {
      const result = await fn(...args)
      timer?.end({ success: true })
      return result
    } catch (error) {
      timer?.end({ success: false, error: (error instanceof Error ? error.message : String(error)) })
      throw error
    }
  }
}

// API response time tracking
export const trackApiResponse = (request: Request, response: Response) => {
  const startTime = performance.now()
  
  // This would be called when the response is sent
  const endTime = performance.now()
  const duration = endTime - startTime
  
  performanceMonitor.recordMetric('api_response', duration, {
    method: request.method,
    url: request.url,
    status: response.status,
  })
}

// Page load performance tracking
export const trackPageLoad = (pageName: string) => {
  if (typeof window !== 'undefined') {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      performanceMonitor.recordMetric('page_load', navigation.loadEventEnd - navigation.loadEventStart, {
        page: pageName,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      })
    }
  }
}

// Memory usage tracking
export const trackMemoryUsage = () => {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    performanceMonitor.recordMetric('memory_usage', 0, {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    })
  }
} 