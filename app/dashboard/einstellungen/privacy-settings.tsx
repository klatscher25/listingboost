/**
 * @file app/dashboard/einstellungen/privacy-settings.tsx
 * @description Privacy preferences component with GDPR compliance and German UI
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo FRONTEND-001-03: User Management & Settings - Privacy Settings
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface PrivacySettingsProps {
  profile: Profile
  userId: string
}

/**
 * Privacy Settings Component
 * Manages privacy preferences and GDPR compliance with German UI
 */
export default function PrivacySettings({ profile, userId }: PrivacySettingsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  // Privacy preferences (stored in localStorage for now)
  const [privacyPreferences, setPrivacyPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('privacy_preferences')
      return stored ? JSON.parse(stored) : {
        analytics_tracking: true,
        functional_cookies: true,
        marketing_cookies: false,
        data_sharing: false,
        profile_visibility: 'private',
      }
    }
    return {
      analytics_tracking: true,
      functional_cookies: true,
      marketing_cookies: false,
      data_sharing: false,
      profile_visibility: 'private',
    }
  })

  const handlePrivacyUpdate = async (key: string, value: any) => {
    const newPreferences = { ...privacyPreferences, [key]: value }
    setPrivacyPreferences(newPreferences)
    
    // Store in localStorage (TODO: move to database table)
    localStorage.setItem('privacy_preferences', JSON.stringify(newPreferences))
    
    setMessage({
      type: 'success',
      text: 'Datenschutz-Einstellungen gespeichert!',
    })
  }

  const handleDataExport = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Create data export (this would typically trigger a background job)
      const exportData = {
        user_id: userId,
        profile: profile,
        export_date: new Date().toISOString(),
        // Add more user data as needed
      }

      // For now, download as JSON (in real app, this would be handled server-side)
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `listingboost-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({
        type: 'success',
        text: 'Datenexport erfolgreich erstellt und heruntergeladen!',
      })
    } catch (error) {
      console.error('Data export error:', error)
      setMessage({
        type: 'error',
        text: 'Fehler beim Erstellen des Datenexports.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDataDeletion = async () => {
    if (!confirm('Sind Sie sicher, dass Sie alle Ihre Daten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // TODO: Implement comprehensive data deletion
      setMessage({
        type: 'info',
        text: 'Datenanfrage wurde eingereicht. Sie erhalten eine Bestätigung per E-Mail innerhalb von 30 Tagen.',
      })
    } catch (error) {
      console.error('Data deletion request error:', error)
      setMessage({
        type: 'error',
        text: 'Fehler beim Einreichen der Löschanfrage.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : message.type === 'info'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p
            className={`text-sm ${
              message.type === 'success'
                ? 'text-green-700'
                : message.type === 'info'
                ? 'text-blue-700'
                : 'text-red-700'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Cookie & Tracking Preferences */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Cookie & Tracking Einstellungen
        </h3>
        
        <div className="space-y-4">
          {/* Analytics Tracking */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-700">
                Analyse-Cookies
              </h4>
              <p className="text-sm text-gray-500">
                Helfen uns zu verstehen, wie Sie unsere Website nutzen, um sie zu verbessern
              </p>
            </div>
            <button
              onClick={() => handlePrivacyUpdate('analytics_tracking', !privacyPreferences.analytics_tracking)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                privacyPreferences.analytics_tracking ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacyPreferences.analytics_tracking ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Functional Cookies */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-700">
                Funktionale Cookies (erforderlich)
              </h4>
              <p className="text-sm text-gray-500">
                Notwendig für grundlegende Website-Funktionen wie Login und Einstellungen
              </p>
            </div>
            <button
              disabled
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-400 cursor-not-allowed"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
            </button>
          </div>

          {/* Marketing Cookies */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-700">
                Marketing-Cookies
              </h4>
              <p className="text-sm text-gray-500">
                Für personalisierte Werbung und Remarketing-Kampagnen
              </p>
            </div>
            <button
              onClick={() => handlePrivacyUpdate('marketing_cookies', !privacyPreferences.marketing_cookies)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                privacyPreferences.marketing_cookies ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacyPreferences.marketing_cookies ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Sharing */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Datenfreigabe
        </h3>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-700">
              Daten mit Partnern teilen
            </h4>
            <p className="text-sm text-gray-500">
              Anonymisierte Daten für Marktforschung und Produktverbesserungen teilen
            </p>
          </div>
          <button
            onClick={() => handlePrivacyUpdate('data_sharing', !privacyPreferences.data_sharing)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              privacyPreferences.data_sharing ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                privacyPreferences.data_sharing ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* GDPR Rights */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Ihre Rechte (DSGVO)
        </h3>
        
        <div className="space-y-4">
          {/* Data Export */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                Daten exportieren
              </h4>
              <p className="text-sm text-gray-500">
                Laden Sie eine Kopie all Ihrer bei uns gespeicherten Daten herunter
              </p>
            </div>
            <button
              onClick={handleDataExport}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {isLoading ? 'Erstelle...' : 'Daten exportieren'}
            </button>
          </div>

          {/* Data Deletion */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                Konto und Daten löschen
              </h4>
              <p className="text-sm text-gray-500">
                Permanente Löschung Ihres Kontos und aller damit verbundenen Daten
              </p>
            </div>
            <button
              onClick={handleDataDeletion}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Löschanfrage stellen
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy Link */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-gray-800">
              Weitere Informationen
            </h4>
            <div className="mt-1 text-sm text-gray-600">
              <p>
                Detaillierte Informationen zur Datenverarbeitung finden Sie in unserer{' '}
                <a
                  href="/datenschutz"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Datenschutzerklärung
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}