/**
 * @file api/auth/signout/route.ts
 * @description API route for signing out users
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-03: Protected Routes & Auth Middleware
 */

import { createServerSupabaseClient } from '../../../../lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[API Auth] Sign out error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SIGNOUT_ERROR',
            message: 'Failed to sign out user',
          },
        },
        { status: 400 }
      )
    }

    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('[API Auth] Unexpected sign out error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    )
  }
}
