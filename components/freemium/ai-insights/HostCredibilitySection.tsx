/**
 * @file components/freemium/ai-insights/HostCredibilitySection.tsx
 * @description Host credibility AI insights component
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from main dashboard for CLAUDE.md compliance
 */

'use client'

import { FreemiumAIInsights, ListingData } from '@/lib/types/freemium-types'
import { formatRating } from '@/lib/utils/freemium-utils'

interface Props {
  insights: FreemiumAIInsights | null
  listing: ListingData | null
  isLoadingAI: boolean
}

export default function HostCredibilitySection({
  insights,
  listing,
  isLoadingAI,
}: Props) {
  if (isLoadingAI) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            🏆 Host-Glaubwürdigkeit
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-slate-600">KI analysiert Host-Profil...</p>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          🏆 Host-Glaubwürdigkeit
        </h3>
        <div className="space-y-4">
          {listing?.host.isSuperHost && (
            <div className="flex items-center space-x-3 bg-yellow-50 rounded-lg p-3">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="font-semibold text-yellow-800">
                  Superhost-Status
                </div>
                <div className="text-sm text-yellow-600">
                  Ausgezeichnete Host-Bewertung
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {listing?.host.responseTime && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-medium text-blue-800">Antwortzeit</div>
                <div className="text-sm text-blue-600">
                  {listing.host.responseTime}
                </div>
              </div>
            )}
            {listing?.host.responseRate && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="font-medium text-green-800">Antwortrate</div>
                <div className="text-sm text-green-600">
                  {listing.host.responseRate}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const hostCredibility = insights.hostCredibility

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          🏆 Host-Glaubwürdigkeit
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-green-600">
            {Math.round(hostCredibility.currentScore * 10)}/1000
          </span>
          <div className="text-sm text-slate-500">Vertrauens-Score</div>
        </div>
      </div>

      {/* Current Host Status */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-700 mb-3">
          📊 Aktueller Status
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listing?.host.isSuperHost && (
            <div className="flex items-center space-x-3 bg-yellow-50 rounded-lg p-3">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="font-semibold text-yellow-800">Superhost</div>
                <div className="text-sm text-yellow-600">
                  Top 1% der Gastgeber
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-medium text-blue-800">Gastgeber seit</div>
            <div className="text-sm text-blue-600">
              {listing?.host.timeAsHost || 'Unbekannt'}
            </div>
          </div>

          {listing?.host.responseTime && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="font-medium text-green-800">Antwortzeit</div>
              <div className="text-sm text-green-600">
                {listing.host.responseTime}
              </div>
            </div>
          )}

          {listing?.host.responseRate && (
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="font-medium text-purple-800">Antwortrate</div>
              <div className="text-sm text-purple-600">
                {listing.host.responseRate}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Improvement Tips */}
      {hostCredibility.improvementTips.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">
            💡 Verbesserungsvorschläge
          </h4>
          <div className="space-y-3">
            {hostCredibility.improvementTips.slice(0, 3).map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 bg-slate-50 rounded-lg p-3"
              >
                <span className="text-blue-600 font-bold text-sm">
                  {idx + 1}
                </span>
                <div className="text-sm text-slate-700 flex-1">{tip}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Superhost Benefits */}
      {hostCredibility.superhostBenefits.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">
            🎯 Superhost-Vorteile
          </h4>
          <div className="space-y-2">
            {hostCredibility.superhostBenefits
              .slice(0, 3)
              .map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 text-sm text-slate-600"
                >
                  <span className="text-yellow-500">✨</span>
                  <span>{benefit}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Host Profile Highlights */}
      {listing?.host.highlights && listing.host.highlights.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-3">
            🌟 Host-Highlights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {listing.host.highlights.slice(0, 4).map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 bg-indigo-50 rounded-lg p-2"
              >
                <span className="text-indigo-600 text-sm">🏅</span>
                <span className="text-sm text-indigo-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            Glaubwürdigkeit
          </span>
          <span className="text-sm text-slate-600">
            {Math.round(hostCredibility.currentScore * 10)}/1000
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${hostCredibility.currentScore}%` }}
          ></div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="pt-6 border-t border-slate-200">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-slate-800 mb-1">
                Host-Optimierung Pro
              </h5>
              <p className="text-sm text-slate-600">
                Detaillierte Strategien für Superhost-Status und höhere
                Vertrauenswerte
              </p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
              Mehr erfahren
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
