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
 * Supabase client instance for client-side database operations.
 *
 * Configured with anonymous key for public operations with Row Level Security (RLS) enforcement.
 * Safe for use in client-side code (browser, React components) as it only has limited permissions.
 * Automatically handles session persistence and token refresh for authenticated users.
 *
 * @type {SupabaseClient<Database>} Typed Supabase client with full database schema
 * @configuration Uses anonymous key with RLS policies for data access control
 * @security Client-safe with automatic session management and token refresh
 * @usedBy Client-side components, authentication flows, user data operations
 * @relatedTo supabaseAdmin (server-side complement), authentication system
 * @example
 * ```typescript
 * import { supabase } from '@/lib/supabase'
 *
 * // Query user's listings (RLS enforced)
 * const { data, error } = await supabase
 *   .from('listings')
 *   .select('*')
 *   .eq('user_id', userId)
 * ```
 */
export const supabase = createClient<Database>(
  config.NEXT_PUBLIC_SUPABASE_URL || 'https://exarikehlmtczpaarfed.supabase.co',
  config.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YXJpa2VobG10Y3pwYWFyZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjI4MjAsImV4cCI6MjA2ODU5ODgyMH0.B9syY3MN1bQDM8EZD26pqEcF39xwVm8yPNCoMFrkzhY',
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
 * Supabase admin client instance for server-side database operations with elevated privileges.
 *
 * Configured with service role key that bypasses Row Level Security (RLS) policies.
 * Provides full administrative access to all database operations and should be used
 * exclusively in API routes, server components, and administrative functions.
 *
 * @type {SupabaseClient<Database>} Typed Supabase client with administrative privileges
 * @configuration Uses service role key with RLS bypass and no session persistence
 * @security SERVER-ONLY - Never expose in client-side code or browser environments
 * @usedBy Server-side API routes, administrative functions, database migrations
 * @relatedTo supabase (client-side complement), server-side operations
 * @complexity O(1) - Client initialization with constant-time configuration
 * @dependencies @supabase/supabase-js, config module, Database types
 * @warning CRITICAL SECURITY: Must never be used in client-side code
 * @example
 * ```typescript
 * import { supabaseAdmin } from '@/lib/supabase'
 *
 * // Admin operations (bypasses RLS)
 * const { data, error } = await supabaseAdmin
 *   .from('listings')
 *   .select('*') // Can access all records regardless of user
 * ```
 */
export const supabaseAdmin = createClient<Database>(
  config.NEXT_PUBLIC_SUPABASE_URL || 'https://exarikehlmtczpaarfed.supabase.co',
  config.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YXJpa2VobG10Y3pwYWFyZmVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAyMjgyMCwiZXhwIjoyMDY4NTk4ODIwfQ.Q8zXPPtpC0ZstcDQc57G6rWPP6PmwOQhOtSqYzT5DzQ',
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
 * Retrieves the current authenticated user from the Supabase session.
 *
 * Safely extracts user information from the current authentication session,
 * with comprehensive error handling and null safety. Returns null if no user
 * is authenticated or if any error occurs during retrieval.
 *
 * @async
 * @function getCurrentUser
 * @returns {Promise<User | null>} Promise resolving to authenticated User object or null
 * @complexity O(1) - Single async call to Supabase auth with constant-time operations
 * @dependencies supabase client, Supabase auth system
 * @usedBy Authentication checks, user data retrieval, session validation
 * @relatedTo isAuthenticated(), supabase client, authentication system
 * @throws {Error} Does not throw - handles all errors internally and returns null
 * @sideEffects Logs errors to console for debugging purposes
 * @example
 * ```typescript
 * import { getCurrentUser } from '@/lib/supabase'
 *
 * const user = await getCurrentUser()
 * if (user) {
 *   console.log(`User logged in: ${user.email}`)
 *   // User is authenticated, proceed with user-specific operations
 * } else {
 *   console.log('No user authenticated')
 *   // Redirect to login or handle unauthenticated state
 * }
 * ```
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
 * Checks if a user is currently authenticated in the Supabase session.
 *
 * Convenience function that wraps getCurrentUser() to provide a simple boolean
 * authentication check. Uses truthy evaluation of user object to determine
 * authentication status, making it safe for conditional logic and guards.
 *
 * @async
 * @function isAuthenticated
 * @returns {Promise<boolean>} Promise resolving to true if user is authenticated, false otherwise
 * @complexity O(1) - Delegates to getCurrentUser() with constant-time boolean conversion
 * @dependencies getCurrentUser(), supabase authentication system
 * @usedBy Route guards, conditional rendering, authorization checks
 * @relatedTo getCurrentUser(), authentication middleware, protected routes
 * @throws {Error} Does not throw - inherits error handling from getCurrentUser()
 * @sideEffects Inherits console logging from getCurrentUser() function
 * @example
 * ```typescript
 * import { isAuthenticated } from '@/lib/supabase'
 *
 * // Route guard example
 * if (!(await isAuthenticated())) {
 *   redirect('/login')
 *   return
 * }
 *
 * // Conditional rendering
 * const showProtectedContent = await isAuthenticated()
 * ```
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Centralized error handler for Supabase database operations with comprehensive logging.
 *
 * Provides consistent error handling across all database operations, with structured
 * logging for debugging and user-friendly error responses. Safely extracts error
 * details while preventing sensitive information exposure in production environments.
 *
 * @function handleSupabaseError
 * @param {any} error - The error object from Supabase operation (can be any type)
 * @param {string} [context='Database operation'] - Optional context description for debugging
 * @returns {Object} Standardized error response object with success: false
 * @returns {false} returns.success - Always false to indicate error state
 * @returns {Object} returns.error - Error details object
 * @returns {string} returns.error.code - Error code (from Supabase or 'UNKNOWN_ERROR')
 * @returns {string} returns.error.message - User-friendly error message
 * @returns {any} [returns.error.details] - Full error details (development only)
 * @complexity O(1) - Constant-time error processing and object creation
 * @dependencies process.env for environment detection, console.error for logging
 * @usedBy Database operations, API error handling, service layer functions
 * @relatedTo All database operations, API response standardization
 * @sideEffects Logs detailed error information to console for debugging
 * @security Prevents sensitive error details from being exposed in production
 * @example
 * ```typescript
 * import { handleSupabaseError } from '@/lib/supabase'
 *
 * try {
 *   const { data, error } = await supabase.from('listings').select('*')
 *   if (error) {
 *     return handleSupabaseError(error, 'Fetching listings')
 *   }
 *   return { success: true, data }
 * } catch (error) {
 *   return handleSupabaseError(error, 'Listings query failed')
 * }
 * ```
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
