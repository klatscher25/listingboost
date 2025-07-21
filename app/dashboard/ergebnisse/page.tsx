/**
 * @file app/dashboard/ergebnisse/page.tsx
 * @description Results Dashboard with comprehensive German localization (FRONTEND-001-02)
 * @created 2025-07-21
 * @todo FRONTEND-001-02: Results visualization and German UI
 */

import { requireAuth } from '@/lib/auth/server'
import { ResultsDashboard } from '@/components/analyze/ResultsDashboard'
import { MODERN_DESIGN } from '@/lib/design/modern-tokens'
import { ANALYZE_UI } from '@/lib/theme/analyze-constants'

export default async function ErgebnissePage() {
  // Ensure user is authenticated
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Modern Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {ANALYZE_UI.results.header.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {ANALYZE_UI.results.header.subtitle}
          </p>
        </div>

        {/* Results Dashboard Component */}
        <div className="max-w-7xl mx-auto">
          <ResultsDashboard userId={user.id} />
        </div>
      </div>
    </div>
  )
}
