/**
 * @file auth/layout.tsx
 * @description Layout for authentication pages
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-02: Login/Register Pages with Form Validation
 */

'use client'

import { GuestGuard } from '../../lib/auth/context'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GuestGuard fallback={<div>Redirecting to dashboard...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        
        <div className="relative z-10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">LB</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                ListingBoost Pro
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Maximiere deine Airbnb-Einnahmen mit KI
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-xl border border-white/20 rounded-2xl sm:px-10">
              {children}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              © 2025 ListingBoost Pro. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
        
        <style jsx global>{`
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    </GuestGuard>
  )
}
