/**
 * @file components/freemium/ModernDashboardHero.tsx
 * @description Conversion-optimized hero section for freemium dashboard (no score reveal)
 * @created 2025-07-23
 * @modified 2025-07-23
 * @todo FIXED: Removed overall score display, now purely conversion-focused
 */

'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FreemiumData } from '@/lib/types/freemium-types'

interface ModernDashboardHeroProps {
  data: FreemiumData
  onUpgradeClick: () => void
}

export function ModernDashboardHero({
  data,
  onUpgradeClick,
}: ModernDashboardHeroProps) {
  const { listing, analysis } = data

  // Cycle through a subset of the images in the background
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = listing.images?.slice(0, 5) || [] // Use first 5 images for dynamic background

  useEffect(() => {
    if (images.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      }, 5000) // change image every 5 seconds
      return () => clearInterval(intervalId)
    }
  }, [images.length])

  // Score variables removed - no longer displaying actual scores in freemium

  return (
    <section className="relative overflow-hidden min-h-[60vh] md:min-h-[70vh]">
      {/* Dynamic background with animated image transitions */}
      {images.length > 0 && (
        <AnimatePresence>
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            transition={{ duration: 1 }}
            className="absolute inset-0 h-full w-full"
            style={{
              backgroundImage: `url(${images[currentImageIndex].url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Modern gradient background if no images */}
      {images.length === 0 && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-blue-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_50%)]" />
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white px-4 py-16 sm:py-20 md:py-24">
        {/* Main headline */}
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight"
        >
          Professionelle Airbnb-Optimierung
        </motion.h1>

        {/* Subtitle with listing info */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl"
        >
          Wissenschaftliche Analyse für &quot;
          {listing.title.length > 50
            ? listing.title.substring(0, 50) + '...'
            : listing.title}
          &quot;
        </motion.p>

        {/* Conversion-optimized teaser without revealing score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
            <h2 className="text-lg sm:text-xl mb-4 text-gray-200">
              Professionelle Listing-Analyse
            </h2>
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-center">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🎯
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-300 mt-2">
                Vollständiger Report bereit!
              </div>
            </div>
            <div className="text-sm text-gray-300 mb-4 text-center">
              Umfassende 1000-Punkte-Analyse mit konkreten Handlungsempfehlungen
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm sm:text-base">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400">
                  15+ Verbesserungsbereiche identifiziert
                </span>
              </div>
              {data.isRealData && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-400">Live-Daten analysiert</span>
                </div>
              )}
            </div>

            {/* Prominent CTA button */}
            <div className="mt-6 text-center">
              <motion.button
                onClick={onUpgradeClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg border-2 border-white/20"
              >
                🔓 Vollanalyse freischalten - €49
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Social Proof & Success Stories */}
        <motion.div
          className="mb-8 max-w-3xl"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-emerald-400">15.247</div>
              <div className="text-sm text-gray-300">Analysierte Objekte</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-blue-400">€2.847</div>
              <div className="text-sm text-gray-300">
                Ø Umsatzsteigerung/Jahr
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-purple-400">4,7/5</div>
              <div className="text-sm text-gray-300">Kundenbewertung</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-300">
                München, Deutschland
              </span>
            </div>
            <p className="text-sm italic text-gray-200">
              &quot;Die systematische Analyse hat zu einer messbaren Steigerung
              der Buchungsrate um 47% geführt. Professionelle Methodik mit
              konkreten Handlungsempfehlungen.&quot; - Sarah K., Gastgeberin
            </p>
          </div>
        </motion.div>

        {/* Teaser for premium insights with curiosity gap */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mb-8 max-w-2xl"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-400/30">
            <h3 className="text-lg font-semibold mb-3 text-purple-200">
              🔓 Im Pro-Plan freigeschaltet:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Konkurrenzanalyse in Echtzeit</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span>Professionelle Marktanalyse</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>12+ detaillierte Optimierungsbereiche</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>KI-gestützte Foto-Optimierung</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call-to-action button with scarcity and urgency */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="flex items-center space-x-2 text-sm text-blue-300 mb-2">
            <span>📊</span>
            <span>Professionelle Analyse mit wissenschaft­licher Methodik</span>
            <span>📊</span>
          </div>

          <motion.button
            onClick={onUpgradeClick}
            whileHover={{
              scale: 1.05,
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-4 px-8 md:px-12 rounded-full text-lg md:text-xl shadow-2xl border-2 border-white/20"
          >
            Vollständige Analyse kaufen - €49 einmalig
          </motion.button>

          <p className="text-xs text-gray-400 max-w-md text-center">
            30 Tage Geld-zurück-Garantie • Einmalzahlung • Sofortiger Zugang
          </p>
        </motion.div>
      </div>
    </section>
  )
}
