/**
 * @file app/dashboard/analyze/page.tsx
 * @description Listing Analysis Interface with German UI (FRONTEND-001-01)
 * @created 2025-07-21
 * @todo FRONTEND-001-01: Complete listing analysis interface
 */

import { requireAuth } from '@/lib/auth/server'
import { AnalyzeForm } from '@/components/analyze/AnalyzeForm'
import { MODERN_DESIGN } from '@/lib/design/modern-tokens'
import { ANALYZE_UI } from '@/lib/theme/analyze-constants'

export default async function AnalyzePage() {
  // Ensure user is authenticated
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/30">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Modern Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {ANALYZE_UI.page.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {ANALYZE_UI.page.subtitle}
          </p>
        </div>

        {/* Modern Analysis Form */}
        <div className="max-w-4xl mx-auto">
          <AnalyzeForm userId={user.id} />
        </div>

        {/* Modern Feature Overview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(ANALYZE_UI.features).map(([key, feature]) => (
            <div key={key} className={`
              text-center p-8 rounded-2xl backdrop-blur-md 
              bg-gradient-to-br from-white/25 to-white/10 
              border border-white/30 shadow-xl shadow-blue-500/10
              hover:from-white/35 hover:to-white/20 hover:shadow-blue-500/20
              transition-all duration-300 ease-out group
            `}>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}