/**
 * @file dashboard/client-example/page.tsx
 * @description Client-side protected route example with useAuth
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-03: Protected Routes & Auth Middleware
 */

'use client'

import { useAuth, AuthGuard } from '../../../lib/auth/context'
import { signOut } from '../../../lib/auth/client'
import { useState } from 'react'

function DashboardContent() {
  const { user, loading } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      const result = await signOut()

      if (!result.success) {
        console.error('Sign out failed:', result.error)
        alert('Failed to sign out. Please try again.')
      }
      // On success, the AuthProvider will handle the state update
    } catch (error) {
      console.error('Sign out error:', error)
      alert('Failed to sign out. Please try again.')
    } finally {
      setSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Client Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.user_metadata?.first_name || user?.email}!
              </span>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {signingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Auth Info */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Client-Side Protected Route
                </h2>
                <p className="text-gray-600 mb-4">
                  This page uses the client-side `useAuth` hook and `AuthGuard`
                  component to protect the route and manage authentication
                  state.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        ✓ Authentication working correctly with client-side
                        hooks
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Auth State */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Real-time Auth State
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Authentication Status:
                    </span>
                    <span className="text-sm text-green-600">
                      ✓ Authenticated
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Loading State:
                    </span>
                    <span className="text-sm text-gray-900">
                      {loading ? 'Loading...' : 'Ready'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      User Email:
                    </span>
                    <span className="text-sm text-gray-900">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ClientDashboardPage() {
  return (
    <AuthGuard
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please sign in to access this page.
            </p>
            <a
              href="/auth/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign In
            </a>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </AuthGuard>
  )
}
