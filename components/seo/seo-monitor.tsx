"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface SEOCheck {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  critical: boolean
}

export default function SEOMonitor() {
  const [checks, setChecks] = useState<SEOCheck[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only call usePathname after ensuring we're on the client
  const pathname = isClient ? usePathname() : ''

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || !isClient) return

    const runSEOChecks = () => {
      const newChecks: SEOCheck[] = []

      // Check title tag
      const title = document.querySelector('title')?.textContent
      if (!title) {
        newChecks.push({
          name: 'Title Tag',
          status: 'fail',
          message: 'Missing title tag',
          critical: true
        })
      } else if (title.length < 30) {
        newChecks.push({
          name: 'Title Tag',
          status: 'warning',
          message: `Title too short (${title.length} chars). Recommended: 30-60 chars`,
          critical: false
        })
      } else if (title.length > 60) {
        newChecks.push({
          name: 'Title Tag',
          status: 'warning',
          message: `Title too long (${title.length} chars). Recommended: 30-60 chars`,
          critical: false
        })
      } else {
        newChecks.push({
          name: 'Title Tag',
          status: 'pass',
          message: `Good title length (${title.length} chars)`,
          critical: true
        })
      }

      // Check meta description
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content')
      if (!description) {
        newChecks.push({
          name: 'Meta Description',
          status: 'fail',
          message: 'Missing meta description',
          critical: true
        })
      } else if (description.length < 120) {
        newChecks.push({
          name: 'Meta Description',
          status: 'warning',
          message: `Description too short (${description.length} chars). Recommended: 120-160 chars`,
          critical: false
        })
      } else if (description.length > 160) {
        newChecks.push({
          name: 'Meta Description',
          status: 'warning',
          message: `Description too long (${description.length} chars). Recommended: 120-160 chars`,
          critical: false
        })
      } else {
        newChecks.push({
          name: 'Meta Description',
          status: 'pass',
          message: `Good description length (${description.length} chars)`,
          critical: true
        })
      }

      // Check canonical URL
      const canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        newChecks.push({
          name: 'Canonical URL',
          status: 'warning',
          message: 'Missing canonical URL',
          critical: false
        })
      } else {
        newChecks.push({
          name: 'Canonical URL',
          status: 'pass',
          message: 'Canonical URL present',
          critical: false
        })
      }

      // Check Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]')
      const ogDescription = document.querySelector('meta[property="og:description"]')
      const ogImage = document.querySelector('meta[property="og:image"]')
      
      if (!ogTitle || !ogDescription || !ogImage) {
        newChecks.push({
          name: 'Open Graph',
          status: 'warning',
          message: 'Missing some Open Graph tags',
          critical: false
        })
      } else {
        newChecks.push({
          name: 'Open Graph',
          status: 'pass',
          message: 'All essential Open Graph tags present',
          critical: false
        })
      }

      // Check structured data
      const structuredData = document.querySelectorAll('script[type="application/ld+json"]')
      if (structuredData.length === 0) {
        newChecks.push({
          name: 'Structured Data',
          status: 'warning',
          message: 'No structured data found',
          critical: false
        })
      } else {
        newChecks.push({
          name: 'Structured Data',
          status: 'pass',
          message: `${structuredData.length} structured data schema(s) found`,
          critical: false
        })
      }

      // Check heading structure
      const h1s = document.querySelectorAll('h1')
      if (h1s.length === 0) {
        newChecks.push({
          name: 'H1 Tag',
          status: 'fail',
          message: 'Missing H1 tag',
          critical: true
        })
      } else if (h1s.length > 1) {
        newChecks.push({
          name: 'H1 Tag',
          status: 'warning',
          message: `Multiple H1 tags found (${h1s.length}). Should have only one`,
          critical: false
        })
      } else {
        newChecks.push({
          name: 'H1 Tag',
          status: 'pass',
          message: 'Single H1 tag found',
          critical: true
        })
      }

      // Check images without alt text
      const images = document.querySelectorAll('img:not([alt])')
      if (images.length > 0) {
        newChecks.push({
          name: 'Image Alt Text',
          status: 'warning',
          message: `${images.length} image(s) missing alt text`,
          critical: false
        })
      } else {
        newChecks.push({
          name: 'Image Alt Text',
          status: 'pass',
          message: 'All images have alt text',
          critical: false
        })
      }

      // Check for robots meta tag
      const robots = document.querySelector('meta[name="robots"]')
      if (robots) {
        const content = robots.getAttribute('content')
        if (content?.includes('noindex')) {
          newChecks.push({
            name: 'Indexability',
            status: 'warning',
            message: 'Page set to noindex',
            critical: true
          })
        } else {
          newChecks.push({
            name: 'Indexability',
            status: 'pass',
            message: 'Page is indexable',
            critical: true
          })
        }
      } else {
        newChecks.push({
          name: 'Indexability',
          status: 'pass',
          message: 'No robots restriction found',
          critical: true
        })
      }

      // Check viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]')
      if (!viewport) {
        newChecks.push({
          name: 'Viewport Meta',
          status: 'fail',
          message: 'Missing viewport meta tag',
          critical: true
        })
      } else {
        newChecks.push({
          name: 'Viewport Meta',
          status: 'pass',
          message: 'Viewport meta tag present',
          critical: true
        })
      }

      // Check for external links without rel attributes
      const externalLinks = Array.from(document.querySelectorAll('a[href^="http"]')).filter(link => {
        const href = link.getAttribute('href')
        return href && !href.includes(window.location.hostname)
      })
      
      const unsafeExternalLinks = externalLinks.filter(link => {
        const rel = link.getAttribute('rel')
        return !rel || (!rel.includes('noopener') && !rel.includes('noreferrer'))
      })

      if (unsafeExternalLinks.length > 0) {
        newChecks.push({
          name: 'External Links',
          status: 'warning',
          message: `${unsafeExternalLinks.length} external link(s) without security attributes`,
          critical: false
        })
      } else if (externalLinks.length > 0) {
        newChecks.push({
          name: 'External Links',
          status: 'pass',
          message: 'All external links have security attributes',
          critical: false
        })
      }

      // Check page load speed (basic check)
      if (typeof window !== 'undefined' && 'performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
        if (loadTime > 3000) {
          newChecks.push({
            name: 'Page Load Speed',
            status: 'warning',
            message: `Page load time: ${Math.round(loadTime)}ms (>3s)`,
            critical: false
          })
        } else {
          newChecks.push({
            name: 'Page Load Speed',
            status: 'pass',
            message: `Page load time: ${Math.round(loadTime)}ms`,
            critical: false
          })
        }
      }

      setChecks(newChecks)
    }

    // Run checks after a short delay to ensure DOM is fully loaded
    const timer = setTimeout(runSEOChecks, 1000)
    return () => clearTimeout(timer)
  }, [pathname, isClient])

  // Don't render anything if not in development or not on client
  if (process.env.NODE_ENV !== 'development' || !isClient) {
    return null
  }

  const criticalIssues = checks.filter(check => check.critical && check.status === 'fail').length
  const warnings = checks.filter(check => check.status === 'warning').length
  const passed = checks.filter(check => check.status === 'pass').length

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all
          ${criticalIssues > 0 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : warnings > 0 
            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
            : 'bg-green-500 text-white hover:bg-green-600'
          }
        `}
      >
        SEO: {criticalIssues}❌ {warnings}⚠️ {passed}✅
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">SEO Monitor</h3>
            <p className="text-sm text-gray-600">
              {checks.length} checks • Page: {pathname}
            </p>
          </div>
          
          <div className="p-4 space-y-3">
            {checks.map((check, index) => (
              <div
                key={index}
                className={`
                  p-3 rounded-md border-l-4
                  ${check.status === 'pass' 
                    ? 'bg-green-50 border-green-400' 
                    : check.status === 'warning'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-red-50 border-red-400'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {check.name}
                  </span>
                  <span className="text-lg">
                    {check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'}
                  </span>
                </div>
                <p className="text-xs mt-1 text-gray-600">
                  {check.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 