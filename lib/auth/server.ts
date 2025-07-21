/**
 * @file auth/server.ts
 * @description Server-side authentication utilities for ListingBoost Pro
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-01: Supabase Auth Setup & Configuration
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { config } from '../config'
import type { Database } from '../../types/database'

/**
 * Create a Supabase client for server-side rendering
 * This handles cookies and session management automatically
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Get the current user on the server side
 */
export async function getServerUser() {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('[Server Auth] Error getting user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('[Server Auth] Unexpected error getting user:', error)
    return null
  }
}

/**
 * Get the current session on the server side
 */
export async function getServerSession() {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('[Server Auth] Error getting session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('[Server Auth] Unexpected error getting session:', error)
    return null
  }
}

/**
 * Check if user is authenticated on server side
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const user = await getServerUser()
  return !!user
}

/**
 * Require authentication - redirect to login if not authenticated
 * Returns user only (for backward compatibility)
 */
export async function requireAuth(redirectTo: string = '/auth/login') {
  const user = await getServerUser()

  if (!user) {
    redirect(redirectTo)
  }

  return user
}

/**
 * Require authentication with profile - redirect to login if not authenticated
 * Returns both user and profile data
 */
export async function requireAuthWithProfile(
  redirectTo: string = '/auth/login'
) {
  const user = await getServerUser()

  if (!user) {
    redirect(redirectTo)
  }

  const supabase = await createServerSupabaseClient()

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      // If profile doesn't exist, create a default one
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          timezone: 'Europe/Berlin',
          language: 'de',
          onboarding_completed: false,
          marketing_emails_enabled: false,
        })
        .select()
        .single()

      if (insertError) {
        console.error('[Server Auth] Error creating profile:', insertError)
        redirect(redirectTo)
      }

      return { user, profile: newProfile }
    }

    return { user, profile }
  } catch (error) {
    console.error('[Server Auth] Unexpected error getting profile:', error)
    redirect(redirectTo)
  }
}

/**
 * Require no authentication - redirect if authenticated
 */
export async function requireNoAuth(redirectTo: string = '/dashboard') {
  const isAuth = await isServerAuthenticated()

  if (isAuth) {
    redirect(redirectTo)
  }
}

/**
 * Get user with profile data from database
 */
export async function getServerUserProfile() {
  const supabase = await createServerSupabaseClient()
  const user = await getServerUser()

  if (!user) {
    return null
  }

  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(
        `
        *,
        organization:organizations(*)
      `
      )
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('[Server Auth] Error getting user profile:', error)
      return null
    }

    return {
      user,
      profile,
    }
  } catch (error) {
    console.error('[Server Auth] Unexpected error getting user profile:', error)
    return null
  }
}

/**
 * Check if user has specific role in organization
 */
export async function hasRole(
  organizationId: string,
  requiredRole: 'owner' | 'admin' | 'member'
): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const user = await getServerUser()

  if (!user) {
    return false
  }

  try {
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (error || !membership) {
      return false
    }

    const roleHierarchy = {
      owner: 3,
      admin: 2,
      member: 1,
    }

    return (
      roleHierarchy[membership.role as keyof typeof roleHierarchy] >=
      roleHierarchy[requiredRole]
    )
  } catch (error) {
    console.error('[Server Auth] Error checking role:', error)
    return false
  }
}

/**
 * Require specific role in organization
 */
export async function requireRole(
  organizationId: string,
  requiredRole: 'owner' | 'admin' | 'member',
  redirectTo: string = '/dashboard'
) {
  const hasRequiredRole = await hasRole(organizationId, requiredRole)

  if (!hasRequiredRole) {
    redirect(redirectTo)
  }

  return await getServerUserProfile()
}
