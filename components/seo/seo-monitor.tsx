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
  const pathname = usePathname()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

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
          message: 'Page is indexable (no robots meta)',
          critical: true
        })
      }

      setChecks(newChecks)
    }

    // Run checks after DOM is loaded
    const timer = setTimeout(runSEOChecks, 1000)
    return () => clearTimeout(timer)
  }, [pathname])

  if (process.env.NODE_ENV !== 'development') return null

  const criticalIssues = checks.filter(check => check.critical && check.status === 'fail').length
  const warnings = checks.filter(check => check.status === 'warning').length
  const passed = checks.filter(check => check.status === 'pass').length

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`px-4 py-2 rounded-lg text-white font-medium shadow-lg transition-colors ${
          criticalIssues > 0 
            ? 'bg-red-500 hover:bg-red-600' 
            : warnings > 0 
            ? 'bg-yellow-500 hover:bg-yellow-600'
            : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        SEO {criticalIssues > 0 ? `(${criticalIssues} issues)` : `(${passed}/${checks.length})`}
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">SEO Health Check</h3>
            <p className="text-sm text-gray-600">
              {passed} passed • {warnings} warnings • {criticalIssues} critical issues
            </p>
          </div>
          
          <div className="p-4 space-y-3">
            {checks.map((check, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                  check.status === 'pass' ? 'bg-green-500' :
                  check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{check.name}</p>
                  <p className="text-xs text-gray-600">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 