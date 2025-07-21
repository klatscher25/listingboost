/**
 * @file components/analyze/ScoreOverview.tsx
 * @description Score visualization with German localization
 * @created 2025-07-21
 * @todo FRONTEND-001-02: Score display with visual indicators
 */

'use client'

import { MODERN_DESIGN, glass } from '@/lib/design/modern-tokens'
import { ANALYZE_UI } from '@/lib/theme/analyze-constants'
import type { ScoreBreakdown } from './shared-types'

interface ScoreOverviewProps {
  score: ScoreBreakdown
}

export function ScoreOverview({ score }: ScoreOverviewProps) {
  return (
    <div className={`${glass('secondary')} rounded-2xl p-6 md:p-8`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {ANALYZE_UI.results.score.overall}
        </h3>
      </div>

      {/* Main Score Display */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center">
          {/* Circular Progress Background */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={getScoreColor(score.overall)}
              strokeDasharray={`${(score.overall / 100) * 314} 314`}
              style={{
                transition: 'stroke-dasharray 1s ease-in-out',
              }}
            />
          </svg>

          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">
              {score.overall}
            </span>
            <span className="text-sm text-gray-600">
              {ANALYZE_UI.results.score.outOf.replace('{max}', '100')}
            </span>
          </div>
        </div>

        {/* Score Label */}
        <div className="mt-4">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getScoreBadgeStyle(score.overall)}`}
          >
            {getScoreIcon(score.overall)}
            {getScoreLabel(score.overall)}
          </span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Kategorie-Übersicht
        </h4>

        {Object.entries(ANALYZE_UI.results.score.categories).map(
          ([key, label]) => {
            const categoryScore =
              score.categories[key as keyof typeof score.categories]
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {categoryScore}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${getScoreColor(categoryScore, 'bg')}`}
                    style={{ width: `${categoryScore}%` }}
                  />
                </div>
              </div>
            )
          }
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 pt-6 border-t border-white/20">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Object.values(score.categories).filter((s) => s >= 80).length}
            </div>
            <div className="text-sm text-gray-600">Starke Bereiche</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Object.values(score.categories).filter((s) => s < 70).length}
            </div>
            <div className="text-sm text-gray-600">Verbesserungen</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getScoreColor(score: number, type: 'text' | 'bg' = 'text'): string {
  const prefix = type === 'bg' ? 'bg-gradient-to-r from-' : 'text-'

  if (score >= 90)
    return `${prefix}emerald-500${type === 'bg' ? ' to-green-500' : ''}`
  if (score >= 80)
    return `${prefix}blue-500${type === 'bg' ? ' to-indigo-500' : ''}`
  if (score >= 70)
    return `${prefix}yellow-500${type === 'bg' ? ' to-orange-500' : ''}`
  if (score >= 60)
    return `${prefix}orange-500${type === 'bg' ? ' to-red-500' : ''}`
  return `${prefix}red-500${type === 'bg' ? ' to-rose-500' : ''}`
}

function getScoreBadgeStyle(score: number): string {
  if (score >= 90) return 'bg-emerald-100 text-emerald-800'
  if (score >= 80) return 'bg-blue-100 text-blue-800'
  if (score >= 70) return 'bg-yellow-100 text-yellow-800'
  if (score >= 60) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return ANALYZE_UI.results.score.excellent
  if (score >= 80) return ANALYZE_UI.results.score.good
  if (score >= 70) return ANALYZE_UI.results.score.fair
  return ANALYZE_UI.results.score.poor
}

function getScoreIcon(score: number): JSX.Element {
  if (score >= 90) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  }
  if (score >= 80) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  if (score >= 70) {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}
