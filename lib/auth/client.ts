/**
 * @file auth/client.ts
 * @description Client-side authentication utilities for ListingBoost Pro
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-01: Supabase Auth Setup & Configuration
 */

import { supabase } from '../supabase'
import type { User, AuthError } from '@supabase/supabase-js'

/**
 * Authentication result type
 */
export interface AuthResult {
  success: boolean
  user?: User | null
  error?: string
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  userData?: {
    firstName?: string
    lastName?: string
    company?: string
  }
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData?.firstName,
          last_name: userData?.lastName,
          company: userData?.company,
        },
      },
    })

    if (error) {
      console.error('[Auth] Sign up failed:', error)
      return {
        success: false,
        error: getAuthErrorMessage(error),
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error('[Auth] Unexpected sign up error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during sign up',
    }
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[Auth] Sign in failed:', error)
      return {
        success: false,
        error: getAuthErrorMessage(error),
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error('[Auth] Unexpected sign in error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during sign in',
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[Auth] Sign out failed:', error)
      return {
        success: false,
        error: getAuthErrorMessage(error),
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('[Auth] Unexpected sign out error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during sign out',
    }
  }
}

/**
 * Reset password with email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      console.error('[Auth] Password reset failed:', error)
      return {
        success: false,
        error: getAuthErrorMessage(error),
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('[Auth] Unexpected password reset error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during password reset',
    }
  }
}

/**
 * Update password (user must be authenticated)
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('[Auth] Password update failed:', error)
      return {
        success: false,
        error: getAuthErrorMessage(error),
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error('[Auth] Unexpected password update error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during password update',
    }
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('[Auth] Google sign in failed:', error)
      return {
        success: false,
        error: getAuthErrorMessage(error),
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('[Auth] Unexpected Google sign in error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during Google sign in',
    }
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('[Auth] Get session failed:', error)
      return null
    }

    return data.session
  } catch (error) {
    console.error('[Auth] Unexpected get session error:', error)
    return null
  }
}

/**
 * Get current user
 */
export async function getUser() {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error('[Auth] Get user failed:', error)
      return null
    }

    return data.user
  } catch (error) {
    console.error('[Auth] Unexpected get user error:', error)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: {
    full_name?: string | null
    avatar_url?: string | null
    timezone?: string
    language?: string
    marketing_emails_enabled?: boolean
    updated_at?: string
  }
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('[Auth] Profile update failed:', error)
      return {
        error: 'Profile update failed. Please try again.',
      }
    }

    return {}
  } catch (error) {
    console.error('[Auth] Unexpected profile update error:', error)
    return {
      error: 'An unexpected error occurred during profile update',
    }
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Convert Supabase auth errors to user-friendly messages
 */
function getAuthErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please try again.'
    case 'User already registered':
      return 'An account with this email already exists.'
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link.'
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long.'
    case 'Invalid email':
      return 'Please enter a valid email address.'
    case 'Signup is disabled':
      return 'Account registration is currently disabled.'
    case 'Email rate limit exceeded':
      return 'Too many email requests. Please wait before trying again.'
    default:
      return error.message || 'An authentication error occurred.'
  }
}
