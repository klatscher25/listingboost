/**
 * @file components/freemium/StickyUpgradeBar.tsx
 * @description Sticky upgrade bar with urgency and conversion optimization
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo Persistent upgrade CTA that follows user scroll for maximum conversion
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StickyUpgradeBarProps {
  onUpgradeClick: () => void
  isVisible?: boolean
}

export function StickyUpgradeBar({
  onUpgradeClick,
  isVisible = true,
}: StickyUpgradeBarProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  // Track scroll position to show/hide bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 rounded-2xl shadow-2xl border border-emerald-400/30 overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-emerald-500/20 animate-pulse"></div>

              <div className="relative p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Left side - Urgency message */}
                  <div className="flex items-center space-x-4 text-white">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl animate-bounce">🚀</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-lg">
                          Vollständige Analyse verfügbar
                        </span>
                      </div>
                      <div className="text-sm opacity-90">
                        Schalte alle Optimierungen frei und steigere deine
                        Einnahmen um durchschnittlich €2.847/Jahr
                      </div>
                    </div>
                  </div>

                  {/* Right side - CTA and benefits */}
                  <div className="flex items-center space-x-4">
                    {/* Key benefits */}
                    <div className="hidden lg:flex items-center space-x-4 text-white text-sm">
                      <div className="flex items-center space-x-1">
                        <span>✅</span>
                        <span>15+ Detailanalysen</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>✅</span>
                        <span>Konkurrenzanalyse</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>✅</span>
                        <span>30T Geld-zurück</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={onUpgradeClick}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-emerald-600 font-bold py-3 px-6 md:px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-sm md:text-base"
                    >
                      Vollanalyse kaufen - €49 einmalig
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
