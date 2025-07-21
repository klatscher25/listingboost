/**
 * @file components/analyze/ExportActions.tsx
 * @description Export functionality with German labels
 * @created 2025-07-21
 * @todo FRONTEND-001-02: Export actions with German UI
 */

'use client'

import { useState } from 'react'
import { MODERN_DESIGN, interactiveGlass } from '@/lib/design/modern-tokens'
import { ANALYZE_UI } from '@/lib/theme/analyze-constants'
import type { AnalysisResult, ExportFormat } from './shared-types'

interface ExportActionsProps {
  results: AnalysisResult
}

export function ExportActions({ results }: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format)

    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In real implementation, this would call the export API
      console.log(`Exporting as ${format}:`, results)

      // Show success notification
      const exportMessages: Record<ExportFormat, string> = {
        pdf: ANALYZE_UI.results.export.pdf,
        excel: ANALYZE_UI.results.export.excel,
        csv: ANALYZE_UI.results.export.csv,
        json: 'JSON-Export',
      }
      alert(`${exportMessages[format]} erfolgreich erstellt!`)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setIsExporting(null)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Analyse-Ergebnisse: ${results.title}`,
          text: `Gesamtbewertung: ${results.score.overall}/100 Punkte`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: Copy to clipboard
      const shareText = `Analyse-Ergebnisse für "${results.title}": ${results.score.overall}/100 Punkte\n${window.location.href}`

      try {
        await navigator.clipboard.writeText(shareText)
        alert('Link wurde in die Zwischenablage kopiert!')
      } catch (error) {
        alert('Teilen nicht möglich. Bitte kopieren Sie die URL manuell.')
      }
    }
    setShowShareMenu(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Export Dropdown */}
      <div className="relative">
        <button
          className={`
            ${MODERN_DESIGN.states.button.secondary} 
            inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium
            transition-all duration-300 group
          `}
          onClick={() => setShowShareMenu(!showShareMenu)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-4-4m4 4l4-4m3 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {ANALYZE_UI.results.export.title}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showShareMenu ? 'rotate-180' : ''}`}
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
        </button>

        {/* Export Menu */}
        {showShareMenu && (
          <div
            className={`
            absolute top-full right-0 mt-2 w-64 
            ${interactiveGlass('modal')} rounded-xl shadow-xl 
            border border-white/30 p-2 z-50
          `}
          >
            <div className="space-y-1">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting !== null}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/20 transition-colors group"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-lg group-hover:bg-red-600 transition-colors">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {ANALYZE_UI.results.export.pdf}
                  </div>
                  <div className="text-sm text-gray-600">
                    Vollständiger Bericht mit Diagrammen
                  </div>
                </div>
                {isExporting === 'pdf' && (
                  <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                )}
              </button>

              <button
                onClick={() => handleExport('excel')}
                disabled={isExporting !== null}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/20 transition-colors group"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {ANALYZE_UI.results.export.excel}
                  </div>
                  <div className="text-sm text-gray-600">
                    Daten für weitere Bearbeitung
                  </div>
                </div>
                {isExporting === 'excel' && (
                  <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                )}
              </button>

              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting !== null}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/20 transition-colors group"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {ANALYZE_UI.results.export.csv}
                  </div>
                  <div className="text-sm text-gray-600">
                    Rohdaten für Analyse-Tools
                  </div>
                </div>
                {isExporting === 'csv' && (
                  <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                )}
              </button>

              <div className="border-t border-white/20 my-2" />

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-white/20 transition-colors group"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {ANALYZE_UI.results.export.share}
                  </div>
                  <div className="text-sm text-gray-600">
                    Ergebnisse teilen oder Link kopieren
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick PDF Export Button */}
      <button
        onClick={() => handleExport('pdf')}
        disabled={isExporting !== null}
        className={`
          ${MODERN_DESIGN.states.button.primary} 
          inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium
          transition-all duration-300
          ${isExporting === 'pdf' ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isExporting === 'pdf' ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-4-4m4 4l4-4m3 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        PDF herunterladen
      </button>

      {/* Click outside to close */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  )
}
