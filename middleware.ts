import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const host = request.headers.get('host') || ''
  const proto = request.headers.get('x-forwarded-proto') || 'https'

  // Canonicalize host and protocol to reduce duplicate/redirect issues
  if (host.startsWith('www.')) {
    const apex = host.replace(/^www\./, '')
    url.host = apex
    url.protocol = 'https'
    return NextResponse.redirect(url, 308)
  }
  if (proto !== 'https') {
    url.protocol = 'https'
    return NextResponse.redirect(url, 308)
  }

  const { pathname } = request.nextUrl

  // Protect /admin routes and hide public signin
  if (pathname.startsWith('/admin') || pathname === '/signin') {
    const cookie = request.cookies.get('admin_session')
    
    // Check if cookie exists and has a valid format
    if (!cookie || !cookie.value || cookie.value.trim() === '') {
      // Forbid access to public signin: send 404 for /signin
      if (pathname === '/signin') {
        return new NextResponse('Not Found', { status: 404 })
      }
      const signinUrl = request.nextUrl.clone()
      signinUrl.pathname = '/'
      return NextResponse.redirect(signinUrl)
    }
    
    // Basic validation that the session has the expected format (userId:timestamp)
    try {
      const decoded = Buffer.from(cookie.value, 'base64').toString()
      if (!decoded.includes(':')) {
        throw new Error('Invalid session format')
      }
    } catch (error) {
      // Invalid session, redirect to login
      if (pathname === '/signin') {
        return new NextResponse('Not Found', { status: 404 })
      }
      const home = request.nextUrl.clone()
      home.pathname = '/'
      return NextResponse.redirect(home)
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
