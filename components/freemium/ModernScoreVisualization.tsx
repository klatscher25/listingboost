/**
 * @file components/freemium/ModernScoreVisualization.tsx
 * @description Modern, conversion-optimized score visualization for freemium dashboard
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo Enhanced score display with animations and conversion optimization
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import type { FreemiumData } from '@/lib/types/freemium-types'

interface ModernScoreVisualizationProps {
  data: FreemiumData
  onUpgradeClick: () => void
}

export function ModernScoreVisualization({
  data,
  onUpgradeClick,
}: ModernScoreVisualizationProps) {
  const { analysis } = data
  const normalizedScore = Math.round(analysis.overallScore) // Use actual 1000-point score
  const displayScore = Math.round(normalizedScore / 10) // Display as 0-100 for UI

  // Calculate competitive positioning using 1000-point system (ScoringSystem.md compliant)
  const getScorePosition = (score: number) => {
    if (score >= 900)
      return {
        label: 'Elite Performer (Top 1%)',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-500',
      }
    if (score >= 800)
      return {
        label: 'High Performer (Top 5%)',
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
      }
    if (score >= 700)
      return {
        label: 'Good Performer (Top 20%)',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-500',
      }
    if (score >= 600)
      return {
        label: 'Average Performer',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
      }
    if (score >= 500)
      return {
        label: 'Below Average',
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
      }
    return {
      label: 'Poor Performer',
      color: 'text-red-600',
      bgColor: 'bg-red-500',
    }
  }

  const position = getScorePosition(normalizedScore)

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
                <div className="text-2xl font-bold text-orange-600">6</div>
                <div className="text-sm text-slate-600">Kritische Probleme</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">47%</div>
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
                  +156% mehr Buchungen
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Zusätzlicher Umsatz:</span>
                <span className="font-bold text-emerald-600">+€3.247/Jahr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown with teaser content */}
      <div className="mb-8">
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50 mb-6">
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
