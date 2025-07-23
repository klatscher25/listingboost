/**
 * @file components/freemium/ui/AIInsightsGrid.tsx
 * @description AI Insights Grid component for UnifiedAIAnalysisPanel
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-01: Extracted from UnifiedAIAnalysisPanel for CLAUDE.md compliance
 */

'use client'

import React from 'react'
import type { FreemiumAIInsights } from '@/lib/types/freemium-types'

interface AIInsightsGridProps {
  aiInsights: FreemiumAIInsights
  onUpgradeClick: () => void
}

export function AIInsightsGrid({
  aiInsights,
  onUpgradeClick,
}: AIInsightsGridProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
          <span>🤖</span>
          <span>KI-Powered Optimierung</span>
        </h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
          AI PREVIEW
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">📝</span>
            <span className="text-lg font-bold text-blue-600">
              {aiInsights.listingOptimization.titleScore}/100
            </span>
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">
            Titel-Optimierung
          </h4>
          <p className="text-xs text-slate-600 mt-1">Content & SEO</p>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">📸</span>
            <span className="text-lg font-bold text-emerald-600">
              {aiInsights.listingOptimization.photoScore}/100
            </span>
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">
            Foto-Optimierung
          </h4>
          <p className="text-xs text-slate-600 mt-1">Visual Appeal</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">🏆</span>
            <span className="text-lg font-bold text-yellow-600">
              {aiInsights.hostCredibility.currentScore}/100
            </span>
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">
            Host-Glaubwürdigkeit
          </h4>
          <p className="text-xs text-slate-600 mt-1">Trust & Authority</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">⭐</span>
            <span className="text-lg font-bold text-purple-600">
              {aiInsights.ratingImprovement.currentStrengths.length * 5}/50
            </span>
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">
            Bewertungs-Optimierung
          </h4>
          <p className="text-xs text-slate-600 mt-1">Rating & Reviews</p>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg">🏠</span>
            <span className="text-lg font-bold text-indigo-600">
              {aiInsights.amenityGapAnalysis.criticalGaps.length}/10
            </span>
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">
            Ausstattungs-Gaps
          </h4>
          <p className="text-xs text-slate-600 mt-1">Amenity Analysis</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200/50 text-center">
        <p className="text-sm text-slate-600 mb-3">
          <span className="font-semibold">
            Vollständige Analysen verfügbar:
          </span>{' '}
          Schritt-für-Schritt Anleitungen, Erfolgsmetriken und kontinuierliche
          Optimierung
        </p>
        <button
          onClick={onUpgradeClick}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 text-sm"
        >
          Vollständige Analysen freischalten
        </button>
      </div>
    </div>
  )
}
