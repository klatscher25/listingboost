/**
 * @file app/dashboard/profil/profile-form.tsx
 * @description Profile update form with German UI and validation
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-04: User Profile Management
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfile } from '@/lib/auth/client'
import AvatarUpload from './avatar-upload'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

// German validation schema
const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(50, 'Name darf maximal 50 Zeichen lang sein')
    .nullable(),
  timezone: z.string().min(1, 'Zeitzone ist erforderlich'),
  language: z.enum(['de', 'en']).refine((val) => ['de', 'en'].includes(val), {
    message: 'Ungültige Sprache ausgewählt',
  }),
  marketing_emails_enabled: z.boolean(),
  avatar_url: z.string().url('Ungültige URL').nullable().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: User
  profile: Profile
}

/**
 * Profile Form Component - Client Component
 * Handles profile updates with validation and German UI
 */
export default function ProfileForm({ user, profile }: ProfileFormProps) {
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
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      timezone: profile.timezone || 'Europe/Berlin',
      language: (profile.language as 'de' | 'en') || 'de',
      marketing_emails_enabled: profile.marketing_emails_enabled,
      avatar_url: profile.avatar_url || '',
    },
  })

  const currentAvatarUrl = watch('avatar_url')

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await updateProfile(user.id, {
        full_name: data.full_name || null,
        timezone: data.timezone,
        language: data.language,
        marketing_emails_enabled: data.marketing_emails_enabled,
        avatar_url: data.avatar_url || null,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        setMessage({
          type: 'error',
          text: 'Fehler beim Speichern der Änderungen. Bitte versuchen Sie es erneut.',
        })
        return
      }

      setMessage({
        type: 'success',
        text: 'Profil erfolgreich aktualisiert!',
      })

      // Reset form dirty state
      reset(data)

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Profile update error:', error)
      setMessage({
        type: 'error',
        text: 'Ein unerwarteter Fehler ist aufgetreten.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (url: string | null) => {
    setValue('avatar_url', url || '', { shouldDirty: true })
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

      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Profilbild
        </label>
        <AvatarUpload
          currentAvatarUrl={currentAvatarUrl}
          onAvatarChange={handleAvatarChange}
          userId={user.id}
        />
      </div>

      {/* Full Name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Vollständiger Name
        </label>
        <input
          {...register('full_name')}
          type="text"
          id="full_name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ihr vollständiger Name"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.full_name.message}
          </p>
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

      {/* Language */}
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

      {/* Avatar URL */}
      <div>
        <label
          htmlFor="avatar_url"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Profilbild URL (optional)
        </label>
        <input
          {...register('avatar_url')}
          type="url"
          id="avatar_url"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/avatar.jpg"
        />
        {errors.avatar_url && (
          <p className="mt-1 text-sm text-red-600">
            {errors.avatar_url.message}
          </p>
        )}
      </div>

      {/* Marketing Emails */}
      <div className="flex items-center">
        <input
          {...register('marketing_emails_enabled')}
          type="checkbox"
          id="marketing_emails_enabled"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="marketing_emails_enabled"
          className="ml-2 block text-sm text-gray-700"
        >
          Marketing-E-Mails erhalten
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
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
            'Änderungen speichern'
          )}
        </button>
      </div>
    </form>
  )
}
