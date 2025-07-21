/**
 * @file components/analyze/CategoryBreakdown.tsx
 * @description Detailed category scores with German explanations
 * @created 2025-07-21
 * @todo FRONTEND-001-02: Category breakdown with German labels
 */

'use client'

import { useState } from 'react'
import {
  MODERN_DESIGN,
  glass,
  interactiveGlass,
} from '@/lib/design/modern-tokens'
import { ANALYZE_UI } from '@/lib/theme/analyze-constants'
import type { ScoreBreakdown } from './shared-types'

interface CategoryBreakdownProps {
  categories: ScoreBreakdown['categories']
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categoryData = Object.entries(ANALYZE_UI.results.score.categories).map(
    ([key, label]) => ({
      key,
      label,
      score: categories[key as keyof typeof categories],
      icon: getCategoryIcon(key),
      description: getCategoryDescription(key),
      tips: getCategoryTips(key),
    })
  )

  return (
    <div className={`${glass('secondary')} rounded-2xl p-6 md:p-8`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
          <svg
            className="w-5 h-5 text-white"
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
        <h3 className="text-xl font-bold text-gray-900">
          Detaillierte Bewertung
        </h3>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categoryData.map((category) => (
          <div
            key={category.key}
            className={`
              ${interactiveGlass('input')} rounded-xl p-4 cursor-pointer
              ${selectedCategory === category.key ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
              transition-all duration-300 group
            `}
            onClick={() =>
              setSelectedCategory(
                selectedCategory === category.key ? null : category.key
              )
            }
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{category.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {category.label}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-gray-900">
                    {category.score}
                  </span>
                  <span className="text-sm text-gray-600">Punkte</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getScoreBadgeStyle(category.score)}`}
                  >
                    {getScoreLabel(category.score)}
                  </span>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  selectedCategory === category.key ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${getScoreGradient(category.score)}`}
                style={{ width: `${category.score}%` }}
              />
            </div>

            {/* Expanded Details */}
            {selectedCategory === category.key && (
              <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {category.description}
                </p>

                {category.tips.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">
                      Verbesserungsvorschläge:
                    </h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {category.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-white/20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className={`${glass('input')} rounded-lg p-4`}>
            <div className="text-xl font-bold text-emerald-600 mb-1">
              {categoryData.filter((c) => c.score >= 80).length}
            </div>
            <div className="text-xs text-gray-600">Starke Kategorien (≥80)</div>
          </div>

          <div className={`${glass('input')} rounded-lg p-4`}>
            <div className="text-xl font-bold text-yellow-600 mb-1">
              {categoryData.filter((c) => c.score >= 70 && c.score < 80).length}
            </div>
            <div className="text-xs text-gray-600">Gute Kategorien (70-79)</div>
          </div>

          <div className={`${glass('input')} rounded-lg p-4`}>
            <div className="text-xl font-bold text-red-600 mb-1">
              {categoryData.filter((c) => c.score < 70).length}
            </div>
            <div className="text-xs text-gray-600">
              Verbesserungsbedarf (&lt;70)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getCategoryIcon(key: string): string {
  const icons: Record<string, string> = {
    photos: '📸',
    description: '📝',
    pricing: '💰',
    amenities: '🏠',
    location: '📍',
    reviews: '⭐',
  }
  return icons[key] || '📊'
}

function getCategoryDescription(key: string): string {
  const descriptions: Record<string, string> = {
    photos:
      'Qualität und Anzahl Ihrer Fotos. Professionelle Bilder sind entscheidend für den ersten Eindruck.',
    description:
      'Vollständigkeit und Attraktivität Ihrer Listing-Beschreibung. Detaillierte Informationen erhöhen das Vertrauen.',
    pricing:
      'Ihre Preisgestaltung im Vergleich zu ähnlichen Unterkünften. Optimale Preise maximieren Buchungen und Umsatz.',
    amenities:
      'Ausstattung und Services, die Sie anbieten. Moderne Annehmlichkeiten steigern die Attraktivität.',
    location:
      'Lage und Erreichbarkeit Ihrer Unterkunft. Eine gute Lage ist oft der wichtigste Buchungsfaktor.',
    reviews:
      'Bewertungen und Gästefeedback. Positive Reviews sind der beste Verkäufer für zukünftige Buchungen.',
  }
  return descriptions[key] || 'Allgemeine Bewertung dieser Kategorie.'
}

function getCategoryTips(key: string): string[] {
  const tips: Record<string, string[]> = {
    photos: [
      'Hochwertige, gut beleuchtete Fotos verwenden',
      'Alle Zimmer und Bereiche zeigen',
      'Außenaufnahmen bei gutem Wetter machen',
      'Professionellen Fotografen beauftragen',
    ],
    description: [
      'Detaillierte Ausstattungsliste erstellen',
      'Besondere Features hervorheben',
      'Anreise- und Umgebungsinfos ergänzen',
      'Hausregeln klar kommunizieren',
    ],
    pricing: [
      'Marktpreise regelmäßig überprüfen',
      'Dynamische Preisgestaltung implementieren',
      'Saisonale Anpassungen vornehmen',
      'Frühbucherrabatte anbieten',
    ],
    amenities: [
      'WLAN-Geschwindigkeit optimieren',
      'Moderne Geräte bereitstellen',
      'Komfortverbesserungen ergänzen',
      'Zusatzservices anbieten',
    ],
    location: [
      'Verkehrsanbindung detailliert beschreiben',
      'Sehenswürdigkeiten in der Nähe erwähnen',
      'Restaurants und Einkaufsmöglichkeiten auflisten',
      'Anreisehinweise verbessern',
    ],
    reviews: [
      'Schnell und freundlich auf Reviews antworten',
      'Probleme proaktiv angehen',
      'Gäste um Bewertungen bitten',
      'Check-in-Prozess optimieren',
    ],
  }
  return tips[key] || []
}

function getScoreGradient(score: number): string {
  if (score >= 90) return 'bg-gradient-to-r from-emerald-500 to-green-500'
  if (score >= 80) return 'bg-gradient-to-r from-blue-500 to-indigo-500'
  if (score >= 70) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
  if (score >= 60) return 'bg-gradient-to-r from-orange-500 to-red-500'
  return 'bg-gradient-to-r from-red-500 to-rose-500'
}

function getScoreBadgeStyle(score: number): string {
  if (score >= 90) return 'bg-emerald-100 text-emerald-700'
  if (score >= 80) return 'bg-blue-100 text-blue-700'
  if (score >= 70) return 'bg-yellow-100 text-yellow-700'
  if (score >= 60) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return ANALYZE_UI.results.score.excellent
  if (score >= 80) return ANALYZE_UI.results.score.good
  if (score >= 70) return ANALYZE_UI.results.score.fair
  return ANALYZE_UI.results.score.poor
}
