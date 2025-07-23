/**
 * @file components/freemium/UnifiedAnalysisHeader.tsx
 * @description Header and CTA section for unified AI analysis panel
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-08: Extracted from UnifiedAIAnalysisPanel.tsx for CLAUDE.md compliance
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface UnifiedAnalysisHeaderProps {
  onStartAnalysis: () => void
}

export function UnifiedAnalysisHeader({
  onStartAnalysis,
}: UnifiedAnalysisHeaderProps) {
  return (
    <div className="text-center py-16">
      <div className="mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-3xl">🧠</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Vollständige KI-Analyse verfügbar
        </h3>
        <p className="text-slate-600 mb-4 max-w-md mx-auto">
          Starten Sie eine umfassende Analyse mit personalisierter
          DACH-Optimierung und detaillierten Verbesserungsvorschlägen
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-200/50">
            <div className="text-lg font-bold text-blue-600">🇩🇪</div>
            <div className="text-xs text-slate-600">DACH-Markt</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 text-center border border-purple-200/50">
            <div className="text-lg font-bold text-purple-600">🎯</div>
            <div className="text-xs text-slate-600">Listing-Optim.</div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 text-center border border-emerald-200/50">
            <div className="text-lg font-bold text-emerald-600">🏆</div>
            <div className="text-xs text-slate-600">Host-Analyse</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 text-center border border-orange-200/50">
            <div className="text-lg font-bold text-orange-600">📊</div>
            <div className="text-xs text-slate-600">Vollbericht</div>
          </div>
        </div>
      </div>

      <motion.button
        onClick={onStartAnalysis}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
      >
        🚀 KI-Komplettanalyse starten
      </motion.button>
    </div>
  )
}
