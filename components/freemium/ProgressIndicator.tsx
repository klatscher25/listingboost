/**
 * @file components/freemium/ProgressIndicator.tsx
 * @description Visual progress indicator with conversion optimization
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo Progress visualization to create urgency and guide user journey
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  onUpgradeClick: () => void
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  onUpgradeClick,
}: ProgressIndicatorProps) {
  const progressPercentage = (currentStep / totalSteps) * 100

  const steps = [
    { id: 1, name: 'URL-Analyse', icon: '🔍', completed: currentStep >= 1 },
    { id: 2, name: 'Scoring', icon: '📊', completed: currentStep >= 2 },
    { id: 3, name: 'Empfehlungen', icon: '💡', completed: currentStep >= 3 },
    { id: 4, name: 'Vollbericht', icon: '🚀', completed: false, locked: true },
  ]

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Deine Analyse-Reise
          </h3>
          <p className="text-sm text-slate-600">
            Schritt {currentStep} von {totalSteps} abgeschlossen
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-xs text-slate-500">Fortschritt</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 rounded-full h-3 mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full relative"
        />
      </div>

      {/* Steps visualization */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="text-center">
            <div
              className={`relative mx-auto w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all duration-300 ${
                step.locked
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 border-dashed'
                  : step.completed
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                    : 'bg-slate-200 text-slate-400'
              }`}
            >
              {step.locked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🔒</span>
                </div>
              )}
              <span>{step.icon}</span>
            </div>
            <div
              className={`text-xs font-medium ${
                step.locked
                  ? 'text-purple-600'
                  : step.completed
                    ? 'text-emerald-600'
                    : 'text-slate-500'
              }`}
            >
              {step.name}
            </div>
          </div>
        ))}
      </div>

      {/* Next steps preview */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 mb-1">
              🎯 Nächster Schritt: Vollbericht
            </h4>
            <p className="text-sm text-slate-600">
              Schalte 15+ detaillierte Optimierungen und personalisierte
              Strategien frei
            </p>
          </div>
          <motion.button
            onClick={onUpgradeClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 px-4 rounded-full text-sm shadow-lg flex-shrink-0 ml-4"
          >
            Freischalten
          </motion.button>
        </div>
      </div>

      {/* Achievement badges */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2 bg-white/60 rounded-full px-3 py-1">
          <span className="text-emerald-500">✅</span>
          <span className="text-xs font-medium text-slate-700">
            Grundanalyse
          </span>
        </div>
        <div className="flex items-center space-x-2 bg-white/60 rounded-full px-3 py-1">
          <span className="text-blue-500">📊</span>
          <span className="text-xs font-medium text-slate-700">
            Scores berechnet
          </span>
        </div>
        <div className="flex items-center space-x-2 bg-white/60 rounded-full px-3 py-1">
          <span className="text-purple-500">💡</span>
          <span className="text-xs font-medium text-slate-700">
            Empfehlungen
          </span>
        </div>
      </div>
    </div>
  )
}
