/**
 * @file auth/register/page.tsx
 * @description Registration page with form validation - refactored for CLAUDE.md compliance
 * @created 2025-07-20
 * @modified 2025-07-23
 * @todo COMPLIANCE-001-07: Refactored using modular architecture
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp, signInWithGoogle } from '../../../lib/auth/client'
import {
  type RegisterForm,
  defaultFormData,
  validateRegisterForm,
} from '@/lib/auth/register-schema'
import { RegisterFormFields } from '@/components/auth/RegisterFormFields'
import { AlertMessages } from '@/components/auth/AlertMessages'

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState<RegisterForm>(defaultFormData)
  const [errors, setErrors] = useState<Partial<RegisterForm>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (
    field: keyof RegisterForm,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const { isValid, errors: validationErrors } = validateRegisterForm(formData)
    setErrors(validationErrors)
    return isValid
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
      const result = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
      })

      if (result.success) {
        setSuccessMessage(
          'Account created successfully! Please check your email to verify your account before signing in.'
        )
        // Clear form
        setFormData(defaultFormData)
      } else {
        setGeneralError(result.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setGeneralError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setGeneralError('')

    try {
      const result = await signInWithGoogle()

      if (!result.success) {
        setGeneralError(result.error || 'Google sign in failed')
      }
      // For Google OAuth, the redirect is handled by Supabase
    } catch (error) {
      console.error('Google sign in error:', error)
      setGeneralError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Get started with ListingBoost Pro today.
        </p>
      </div>

      <AlertMessages
        generalError={generalError}
        successMessage={successMessage}
      />

      <RegisterFormFields
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* Sign In Link */}
      <div className="mt-6">
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
          </span>
          <Link
            href="/auth/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
