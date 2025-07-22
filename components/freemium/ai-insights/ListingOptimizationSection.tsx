/**
 * @file components/freemium/ai-insights/ListingOptimizationSection.tsx
 * @description Listing optimization AI insights component
 * @created 2025-07-22
 * @modified 2025-07-22
 * @todo Extracted from main dashboard for CLAUDE.md compliance
 */

'use client'

import { useState } from 'react'
import { FreemiumAIInsights, ListingData } from '@/lib/types/freemium-types'
import { generateOptimizedTitle } from '@/lib/utils/freemium-utils'

interface Props {
  insights: FreemiumAIInsights | null
  listing: ListingData | null
  isLoadingAI: boolean
}

export default function ListingOptimizationSection({
  insights,
  listing,
  isLoadingAI,
}: Props) {
  const [showTitleSimulator, setShowTitleSimulator] = useState(false)
  const [selectedTitleVersion, setSelectedTitleVersion] = useState('current')

  if (isLoadingAI) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            🎯 Listing-Optimierung
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-slate-600">KI analysiert Ihr Listing...</p>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">
            🎯 Listing-Optimierung
          </h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            KI-Analyse starten
          </button>
        </div>
        <p className="text-slate-600">
          Starten Sie eine KI-Analyse für personalisierte
          Optimierungsvorschläge.
        </p>
      </div>
    )
  }

  const optimization = insights.listingOptimization
  const optimizedTitle = generateOptimizedTitle(listing)

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">
          🎯 Listing-Optimierung
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600">
            {Math.round(
              (optimization.titleScore +
                optimization.descriptionScore +
                optimization.photoScore +
                optimization.amenityScore) /
                4
            )}
            /100
          </span>
          <div className="text-sm text-slate-500">Gesamt-Score</div>
        </div>
      </div>

      {/* Title Optimization */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-700">📝 Titel-Optimierung</h4>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-orange-600">
              {optimization.titleScore}/100
            </span>
            <button
              onClick={() => setShowTitleSimulator(!showTitleSimulator)}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Simulator
            </button>
          </div>
        </div>

        {showTitleSimulator && (
          <div className="bg-blue-50 rounded-lg p-4 mb-3">
            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Titel-Version wählen:
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="titleVersion"
                    value="current"
                    checked={selectedTitleVersion === 'current'}
                    onChange={(e) => setSelectedTitleVersion(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Aktuell: {listing?.title}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="titleVersion"
                    value="optimized"
                    checked={selectedTitleVersion === 'optimized'}
                    onChange={(e) => setSelectedTitleVersion(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Optimiert: {optimizedTitle}</span>
                </label>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <h5 className="font-semibold text-sm text-slate-700 mb-1">
                Vorschau:
              </h5>
              <p className="text-sm text-slate-600">
                {selectedTitleVersion === 'current'
                  ? listing?.title
                  : optimizedTitle}
              </p>
              <div className="mt-2 text-xs text-slate-500">
                Geschätzter Impact: +
                {selectedTitleVersion === 'optimized' ? '15-25%' : '0%'} mehr
                Klicks
              </div>
            </div>
          </div>
        )}

        {optimization.titleSuggestions.length > 0 && (
          <div className="space-y-2">
            {optimization.titleSuggestions
              .slice(0, 2)
              .map((suggestion, idx) => (
                <div
                  key={idx}
                  className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3"
                >
                  💡 {suggestion}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Description Optimization */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-700">📄 Beschreibung</h4>
          <span className="text-lg font-bold text-green-600">
            {optimization.descriptionScore}/100
          </span>
        </div>
        {optimization.descriptionImprovements.length > 0 && (
          <div className="space-y-2">
            {optimization.descriptionImprovements
              .slice(0, 2)
              .map((improvement, idx) => (
                <div
                  key={idx}
                  className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3"
                >
                  ✨ {improvement}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Photo Optimization */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-700">📸 Foto-Qualität</h4>
          <span className="text-lg font-bold text-purple-600">
            {optimization.photoScore}/100
          </span>
        </div>
        {optimization.photoRecommendations.length > 0 && (
          <div className="space-y-2">
            {optimization.photoRecommendations
              .slice(0, 2)
              .map((recommendation, idx) => (
                <div
                  key={idx}
                  className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3"
                >
                  📷 {recommendation}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Amenity Optimization */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-700">🏠 Ausstattung</h4>
          <span className="text-lg font-bold text-indigo-600">
            {optimization.amenityScore}/100
          </span>
        </div>
        {optimization.missingAmenities.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700 mb-1">
              Fehlende Top-Ausstattung:
            </div>
            {optimization.missingAmenities.slice(0, 3).map((amenity, idx) => (
              <div
                key={idx}
                className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3"
              >
                ➕ {amenity}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade CTA */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-slate-800 mb-1">
                Vollständige Optimierung
              </h5>
              <p className="text-sm text-slate-600">
                Erhalten Sie detaillierte Schritt-für-Schritt Anleitungen für
                alle Bereiche
              </p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
              Pro upgraden
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
