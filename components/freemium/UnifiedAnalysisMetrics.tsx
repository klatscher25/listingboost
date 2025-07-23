/**
 * @file components/freemium/UnifiedAnalysisMetrics.tsx
 * @description Metrics overview for unified AI analysis results
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-08: Extracted from UnifiedAIAnalysisPanel.tsx for CLAUDE.md compliance
 */

'use client'

import React from 'react'
import type { FreemiumAIInsights } from '@/lib/types/freemium-types'

interface PersonalizedInsight {
  id: string
  category: 'location' | 'cultural' | 'competitive' | 'pricing' | 'content'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  germanSpecific: boolean
  actionItems: string[]
  culturalReason: string
  confidence: number
}

interface UnifiedAnalysisMetricsProps {
  personalizedInsights: PersonalizedInsight[]
  aiInsights: FreemiumAIInsights | null
  onUpgradeClick: () => void
}

export function UnifiedAnalysisMetrics({
  personalizedInsights,
  aiInsights,
  onUpgradeClick,
}: UnifiedAnalysisMetricsProps) {
  return (
    <div className="space-y-8">
      {/* Analysis Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center border border-blue-200/50">
          <div className="text-2xl font-bold text-blue-600">
            {personalizedInsights.length}
          </div>
          <div className="text-xs text-slate-600">DACH-Empfehlungen</div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 text-center border border-emerald-200/50">
          <div className="text-2xl font-bold text-emerald-600">
            {personalizedInsights.filter((i) => i.impact === 'high').length}
          </div>
          <div className="text-xs text-slate-600">Hohe Priorität</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-200/50">
          <div className="text-2xl font-bold text-orange-600">
            {personalizedInsights.filter((i) => i.germanSpecific).length}
          </div>
          <div className="text-xs text-slate-600">DACH-spezifisch</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center border border-purple-200/50">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(
              personalizedInsights.reduce((acc, i) => acc + i.confidence, 0) /
                personalizedInsights.length
            )}
            %
          </div>
          <div className="text-xs text-slate-600">Vertrauen</div>
        </div>
      </div>

      {/* AI Insights Summary */}
      {aiInsights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🏠</span>
              <span className="text-lg font-bold text-blue-600">
                {aiInsights.hostCredibility.currentScore}/100
              </span>
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">
              Host-Glaubwürdigkeit
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Vertrauen & Professionalität
            </p>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">📝</span>
              <span className="text-lg font-bold text-emerald-600">
                {Math.round(
                  (aiInsights.listingOptimization.titleScore +
                    aiInsights.listingOptimization.descriptionScore +
                    aiInsights.listingOptimization.photoScore +
                    aiInsights.listingOptimization.amenityScore) /
                    4
                )}
                /100
              </span>
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">
              Listing-Optimierung
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Titel, Beschreibung & Ausstattung
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">💰</span>
              <span className="text-lg font-bold text-orange-600">75€</span>
            </div>
            <h4 className="font-semibold text-slate-800 text-sm">
              Preis-Optimierung
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Wettbewerbsanalyse & Revenue
            </p>
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
        </div>
      )}

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
