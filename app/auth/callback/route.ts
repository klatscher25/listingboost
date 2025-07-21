/**
 * @file auth/callback/route.ts
 * @description OAuth callback handler for authentication
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-02: Login/Register Pages with Form Validation
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { config } from '../../../lib/config'
import { logApiError } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerClient(
      config.NEXT_PUBLIC_SUPABASE_URL,
      config.SUPABASE_ANON_KEY,
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
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        logApiError('[Auth Callback] Fehler beim Code-Session-Austausch', error)
        return NextResponse.redirect(
          `${origin}/auth/login?error=auth_callback_error`
        )
      }

      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      logApiError('[Auth Callback] Unerwarteter Fehler', error)
      return NextResponse.redirect(
        `${origin}/auth/login?error=unexpected_error`
      )
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=no_code_provided`)
}
