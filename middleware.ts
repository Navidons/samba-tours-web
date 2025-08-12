import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const host = request.headers.get('host') || ''

  // Only normalize host in production and only for our domain
  const isProd = process.env.NODE_ENV === 'production'
  const isOurDomain = host.endsWith('sambatours.co')
  if (isProd && isOurDomain && host.startsWith('www.')) {
    const apex = host.replace(/^www\./, '')
    url.host = apex
    return NextResponse.redirect(url, 308)
  }

  const { pathname } = request.nextUrl

  // Protect /admin routes; allow public /signin
  if (pathname.startsWith('/admin')) {
    const cookie = request.cookies.get('admin_session')
    const hasSession = Boolean(cookie?.value && cookie.value.trim() !== '')

    if (!hasSession) {
      const signinUrl = request.nextUrl.clone()
      signinUrl.pathname = '/signin'
      if (pathname !== '/admin') {
        signinUrl.searchParams.set('from', pathname)
      }
      return NextResponse.redirect(signinUrl)
    }
  }

  // Skip tracking for admin routes, API routes, and static files
  if (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Create response
  const response = NextResponse.next()

  // Add tracking header to trigger client-side tracking
  response.headers.set('x-track-visit', 'true')
  response.headers.set('x-page-path', pathname)

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
