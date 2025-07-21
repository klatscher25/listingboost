/**
 * @file app/dashboard/profil/page.tsx
 * @description User profile settings page with German UI
 * @created 2025-07-20
 * @modified 2025-07-20
 * @todo F003-04: User Profile Management
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { requireAuthWithProfile } from '@/lib/auth/server'
import ProfileForm from './profile-form'

export const metadata: Metadata = {
  title: 'Profil - ListingBoost Pro',
  description: 'Verwalten Sie Ihre Profileinstellungen',
}

/**
 * Profile Settings Page - Server Component
 * Requires authentication and loads user profile data
 */
export default async function ProfilPage() {
  // Require authentication
  const { user, profile } = await requireAuthWithProfile()

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Profil Einstellungen
          </h1>
          <p className="text-gray-600">
            Verwalten Sie Ihre persönlichen Daten und Kontoeinstellungen.
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Profil wird geladen...
                </span>
              </div>
            }
          >
            <ProfileForm user={user} profile={profile} />
          </Suspense>
        </div>

        {/* Account Security Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Konto Sicherheit
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  E-Mail-Adresse
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Ändern
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Passwort</h3>
                <p className="text-sm text-gray-600">
                  Zuletzt geändert vor 30 Tagen
                </p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Passwort ändern
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">
            Gefahrenbereich
          </h2>
          <p className="text-sm text-red-700 mb-4">
            Die folgenden Aktionen können nicht rückgängig gemacht werden.
          </p>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Konto löschen
          </button>
        </div>
      </div>
    </div>
  )
}
