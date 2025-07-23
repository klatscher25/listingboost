/**
 * @file components/freemium/ScoreAnalysisDetails.tsx
 * @description Detailed score analysis with categories and methodology
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-05: Extracted from ModernScoreVisualization.tsx for CLAUDE.md compliance
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import type { FreemiumData } from '@/lib/types/freemium-types'

interface ScoreAnalysisDetailsProps {
  data: FreemiumData
  onUpgradeClick: () => void
}

export function ScoreAnalysisDetails({
  data,
  onUpgradeClick,
}: ScoreAnalysisDetailsProps) {
  const { analysis } = data

  // Category scores for display
  const categories = [
    { name: 'Fotos', score: analysis.categoryScores.photos, icon: '📸' },
    {
      name: 'Beschreibung',
      score: analysis.categoryScores.description,
      icon: '📝',
    },
    {
      name: 'Preisgestaltung',
      score: analysis.categoryScores.pricing,
      icon: '💰',
    },
    {
      name: 'Ausstattung',
      score: analysis.categoryScores.amenities,
      icon: '🏠',
    },
    { name: 'Lage', score: analysis.categoryScores.location, icon: '📍' },
    { name: 'Titel', score: analysis.categoryScores.title, icon: '✨' },
  ]

  return (
    <div className="space-y-8">
      {/* Category breakdown with teaser content */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            Kategorie-Analyse
          </h3>
          <button
            onClick={onUpgradeClick}
            className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-200"
          >
            🔓 Alle Details freischalten
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/80 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-semibold text-slate-800">
                    {category.name}
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-800">
                  <CountUp
                    start={0}
                    end={category.score}
                    duration={1.5}
                    delay={index * 0.2}
                  />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.score}%` }}
                  transition={{ duration: 1.5, delay: index * 0.2 }}
                  className={`h-2 rounded-full ${
                    category.score >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                      : category.score >= 70
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        : category.score >= 60
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}
                />
              </div>

              {/* Teaser for improvement */}
              {category.score < 85 && (
                <div className="text-xs text-slate-500 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 mt-2">
                  💡 <span className="font-medium">Pro-Tipp verfügbar:</span>{' '}
                  {category.score < 70
                    ? 'Sofortiger Handlungsbedarf'
                    : 'Optimierungspotenzial erkannt'}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Methodology Transparency - German "Gründlichkeit" principle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <span>🔍</span>
                <span>Vollständige 1000-Punkte Analyse-Methodik</span>
              </h3>
              <div className="group-open:rotate-180 transition-transform">
                <svg
                  className="w-5 h-5 text-slate-600"
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
            </div>
          </summary>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p>
              Unser wissenschaftlich fundiertes Bewertungssystem analysiert 10
              Hauptkategorien:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Host Performance & Trust (180 Punkte)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>Guest Satisfaction & Reviews (200 Punkte)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Listing Content & Optimization (180 Punkte)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Visual Presentation (120 Punkte)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                <span>Property Features (140 Punkte)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Pricing Strategy (100 Punkte)</span>
              </div>
            </div>

            {/* Pro Categories (Locked) */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                <span>🔒</span>
                <span>Pro-Analysen (weitere 220 Punkte)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs opacity-60">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span>Availability & Booking (80 Punkte)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span>Location & Market Position (60 Punkte)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span>Business Performance (40 Punkte)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span>Trust & Safety (40 Punkte)</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-3">
              <strong>Datenquellen:</strong> 4 spezialisierte Airbnb-Scraper +
              Google Gemini KI-Analyse + Marktvergleichsdaten
            </p>
          </div>
        </details>
      </div>

      {/* Bottom CTA with German price transparency */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200/50">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Detailanalyse und Handlungsempfehlungen
          </h3>
          <p className="text-slate-600 mb-4">
            Wissenschaftlich fundierte Optimierungsstrategien mit konkreten
            Umsetzungsschritten
          </p>

          {/* Professional analysis value proposition */}
          <div className="bg-white/80 rounded-xl p-4 mb-4">
            <div className="text-sm text-slate-700 mb-2">
              <strong>Professionelle Vollanalyse:</strong>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-lg font-bold text-emerald-600">€49</div>
                <div className="text-xs text-slate-600">Einmalzahlung</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">€2.847</div>
                <div className="text-xs text-slate-600">
                  Ø Mehr-Umsatz/Jahr*
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">30 Tage</div>
                <div className="text-xs text-slate-600">
                  Geld-zurück-Garantie
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6 mb-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span>15+ Detailanalysen</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Konkurrenzvergleich</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Marktposition</span>
            </div>
          </div>
          <motion.button
            onClick={onUpgradeClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Vollanalyse kaufen - €49 einmalig
          </motion.button>
          <p className="text-xs text-slate-500 mt-3">
            *Basierend auf historischen Daten von 15.000+ Gastgebern, nicht
            garantiert • Einmalzahlung • DSGVO-konform
          </p>
        </div>
      </div>
    </div>
  )
}
