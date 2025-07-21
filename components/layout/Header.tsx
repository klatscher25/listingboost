/**
 * @file components/layout/Header.tsx
 * @description App header component with user menu and German localization
 * @created 2025-07-21
 * @todo F004-01B - App header with user menu and German labels
 */

'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { GERMAN_UI } from '@/lib/theme/constants'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  className?: string
}

/**
 * Main application header component
 * Features: User menu, search, notifications, German UI
 */
export function Header({ className = '' }: HeaderProps) {
  const { user, signOut, loading } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error('[Header] Sign out error:', error)
    }
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const closeUserMenu = () => {
    setIsUserMenuOpen(false)
  }

  if (loading) {
    return (
      <header className={`bg-white border-b border-gray-200 ${className}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full"></div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={`bg-white border-b border-gray-200 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">LB</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
              ListingBoost Pro
            </h1>
          </div>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={GERMAN_UI.layout.suchePlatzhalter}
              aria-label={GERMAN_UI.layout.suchePlatzhalter}
            />
          </div>
        </div>

        {/* User Menu & Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications Button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 text-gray-400 hover:text-gray-600 md:inline-flex hidden"
            aria-label={GERMAN_UI.ui.benachrichtigungen}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5H4.5v-4.5a6 6 0 0 1 6-6z"
              />
            </svg>
          </Button>

          {/* User Menu Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 p-2"
              aria-label={GERMAN_UI.ui.benutzerMenu}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {user?.email ? (
                  <span className="text-sm font-medium text-blue-700">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg
                    className="w-5 h-5 text-blue-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* User Email - Hidden on mobile */}
              <span className="hidden md:block text-sm font-medium text-gray-700 max-w-32 truncate">
                {user?.email || 'Benutzer'}
              </span>

              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                {/* Overlay for mobile */}
                <div
                  className="fixed inset-0 z-40 md:hidden"
                  onClick={closeUserMenu}
                  aria-hidden="true"
                />

                {/* Menu Content */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {/* User Info Header */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email || 'Benutzer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {GERMAN_UI.dashboard.uebersicht}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <a
                      href="/dashboard/profil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                      onClick={closeUserMenu}
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{GERMAN_UI.ui.profilAnzeigen}</span>
                      </div>
                    </a>

                    <a
                      href="/dashboard/einstellungen"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                      onClick={closeUserMenu}
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{GERMAN_UI.ui.kontoEinstellungen}</span>
                      </div>
                    </a>

                    <div className="border-t border-gray-100 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900"
                      role="menuitem"
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>{GERMAN_UI.navigation.abmelden}</span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
