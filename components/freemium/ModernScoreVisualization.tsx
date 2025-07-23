/**
 * @file components/freemium/ModernScoreVisualization.tsx
 * @description Modern, conversion-optimized score visualization for freemium dashboard - refactored for CLAUDE.md compliance
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-05: Refactored using modular architecture
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { FreemiumData } from '@/lib/types/freemium-types'
import { ScoreAnalysisDetails } from './ScoreAnalysisDetails'
import {
  getScorePosition,
  getDisplayScore,
  generateFreemiumMetrics,
  validateAndNormalizeScore,
} from '@/lib/utils/scoring-utils'

interface ModernScoreVisualizationProps {
  data: FreemiumData
  onUpgradeClick: () => void
}

export function ModernScoreVisualization({
  data,
  onUpgradeClick,
}: ModernScoreVisualizationProps) {
  const { analysis } = data
  const normalizedScore = validateAndNormalizeScore(analysis.overallScore)
  const displayScore = getDisplayScore(normalizedScore)
  const position = getScorePosition(normalizedScore)
  const freemiumMetrics = generateFreemiumMetrics(normalizedScore)

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl border border-gray-200/30">
      {/* Header - Conversion optimized without revealing score */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Ihr Listing-Potenzial
          </h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-lg text-orange-600">
              Deutliches Verbesserungspotenzial erkannt
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Ihr Profi-Score
          </div>
          <div className="relative bg-gradient-to-r from-purple-100/90 to-pink-100/90 backdrop-blur-sm rounded-lg p-6 border-2 border-purple-200">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-lg font-bold text-purple-700 mb-1">
                Analyse bereit!
              </div>
              <div className="text-sm text-purple-600 mb-3">
                Ihr vollständiger
                <br />
                Performance-Report
              </div>
              <button
                onClick={onUpgradeClick}
                className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all font-bold"
              >
                🔓 Jetzt freischalten
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Wissenschaftliches 1000-Punkte-System
          </div>
        </div>
      </div>

      {/* Main Visual - Teaser without revealing score */}
      <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
        {/* Mysterious Performance Circle */}
        <div className="relative">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-slate-200"
            />
            {/* Animated teaser circle (always shows potential, not actual score) */}
            <motion.circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              className="text-gradient-to-r from-purple-500 to-pink-500"
              strokeDasharray="534"
              initial={{ strokeDashoffset: 534 }}
              animate={{ strokeDashoffset: 534 - 0.85 * 534 }} // Always shows 85% potential
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </svg>

          {/* Center content - full conversion focus */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/98 to-pink-100/98 backdrop-blur-lg rounded-full flex items-center justify-center z-10 border-4 border-purple-200">
              <div className="text-center">
                <div className="text-5xl mb-4">📊</div>
                <div className="text-xl font-bold text-purple-700 mb-2">
                  Ihr Report
                </div>
                <div className="text-sm text-purple-600 mb-4 max-w-20">
                  Vollständige
                  <br />
                  Analyse verfügbar
                </div>
                <button
                  onClick={onUpgradeClick}
                  className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full hover:shadow-xl transition-all font-bold"
                >
                  🚀 Kaufen €49
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition Insights */}
        <div className="flex-1 space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">🎯 Ihre Situation</h3>
              <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                ANALYSE
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {freemiumMetrics.criticalProblems}
                </div>
                <div className="text-sm text-slate-600">Kritische Probleme</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {freemiumMetrics.lostBookings}%
                </div>
                <div className="text-sm text-slate-600">
                  Verlorene Buchungen
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200/50">
            <h3 className="font-bold text-slate-800 mb-3">💰 Ihr Potenzial</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Nach Optimierung:</span>
                <span className="font-bold text-emerald-600">
                  +{freemiumMetrics.potentialBookingIncrease}% mehr Buchungen
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Zusätzlicher Umsatz:</span>
                <span className="font-bold text-emerald-600">
                  +€{freemiumMetrics.additionalRevenue.toLocaleString('de-DE')}
                  /Jahr
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed analysis sections */}
      <ScoreAnalysisDetails data={data} onUpgradeClick={onUpgradeClick} />
    </div>
  )
}
