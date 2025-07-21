/**
 * @file auth/forgot-password/page.tsx
 * @description Forgot password page with email validation
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-05: Password Reset & Email Verification
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { resetPassword } from '../../../lib/auth/client'

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'E-Mail ist erforderlich')
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<ForgotPasswordForm>({
    email: '',
  })
  const [errors, setErrors] = useState<Partial<ForgotPasswordForm>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (
    field: keyof ForgotPasswordForm,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    try {
      forgotPasswordSchema.parse(formData)
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
        setErrors(fieldErrors as Partial<ForgotPasswordForm>)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setSuccessMessage('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await resetPassword(formData.email)

      if (result.success) {
        setSuccessMessage(
          'Anweisungen zum Passwort-Reset wurden an Ihre E-Mail-Adresse gesendet. Bitte überprüfen Sie Ihr Postfach und folgen Sie den Anweisungen zum Zurücksetzen Ihres Passworts.'
        )
        setFormData({ email: '' })
      } else {
        setGeneralError(
          result.error || 'Fehler beim Senden der Passwort-Reset E-Mail'
        )
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setGeneralError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Passwort zurücksetzen
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen Anweisungen zum
          Zurücksetzen Ihres Passworts.
        </p>
      </div>

      {generalError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {generalError}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            E-Mail-Adresse
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Geben Sie Ihre E-Mail-Adresse ein"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Wird gesendet...' : 'Reset-Anweisungen senden'}
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
