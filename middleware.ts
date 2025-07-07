import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const cookie = request.cookies.get('admin_session')
    
    // Check if cookie exists and has a valid format
    if (!cookie || !cookie.value || cookie.value.trim() === '') {
      const signinUrl = request.nextUrl.clone()
      signinUrl.pathname = '/signin'
      signinUrl.searchParams.set('redirect', pathname)
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
      const signinUrl = request.nextUrl.clone()
      signinUrl.pathname = '/signin'
      signinUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(signinUrl)
    }
  }

  // Skip tracking for admin routes, API routes, and static files
  if (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 