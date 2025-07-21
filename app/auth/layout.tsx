/**
 * @file auth/layout.tsx
 * @description Layout for authentication pages
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-02: Login/Register Pages with Form Validation
 */

import { GuestGuard } from '../../lib/auth/context'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GuestGuard fallback={<div>Redirecting to dashboard...</div>}>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              ListingBoost Pro
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Optimize your Airbnb listings with AI
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {children}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 ListingBoost Pro. All rights reserved.
          </p>
        </div>
      </div>
    </GuestGuard>
  )
}
