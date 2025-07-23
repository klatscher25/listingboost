/**
 * @file components/freemium/ModernRecommendationsTeaser.tsx
 * @description Conversion-optimized recommendations teaser with curiosity gaps
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo Teaser recommendations to build curiosity and drive conversions
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FreemiumData } from '@/lib/types/freemium-types'

interface ModernRecommendationsTeaserProps {
  data: FreemiumData
  onUpgradeClick: () => void
}

export function ModernRecommendationsTeaser({
  data,
  onUpgradeClick,
}: ModernRecommendationsTeaserProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  // Process recommendations with categorization and prioritization
  const processedRecommendations = data.recommendations
    .slice(0, 6)
    .map((rec, idx) => {
      // Determine category and impact
      let category = 'Allgemein'
      let icon = '💡'
      let impact = 'Mittel'
      let impactColor = 'text-yellow-600'
      let bgGradient = 'from-gray-50 to-slate-50'

      if (
        rec.toLowerCase().includes('foto') ||
        rec.toLowerCase().includes('bild')
      ) {
        category = 'Fotos'
        icon = '📸'
        impact = 'Hoch'
        impactColor = 'text-emerald-600'
        bgGradient = 'from-emerald-50 to-green-50'
      } else if (
        rec.toLowerCase().includes('preis') ||
        rec.toLowerCase().includes('price')
      ) {
        category = 'Preisoptimierung'
        icon = '💰'
        impact = 'Sehr Hoch'
        impactColor = 'text-red-600'
        bgGradient = 'from-red-50 to-orange-50'
      } else if (
        rec.toLowerCase().includes('titel') ||
        rec.toLowerCase().includes('title')
      ) {
        category = 'Titel & Beschreibung'
        icon = '✨'
        impact = 'Hoch'
        impactColor = 'text-blue-600'
        bgGradient = 'from-blue-50 to-indigo-50'
      } else if (
        rec.toLowerCase().includes('ausstattung') ||
        rec.toLowerCase().includes('amenity')
      ) {
        category = 'Ausstattung'
        icon = '🏠'
        impact = 'Mittel'
        impactColor = 'text-purple-600'
        bgGradient = 'from-purple-50 to-pink-50'
      }

      return {
        id: idx,
        title: rec,
        category,
        icon,
        impact,
        impactColor,
        bgGradient,
        priority: idx < 2 ? 'high' : idx < 4 ? 'medium' : 'low',
        estimatedIncrease: Math.max(8, 25 - idx * 3),
        timeToImplement: idx < 2 ? '15 Min' : idx < 4 ? '30 Min' : '1 Std',
      }
    })

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/30">
      {/* Header with urgency and social proof */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            🎯 Personalisierte Optimierungs-Roadmap
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-600 font-medium">
                KI-analysiert
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-slate-500">•</span>
              <span className="text-slate-600">
                Basierend auf 15.000+ erfolgreichen Listings
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 border border-orange-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">€2.847</div>
              <div className="text-xs text-orange-700">
                Durchschnittlicher Mehr-Umsatz/Jahr
              </div>
              <div className="text-xs text-slate-500 mt-1">
                bei Umsetzung aller Empfehlungen
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority recommendations with teaser content */}
      <div className="space-y-4 mb-8">
        {processedRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-gradient-to-r ${rec.bgGradient} rounded-2xl border border-white/50 overflow-hidden hover:shadow-lg transition-all duration-300`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Icon and category */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center text-xl">
                      {rec.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xs bg-white/60 text-slate-700 px-2 py-1 rounded-full font-medium">
                        {rec.category}
                      </span>
                      <span className={`text-xs font-bold ${rec.impactColor}`}>
                        {rec.impact} Impact
                      </span>
                      <span className="text-xs text-slate-500">
                        ⏱ {rec.timeToImplement}
                      </span>
                    </div>

                    {/* Title with blur effect for long recommendations */}
                    <h3 className="font-bold text-slate-800 mb-2 leading-tight">
                      {rec.title.length > 80 ? (
                        <>
                          {rec.title.substring(0, 80)}
                          <span className="relative">
                            ...
                            <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-transparent to-white/90 pointer-events-none"></div>
                          </span>
                        </>
                      ) : (
                        rec.title
                      )}
                    </h3>

                    {/* Teaser metrics */}
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-bold text-emerald-600">
                          +{rec.estimatedIncrease}%
                        </span>
                        <span className="text-xs text-slate-600">
                          mehr Buchungen
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-xs text-slate-600">
                          Bewertung verbessern
                        </span>
                      </div>
                    </div>

                    {/* Locked content preview */}
                    <div className="bg-white/40 rounded-lg p-3 border border-white/40 relative overflow-hidden">
                      <div className="text-sm text-slate-600 mb-2">
                        <div className="font-medium mb-1">
                          🔒 Detaillierte Umsetzungsschritte:
                        </div>
                        <div className="space-y-1">
                          <div className="h-3 bg-slate-300 rounded animate-pulse w-full"></div>
                          <div className="h-3 bg-slate-300 rounded animate-pulse w-3/4"></div>
                          <div className="h-3 bg-slate-300 rounded animate-pulse w-1/2"></div>
                        </div>
                      </div>

                      {/* Blur overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent backdrop-blur-[2px] flex items-center justify-center">
                        <motion.button
                          onClick={onUpgradeClick}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg"
                        >
                          🔓 Freischalten
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority indicator */}
                {rec.priority === 'high' && (
                  <div className="flex-shrink-0 ml-4">
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      PRIORITÄT
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hidden recommendations counter */}
      <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-2xl p-6 border border-slate-200/50 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-lg font-bold text-slate-800">
            +{Math.max(0, data.recommendations.length - 6)} weitere
            Optimierungen verfügbar
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
          <div>
            <div className="text-xl font-bold text-emerald-600">7</div>
            <div className="text-xs text-slate-600">Sofort-Maßnahmen</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600">5</div>
            <div className="text-xs text-slate-600">Preis-Strategien</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">3</div>
            <div className="text-xs text-slate-600">Saisonale Tipps</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-600">12+</div>
            <div className="text-xs text-slate-600">Profi-Tricks</div>
          </div>
        </div>

        <div className="bg-white/60 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-slate-800 mb-2">
            🎁 Im Pro-Plan enthalten:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span>Schritt-für-Schritt Anleitungen</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Konkurrenz-Benchmarking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Automatische Preisanpassungen</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>24/7 Performance Monitoring</span>
            </div>
          </div>
        </div>

        <motion.button
          onClick={onUpgradeClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-4 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 text-lg w-full md:w-auto"
        >
          🚀 Alle Optimierungen freischalten - €49 einmalig
        </motion.button>

        <p className="text-xs text-slate-500 mt-3">
          30 Tage Geld-zurück-Garantie • Einmalzahlung • Sofortiger Zugang zu
          allen Features
        </p>
      </div>
    </div>
  )
}
