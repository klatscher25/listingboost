/**
 * @file supabase.ts
 * @description Supabase client configuration for ListingBoost Pro
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F002-01: Supabase Project Setup + Configuration
 */

import { createClient } from '@supabase/supabase-js'
import { config } from './config'
import type { Database } from '../types/database'

/**
 * Supabase client for client-side operations
 * Uses anon key for public operations and RLS
 */
export const supabase = createClient<Database>(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
  }
)

/**
 * Supabase admin client for server-side operations
 * Uses service role key - NEVER expose in client code
 * Only use in API routes and server components
 */
export const supabaseAdmin = createClient<Database>(
  config.NEXT_PUBLIC_SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  }
)

/**
 * Helper function to get the current user from session
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('[Supabase] Error getting user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('[Supabase] Unexpected error getting user:', error)
    return null
  }
}

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Type-safe database error handler
 */
export function handleSupabaseError(
  error: any,
  context: string = 'Database operation'
) {
  console.error(`[Supabase] ${context} failed:`, {
    error,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    message: error?.message,
  })

  // Return user-friendly error message
  return {
    success: false,
    error: {
      code: error?.code || 'UNKNOWN_ERROR',
      message: error?.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    },
  }
}
