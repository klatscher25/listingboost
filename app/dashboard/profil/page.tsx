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

        {/* Quick Settings Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Konto & Einstellungen
            </h2>
            <a
              href="/dashboard/einstellungen"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
            >
              Alle Einstellungen
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                E-Mail-Adresse
              </h3>
              <p className="text-sm text-gray-600 mb-3">{user.email}</p>
              <a
                href="/dashboard/einstellungen"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ändern →
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Passwort & Sicherheit
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Passwort und Sicherheitseinstellungen verwalten
              </p>
              <a
                href="/dashboard/einstellungen"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Verwalten →
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Benachrichtigungen
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                E-Mail- und System-Benachrichtigungen anpassen
              </p>
              <a
                href="/dashboard/einstellungen"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Konfigurieren →
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Datenschutz
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Datenschutz- und Cookie-Einstellungen verwalten
              </p>
              <a
                href="/dashboard/einstellungen"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Konfigurieren →
              </a>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-900">
              Gefahrenbereich
            </h2>
            <a
              href="/dashboard/einstellungen"
              className="text-red-600 hover:text-red-800 text-sm font-medium inline-flex items-center"
            >
              Konto verwalten
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <p className="text-sm text-red-700 mb-4">
            Kritische Konto-Aktionen wie Datenlöschung und Konto-Schließung finden Sie in den Einstellungen.
          </p>
        </div>
      </div>
    </div>
  )
}
