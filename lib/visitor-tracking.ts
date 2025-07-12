// Visitor tracking utility for gallery likes and views

const VISITOR_ID_KEY = 'visitor_id'
const VISITOR_ID_EXPIRY_DAYS = 365 // 1 year

export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Try to get from localStorage first
  let visitorId = localStorage.getItem(VISITOR_ID_KEY)
  
  if (!visitorId) {
    // Try to get from cookies
    visitorId = getCookie(VISITOR_ID_KEY)
  }
  
  if (!visitorId) {
    // Generate new visitor ID
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Store in localStorage and cookies
    localStorage.setItem(VISITOR_ID_KEY, visitorId)
    setCookie(VISITOR_ID_KEY, visitorId, VISITOR_ID_EXPIRY_DAYS)
  }
  
  return visitorId
}

export function setVisitorId(visitorId: string): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(VISITOR_ID_KEY, visitorId)
  setCookie(VISITOR_ID_KEY, visitorId, VISITOR_ID_EXPIRY_DAYS)
}

export function clearVisitorId(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(VISITOR_ID_KEY)
  deleteCookie(VISITOR_ID_KEY)
}

// Cookie utilities
function setCookie(name: string, value: string, days: number): void {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

// Track page views
export function trackPageView(page: string): void {
  if (typeof window === 'undefined') return
  
  const visitorId = getVisitorId()
  const pageViewData = {
    visitorId,
    page,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    referrer: document.referrer
  }
  
  // Store in localStorage for analytics
  const pageViews = JSON.parse(localStorage.getItem('page_views') || '[]')
  pageViews.push(pageViewData)
  
  // Keep only last 100 page views
  if (pageViews.length > 100) {
    pageViews.splice(0, pageViews.length - 100)
  }
  
  localStorage.setItem('page_views', JSON.stringify(pageViews))
}

// Get visitor analytics
export function getVisitorAnalytics() {
  if (typeof window === 'undefined') return null
  
  const visitorId = getVisitorId()
  const pageViews = JSON.parse(localStorage.getItem('page_views') || '[]')
  
  return {
    visitorId,
    totalPageViews: pageViews.length,
    pageViews: pageViews.filter((view: any) => view.visitorId === visitorId),
    firstVisit: pageViews[0]?.timestamp,
    lastVisit: pageViews[pageViews.length - 1]?.timestamp
  }
} 