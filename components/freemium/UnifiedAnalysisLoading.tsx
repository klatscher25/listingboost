/**
 * @file components/freemium/UnifiedAnalysisLoading.tsx
 * @description Loading state component for unified AI analysis
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-08: Extracted from UnifiedAIAnalysisPanel.tsx for CLAUDE.md compliance
 */

'use client'

import React from 'react'

export function UnifiedAnalysisLoading() {
  return (
    <div className="text-center py-12">
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <div
          className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
          style={{ animationDelay: '0.3s' }}
        ></div>
        <div
          className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"
          style={{ animationDelay: '0.6s' }}
        ></div>
      </div>
      <p className="text-slate-600 text-lg font-medium">
        KI analysiert umfassend Ihre Listing-Daten...
      </p>
      <p className="text-slate-500 text-sm mt-2">
        Personalisierte DACH-Empfehlungen und detaillierte
        Optimierungsstrategien werden erstellt
      </p>
    </div>
  )
}
