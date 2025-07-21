/**
 * @file auth/context.tsx
 * @description Authentication context and provider for ListingBoost Pro
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-01: Supabase Auth Setup & Configuration
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('[Auth Context] Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('[Auth Context] Unexpected error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth Context] Auth state changed:', event)

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle specific auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('[Auth Context] User signed in:', session?.user?.email)
          break
        case 'SIGNED_OUT':
          console.log('[Auth Context] User signed out')
          break
        case 'TOKEN_REFRESHED':
          console.log('[Auth Context] Token refreshed')
          break
        case 'USER_UPDATED':
          console.log('[Auth Context] User updated')
          break
        case 'PASSWORD_RECOVERY':
          console.log('[Auth Context] Password recovery initiated')
          break
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('[Auth Context] Error signing out:', error)
        throw error
      }
    } catch (error) {
      console.error('[Auth Context] Unexpected error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * Hook to require authentication
 */
export function useRequireAuth() {
  const { user, loading } = useAuth()

  if (!loading && !user) {
    throw new Error('Authentication required')
  }

  return { user, loading }
}

/**
 * Component to protect routes that require authentication
 */
export function AuthGuard({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return fallback || <div>Please sign in to access this page.</div>
  }

  return <>{children}</>
}

/**
 * Component to protect routes that require no authentication
 */
export function GuestGuard({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (user) {
    return fallback || <div>You are already signed in.</div>
  }

  return <>{children}</>
}
