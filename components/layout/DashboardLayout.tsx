/**
 * @file components/layout/DashboardLayout.tsx
 * @description Main dashboard layout wrapper with responsive design
 * @created 2025-07-21
 * @todo F004-01D - Dashboard layout integration
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { GERMAN_UI } from '@/lib/theme/constants'

interface DashboardLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * Complete dashboard layout with header, sidebar, and main content area
 * Features: Responsive sidebar, mobile menu, loading states
 */
export function DashboardLayout({
  children,
  className = '',
}: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive breakpoints
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)

      // Auto-collapse sidebar on mobile
      if (isMobileView) {
        setIsSidebarCollapsed(true)
        setIsMobileSidebarOpen(false)
      }
    }

    // Initial check
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen)
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-600">{GERMAN_UI.layout.loading}</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated (should be handled by middleware)
  if (!user) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {GERMAN_UI.ui.loginErforderlich}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {GERMAN_UI.ui.zugriffVerweigert}
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Zur Anmeldung
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${isMobile && !isMobileSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          transition-transform duration-300 ease-in-out
        `}
      >
        <Sidebar
          isCollapsed={isMobile ? false : isSidebarCollapsed}
          onToggle={toggleSidebar}
          className="h-full"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header className="flex-shrink-0" />

        {/* Mobile Menu Button */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <button
              onClick={toggleSidebar}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Menü öffnen"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              Menü
            </button>
          </div>
        )}

        {/* Page Content */}
        <main
          className={`flex-1 overflow-auto bg-gray-50 ${className}`}
          role="main"
          aria-label="Hauptinhalt"
        >
          <div className="h-full">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>© 2025 ListingBoost Pro</span>
              <span className="text-gray-400">|</span>
              <a
                href="/dashboard/datenschutz"
                className="hover:text-gray-900 transition-colors"
              >
                Datenschutz
              </a>
              <span className="text-gray-400">|</span>
              <a
                href="/dashboard/impressum"
                className="hover:text-gray-900 transition-colors"
              >
                Impressum
              </a>
            </div>
            <div className="hidden sm:block">
              <span className="text-xs text-gray-500">
                DACH Market Edition v1.0
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
