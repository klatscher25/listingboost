/**
 * @file app/dashboard/einstellungen/settings-form.tsx
 * @description Application preferences form with German UI
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo FRONTEND-001-03: User Management & Settings
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfile } from '@/lib/auth/client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

// German validation schema for settings (only available fields)
const settingsSchema = z.object({
  language: z.enum(['de', 'en']).refine((val) => ['de', 'en'].includes(val), {
    message: 'Bitte wählen Sie eine gültige Sprache aus',
  }),
  timezone: z.string().min(1, 'Zeitzone ist erforderlich'),
  marketing_emails_enabled: z.boolean(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface SettingsFormProps {
  user: User
  profile: Profile
}

/**
 * Application Settings Form Component
 * Handles user preferences with German UI
 */
export default function SettingsForm({ user, profile }: SettingsFormProps) {
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
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      language: (profile.language as 'de' | 'en') || 'de',
      timezone: profile.timezone || 'Europe/Berlin',
      marketing_emails_enabled: profile.marketing_emails_enabled ?? true,
    },
  })

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await updateProfile(user.id, {
        language: data.language,
        timezone: data.timezone,
        marketing_emails_enabled: data.marketing_emails_enabled,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        setMessage({
          type: 'error',
          text: 'Fehler beim Speichern der Einstellungen. Bitte versuchen Sie es erneut.',
        })
        return
      }

      setMessage({
        type: 'success',
        text: 'Einstellungen erfolgreich gespeichert!',
      })

      reset(data)
      router.refresh()
    } catch (error) {
      console.error('Settings update error:', error)
      setMessage({
        type: 'error',
        text: 'Ein unerwarteter Fehler ist aufgetreten.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Language Preference */}
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sprache
          </label>
          <select
            {...register('language')}
            id="language"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="de">Deutsch</option>
            <option value="en">English</option>
          </select>
          {errors.language && (
            <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
          )}
        </div>

        {/* Timezone */}
        <div>
          <label
            htmlFor="timezone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Zeitzone
          </label>
          <select
            {...register('timezone')}
            id="timezone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Europe/Berlin">Berlin (UTC+1)</option>
            <option value="Europe/Vienna">Wien (UTC+1)</option>
            <option value="Europe/Zurich">Zürich (UTC+1)</option>
            <option value="Europe/London">London (UTC+0)</option>
            <option value="America/New_York">New York (UTC-5)</option>
            <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
          </select>
          {errors.timezone && (
            <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
          )}
        </div>

        {/* Marketing Emails */}
        <div className="flex items-center md:col-span-2">
          <input
            {...register('marketing_emails_enabled')}
            type="checkbox"
            id="marketing_emails_enabled"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="marketing_emails_enabled"
            className="ml-3 block text-sm text-gray-700"
          >
            Marketing-E-Mails erhalten
            <span className="block text-xs text-gray-500">
              Erhalten Sie Produktupdates, Tipps und Angebote per E-Mail
            </span>
          </label>
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
  )
}