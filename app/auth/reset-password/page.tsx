/**
 * @file auth/reset-password/page.tsx
 * @description Reset password page for password reset flow
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo F003-05: Password Reset & Email Verification
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { updatePassword } from '../../../lib/auth/client'

// Form validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Neues Passwort ist erforderlich')
      .min(6, 'Passwort muss mindestens 6 Zeichen lang sein')
      .max(128, 'Passwort darf maximal 128 Zeichen lang sein'),
    confirmPassword: z.string().min(1, 'Passwort-Bestätigung ist erforderlich'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState<ResetPasswordForm>({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<ResetPasswordForm>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [isValidToken, setIsValidToken] = useState(false)

  useEffect(() => {
    // Check if we have the required tokens from the URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')

    if (!accessToken || !refreshToken) {
      setGeneralError('Ungültiger oder abgelaufener Link zum Passwort-Reset.')
    } else {
      setIsValidToken(true)
    }
  }, [searchParams])

  const handleInputChange = (field: keyof ResetPasswordForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    try {
      resetPasswordSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors as Partial<ResetPasswordForm>)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await updatePassword(formData.password)

      if (result.success) {
        // Redirect to login with success message
        router.push('/auth/login?message=password-updated')
      } else {
        setGeneralError(result.error || 'Passwort-Update fehlgeschlagen')
      }
    } catch (error) {
      console.error('Password update error:', error)
      setGeneralError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ungültiger Link</h2>
        </div>

        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {generalError}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Der Link zum Passwort-Reset ist ungültig oder abgelaufen.
          </p>
          <Link
            href="/auth/forgot-password"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Neuen Reset-Link anfordern
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Neues Passwort festlegen
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Geben Sie Ihr neues Passwort ein. Es muss mindestens 6 Zeichen lang
          sein.
        </p>
      </div>

      {generalError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Neues Passwort
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Geben Sie Ihr neues Passwort ein"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Passwort bestätigen
          </label>
          <div className="mt-1">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange('confirmPassword', e.target.value)
              }
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Bestätigen Sie Ihr neues Passwort"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Password Strength Indicator */}
        <div className="text-xs text-gray-500">
          <p>Ihr Passwort sollte:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li
              className={formData.password.length >= 6 ? 'text-green-600' : ''}
            >
              Mindestens 6 Zeichen lang sein
            </li>
            <li
              className={
                /[A-Z]/.test(formData.password) ? 'text-green-600' : ''
              }
            >
              Großbuchstaben enthalten (empfohlen)
            </li>
            <li
              className={
                /[0-9]/.test(formData.password) ? 'text-green-600' : ''
              }
            >
              Zahlen enthalten (empfohlen)
            </li>
            <li
              className={
                /[!@#$%^&*]/.test(formData.password) ? 'text-green-600' : ''
              }
            >
              Sonderzeichen enthalten (empfohlen)
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Wird aktualisiert...' : 'Passwort aktualisieren'}
          </button>
        </div>
      </form>

      {/* Back to Sign In */}
      <div className="mt-6">
        <div className="text-center">
          <Link
            href="/auth/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            ← Zur Anmeldung zurück
          </Link>
        </div>
      </div>
    </div>
  )
}
