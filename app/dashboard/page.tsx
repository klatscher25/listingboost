/**
 * @file dashboard/page.tsx
 * @description Main dashboard page with integrated layout and German UI
 * @created 2025-07-20
 * @modified 2025-07-21
 * @todo F004-01D: Updated for new dashboard layout integration
 */

import { requireAuth } from '../../lib/auth/server'
import { GERMAN_UI } from '@/lib/theme/constants'

export default async function DashboardPage() {
  // This will redirect to login if not authenticated
  const user = await requireAuth()

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {GERMAN_UI.layout.willkommen}
        </h1>
        <p className="text-gray-600">
          {GERMAN_UI.layout.willkommenZurueck},{' '}
          {user?.user_metadata?.first_name || user?.email?.split('@')[0]}!
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {GERMAN_UI.dashboard.statistiken}
              </h3>
              <p className="text-sm text-gray-600">Aktuelle Übersicht</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {GERMAN_UI.dashboard.recenteAktivitaet}
              </h3>
              <p className="text-sm text-gray-600">Letzte Änderungen</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {GERMAN_UI.dashboard.schnellaktionen}
              </h3>
              <p className="text-sm text-gray-600">Häufige Aufgaben</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Information Section */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Benutzerinformationen
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                E-Mail-Adresse
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Benutzername
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.user_metadata?.first_name ||
                  user?.email?.split('@')[0] ||
                  'Nicht angegeben'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <p className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {GERMAN_UI.status.aktiv}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Letzter Login
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString('de-DE')
                  : 'Unbekannt'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
