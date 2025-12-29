import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ['/login', '/register', '/', '/payment']
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // API routes - check auth header
  if (pathname.startsWith('/api')) {
    // Auth routes are public
    if (pathname.startsWith('/api/auth/register') || pathname.startsWith('/api/auth/login')) {
      return NextResponse.next()
    }

    // Other API routes need auth
    const authHeader = request.headers.get('authorization')
    const apiToken = authHeader?.replace('Bearer ', '') || token

    if (!apiToken || !verifyToken(apiToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Protected pages
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/courses') || pathname.startsWith('/admin')) {
    if (!token || !verifyToken(token)) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin routes
    if (pathname.startsWith('/admin')) {
      const payload = verifyToken(token)
      if (payload?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

