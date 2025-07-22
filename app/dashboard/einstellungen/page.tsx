/**
 * @file app/dashboard/einstellungen/page.tsx
 * @description User settings page with comprehensive German UI and business features
 * @created 2025-07-21
 * @modified 2025-07-21
 * @todo FRONTEND-001-03: User Management & Settings (German)
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { requireAuthWithProfile } from '@/lib/auth/server'
import SettingsForm from './settings-form'
import PasswordSettings from './password-settings'
import EmailSettings from './email-settings'
import PrivacySettings from './privacy-settings'
import NotificationSettings from './notification-settings'
import AccountDangerZone from './account-danger-zone'

export const metadata: Metadata = {
  title: 'Einstellungen - ListingBoost Pro',
  description: 'Verwalten Sie Ihre Konto-Einstellungen und Präferenzen',
}

/**
 * Settings Page - Server Component
 * Comprehensive user settings with German localization
 */
export default async function EinstellungenPage() {
  // Require authentication
  const { user, profile } = await requireAuthWithProfile()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Einstellungen
          </h1>
          <p className="text-gray-600">
            Verwalten Sie Ihre Konto-Einstellungen, Präferenzen und Sicherheit.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Application Preferences */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Anwendungs-Präferenzen
              </h2>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Wird geladen...</span>
                  </div>
                }
              >
                <SettingsForm user={user} profile={profile} />
              </Suspense>
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Passwort ändern
            </h2>
            <Suspense fallback={<div className="animate-pulse h-32 bg-gray-100 rounded"></div>}>
              <PasswordSettings userId={user.id} />
            </Suspense>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              E-Mail-Adresse ändern
            </h2>
            <Suspense fallback={<div className="animate-pulse h-32 bg-gray-100 rounded"></div>}>
              <EmailSettings currentEmail={user.email || ''} userId={user.id} />
            </Suspense>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Benachrichtigungen
            </h2>
            <Suspense fallback={<div className="animate-pulse h-48 bg-gray-100 rounded"></div>}>
              <NotificationSettings profile={profile} userId={user.id} />
            </Suspense>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Datenschutz & Privatsphäre
            </h2>
            <Suspense fallback={<div className="animate-pulse h-48 bg-gray-100 rounded"></div>}>
              <PrivacySettings profile={profile} userId={user.id} />
            </Suspense>
          </div>

          {/* Account Danger Zone */}
          <div className="lg:col-span-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-900 mb-6">
                Gefahrenbereich
              </h2>
              <p className="text-sm text-red-700 mb-6">
                Die folgenden Aktionen sind unwiderruflich und können nicht rückgängig gemacht werden.
              </p>
              <Suspense fallback={<div className="animate-pulse h-32 bg-red-100 rounded"></div>}>
                <AccountDangerZone userId={user.id} userEmail={user.email || ''} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}