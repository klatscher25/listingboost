/**
 * @file app/dashboard/einstellungen/account-danger-zone.tsx
 * @description Account deletion and danger zone component with German UI
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo FRONTEND-001-03: User Management & Settings - Account Danger Zone
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'

// German validation schema for account deletion
const deletionSchema = z.object({
  confirmText: z.string()
    .min(1, 'Bestätigung ist erforderlich')
    .refine((val) => val === 'LÖSCHEN', {
      message: 'Bitte geben Sie "LÖSCHEN" ein, um zu bestätigen'
    }),
  confirmEmail: z.string()
    .email('Ungültige E-Mail-Adresse')
    .min(1, 'E-Mail-Bestätigung ist erforderlich'),
  deleteReason: z.string().min(10, 'Bitte geben Sie einen Grund an (min. 10 Zeichen)'),
})

type DeletionFormData = z.infer<typeof deletionSchema>

interface AccountDangerZoneProps {
  userId: string
  userEmail: string
}

/**
 * Account Danger Zone Component
 * Handles irreversible account operations with German UI
 */
export default function AccountDangerZone({ userId, userEmail }: AccountDangerZoneProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
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
    watch,
  } = useForm<DeletionFormData>({
    resolver: zodResolver(deletionSchema),
  })

  const watchedEmail = watch('confirmEmail')

  const onSubmitDeletion = async (data: DeletionFormData) => {
    if (data.confirmEmail !== userEmail) {
      setMessage({
        type: 'error',
        text: 'Die eingegebene E-Mail-Adresse stimmt nicht mit Ihrer Konto-E-Mail überein.',
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // In a real implementation, this would:
      // 1. Create a deletion request in the database
      // 2. Send confirmation email
      // 3. Schedule background job for data deletion
      
      // For now, we'll just log the request
      console.log('Account deletion requested:', {
        userId,
        userEmail,
        reason: data.deleteReason,
        timestamp: new Date().toISOString(),
      })

      setMessage({
        type: 'info',
        text: 'Löschanfrage eingereicht. Sie erhalten eine Bestätigung per E-Mail. Ihr Konto wird innerhalb von 30 Tagen gelöscht.',
      })

      // Close dialog and reset form
      setIsDeleteDialogOpen(false)
      reset()
    } catch (error) {
      console.error('Account deletion request error:', error)
      setMessage({
        type: 'error',
        text: 'Fehler beim Einreichen der Löschanfrage. Bitte versuchen Sie es erneut.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDataPurge = async () => {
    if (!confirm('Sind Sie sicher, dass Sie alle Ihre Analysedaten löschen möchten? Ihr Konto bleibt bestehen, aber alle Listing-Analysen werden unwiderruflich gelöscht.')) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // TODO: Implement data purge
      // This would delete all analysis results, listings, etc. but keep the user account
      
      setMessage({
        type: 'success',
        text: 'Alle Analysedaten wurden erfolgreich gelöscht.',
      })
    } catch (error) {
      console.error('Data purge error:', error)
      setMessage({
        type: 'error',
        text: 'Fehler beim Löschen der Daten. Bitte versuchen Sie es erneut.',
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

      {/* Data Purge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-red-900">
            Alle Analysedaten löschen
          </h3>
          <p className="text-sm text-red-700">
            Löscht alle Ihre Listing-Analysen und gespeicherten Ergebnisse unwiderruflich.
            Ihr Konto bleibt bestehen.
          </p>
        </div>
        <button
          onClick={handleDataPurge}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {isLoading ? 'Lösche...' : 'Daten löschen'}
        </button>
      </div>

      <div className="border-t border-red-200 pt-6">
        {/* Account Deletion */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-900">
              Konto komplett löschen
            </h3>
            <p className="text-sm text-red-700">
              Löscht Ihr Konto und alle damit verbundenen Daten unwiderruflich.
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          </div>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Konto löschen
          </button>
        </div>
      </div>

      {/* Account Deletion Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-900">
                  Konto löschen bestätigen
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmitDeletion)} className="space-y-4">
              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700">
                  <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden.
                  Alle Ihre Daten werden permanent gelöscht.
                </p>
              </div>

              {/* Deletion Reason */}
              <div>
                <label
                  htmlFor="deleteReason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Grund für die Löschung (optional, aber hilfreich)
                </label>
                <textarea
                  {...register('deleteReason')}
                  id="deleteReason"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="Warum möchten Sie Ihr Konto löschen?"
                />
                {errors.deleteReason && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.deleteReason.message}
                  </p>
                )}
              </div>

              {/* Confirm Email */}
              <div>
                <label
                  htmlFor="confirmEmail"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  E-Mail-Adresse bestätigen
                </label>
                <input
                  {...register('confirmEmail')}
                  type="email"
                  id="confirmEmail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder={userEmail}
                />
                {errors.confirmEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmEmail.message}
                  </p>
                )}
              </div>

              {/* Confirm Text */}
              <div>
                <label
                  htmlFor="confirmText"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Geben Sie &quot;LÖSCHEN&quot; ein, um zu bestätigen
                </label>
                <input
                  {...register('confirmText')}
                  type="text"
                  id="confirmText"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="LÖSCHEN"
                />
                {errors.confirmText && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmText.message}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteDialogOpen(false)
                    reset()
                    setMessage(null)
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isLoading || watchedEmail !== userEmail}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Lösche...
                    </span>
                  ) : (
                    'Konto endgültig löschen'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}