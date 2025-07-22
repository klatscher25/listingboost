/**
 * @file app/dashboard/einstellungen/email-settings.tsx
 * @description Email change component with German UI and validation
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo FRONTEND-001-03: User Management & Settings - Email Change
 */

'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'

// German validation schema for email change
const emailSchema = z.object({
  currentEmail: z.string().email('Ungültige E-Mail-Adresse'),
  newEmail: z.string()
    .email('Ungültige E-Mail-Adresse')
    .min(1, 'Neue E-Mail-Adresse ist erforderlich'),
}).refine((data) => data.currentEmail !== data.newEmail, {
  message: 'Die neue E-Mail-Adresse muss sich von der aktuellen unterscheiden',
  path: ['newEmail'],
})

type EmailFormData = z.infer<typeof emailSchema>

interface EmailSettingsProps {
  currentEmail: string
  userId: string
}

/**
 * Email Settings Component
 * Handles email updates with German validation
 */
export default function EmailSettings({ currentEmail, userId }: EmailSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      currentEmail: currentEmail,
      newEmail: '',
    },
  })

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Update user email via Supabase Auth
      const { error } = await supabase.auth.updateUser({
        email: data.newEmail,
      })

      if (error) {
        console.error('Email update failed:', error)
        setMessage({
          type: 'error',
          text: 'Fehler beim Ändern der E-Mail-Adresse. Bitte versuchen Sie es erneut.',
        })
        return
      }

      setMessage({
        type: 'info',
        text: 'Eine Bestätigungs-E-Mail wurde an die neue Adresse gesendet. Bitte bestätigen Sie die Änderung über den Link in der E-Mail.',
      })

      // Reset form
      reset({
        currentEmail: data.newEmail,
        newEmail: '',
      })
    } catch (error) {
      console.error('Email update error:', error)
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Email (readonly) */}
        <div>
          <label
            htmlFor="currentEmail"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Aktuelle E-Mail-Adresse
          </label>
          <input
            {...register('currentEmail')}
            type="email"
            id="currentEmail"
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          {errors.currentEmail && (
            <p className="mt-1 text-sm text-red-600">
              {errors.currentEmail.message}
            </p>
          )}
        </div>

        {/* New Email */}
        <div>
          <label
            htmlFor="newEmail"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Neue E-Mail-Adresse
          </label>
          <input
            {...register('newEmail')}
            type="email"
            id="newEmail"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="ihre.neue@email.de"
          />
          {errors.newEmail && (
            <p className="mt-1 text-sm text-red-600">
              {errors.newEmail.message}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                Wichtiger Hinweis
              </h4>
              <div className="mt-1 text-sm text-yellow-700">
                <p>
                  Nach der Änderung müssen Sie Ihre neue E-Mail-Adresse bestätigen.
                  Sie erhalten eine Bestätigungs-E-Mail mit einem Link, den Sie anklicken müssen.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                E-Mail ändern...
              </span>
            ) : (
              'E-Mail-Adresse ändern'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}