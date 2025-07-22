/**
 * @file app/dashboard/einstellungen/notification-settings.tsx
 * @description Notification preferences component with German UI
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo FRONTEND-001-03: User Management & Settings - Notification Settings
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfile } from '@/lib/auth/client'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

// German validation schema for notification settings
const notificationSchema = z.object({
  marketing_emails_enabled: z.boolean(),
  // We'll use client-side state for other notifications since they're not in DB yet
  analysis_notifications: z.boolean(),
  weekly_reports: z.boolean(),
  system_updates: z.boolean(),
  security_alerts: z.boolean(),
})

type NotificationFormData = z.infer<typeof notificationSchema>

interface NotificationSettingsProps {
  profile: Profile
  userId: string
}

/**
 * Notification Settings Component
 * Manages notification preferences with German UI
 */
export default function NotificationSettings({ profile, userId }: NotificationSettingsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      marketing_emails_enabled: profile.marketing_emails_enabled ?? true,
      // Default values for notifications not yet in database
      analysis_notifications: true,
      weekly_reports: false,
      system_updates: true,
      security_alerts: true,
    },
  })

  const onSubmit = async (data: NotificationFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Update only the fields that exist in the database
      const { error } = await updateProfile(userId, {
        marketing_emails_enabled: data.marketing_emails_enabled,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        setMessage({
          type: 'error',
          text: 'Fehler beim Speichern der Benachrichtigungseinstellungen.',
        })
        return
      }

      // TODO: Store other notification preferences in localStorage or additional table
      localStorage.setItem('notification_preferences', JSON.stringify({
        analysis_notifications: data.analysis_notifications,
        weekly_reports: data.weekly_reports,
        system_updates: data.system_updates,
        security_alerts: data.security_alerts,
      }))

      setMessage({
        type: 'success',
        text: 'Benachrichtigungseinstellungen erfolgreich gespeichert!',
      })

      reset(data)
      router.refresh()
    } catch (error) {
      console.error('Notification settings update error:', error)
      setMessage({
        type: 'error',
        text: 'Ein unerwarteter Fehler ist aufgetreten.',
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
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p
            className={`text-sm ${
              message.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* E-Mail Benachrichtigungen */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            E-Mail Benachrichtigungen
          </h3>
          
          <div className="space-y-4">
            {/* Marketing E-Mails */}
            <div className="flex items-start">
              <input
                {...register('marketing_emails_enabled')}
                type="checkbox"
                id="marketing_emails_enabled"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <label
                  htmlFor="marketing_emails_enabled"
                  className="text-sm font-medium text-gray-700"
                >
                  Marketing-E-Mails
                </label>
                <p className="text-sm text-gray-500">
                  Erhalten Sie Produktupdates, Tipps und spezielle Angebote
                </p>
              </div>
            </div>

            {/* Analysis Notifications */}
            <div className="flex items-start">
              <input
                {...register('analysis_notifications')}
                type="checkbox"
                id="analysis_notifications"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <label
                  htmlFor="analysis_notifications"
                  className="text-sm font-medium text-gray-700"
                >
                  Analyse-Benachrichtigungen
                </label>
                <p className="text-sm text-gray-500">
                  Benachrichtigung, wenn Ihre Listing-Analyse abgeschlossen ist
                </p>
              </div>
            </div>

            {/* Weekly Reports */}
            <div className="flex items-start">
              <input
                {...register('weekly_reports')}
                type="checkbox"
                id="weekly_reports"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <label
                  htmlFor="weekly_reports"
                  className="text-sm font-medium text-gray-700"
                >
                  Wöchentliche Berichte
                </label>
                <p className="text-sm text-gray-500">
                  Zusammenfassung Ihrer Aktivitäten und Fortschritte
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Benachrichtigungen */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            System Benachrichtigungen
          </h3>
          
          <div className="space-y-4">
            {/* System Updates */}
            <div className="flex items-start">
              <input
                {...register('system_updates')}
                type="checkbox"
                id="system_updates"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <label
                  htmlFor="system_updates"
                  className="text-sm font-medium text-gray-700"
                >
                  System-Updates
                </label>
                <p className="text-sm text-gray-500">
                  Informationen über neue Features und Verbesserungen
                </p>
              </div>
            </div>

            {/* Security Alerts */}
            <div className="flex items-start">
              <input
                {...register('security_alerts')}
                type="checkbox"
                id="security_alerts"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <div className="ml-3">
                <label
                  htmlFor="security_alerts"
                  className="text-sm font-medium text-gray-700"
                >
                  Sicherheitswarnungen
                </label>
                <p className="text-sm text-gray-500">
                  Wichtige Sicherheitsmeldungen und Konto-Aktivitäten (empfohlen)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
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
              <h4 className="text-sm font-medium text-blue-800">
                Hinweis zu Benachrichtigungen
              </h4>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  Sie können diese Einstellungen jederzeit ändern. Sicherheitswarnungen
                  sind zum Schutz Ihres Kontos empfohlen.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Speichern...
              </span>
            ) : (
              'Einstellungen speichern'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}