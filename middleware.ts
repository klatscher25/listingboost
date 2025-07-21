/**
 * @file middleware.ts
 * @description Next.js middleware for authentication and route protection
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-03: Protected Routes & Auth Middleware
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { config as appConfig } from './lib/config'
import { logApiError } from './lib/utils/logger'

/**
 * Routes that require authentication
 */
const protectedRoutes = [
  '/dashboard',
  '/listings',
  '/analytics',
  '/settings',
  '/billing',
  '/organization',
]

/**
 * Routes that require no authentication (redirect if authenticated)
 */
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

/**
 * Public routes that don't require authentication
 */
const publicRoutes = ['/', '/pricing', '/features', '/about', '/contact']

/**
 * API routes that require authentication
 */
const protectedApiRoutes = [
  '/api/listings',
  '/api/analytics',
  '/api/user',
  '/api/organization',
  '/api/billing',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    appConfig.NEXT_PUBLIC_SUPABASE_URL,
    appConfig.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Refresh session if expired
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      logApiError('[Middleware] Fehler beim Abrufen der Session', error)
    }

    const { pathname } = request.nextUrl
    const isAuthenticated = !!session?.user

    // Handle protected routes
    if (isProtectedRoute(pathname)) {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }

    // Handle auth routes (redirect if already authenticated)
    if (isAuthRoute(pathname)) {
      if (isAuthenticated) {
        const redirectTo = request.nextUrl.searchParams.get('redirectTo')
        const dashboardUrl = new URL(
          redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard',
          request.url
        )
        return NextResponse.redirect(dashboardUrl)
      }
    }

    // Handle protected API routes
    if (isProtectedApiRoute(pathname)) {
      if (!isAuthenticated) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
            },
          },
          { status: 401 }
        )
      }
    }

    return response
  } catch (error) {
    logApiError('[Middleware] Unerwarteter Fehler', error)

    // On error, allow the request to continue but log it
    return response
  }
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Check if route is an auth route
 */
function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Check if API route requires authentication
 */
function isProtectedApiRoute(pathname: string): boolean {
  return protectedApiRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
