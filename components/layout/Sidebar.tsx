/**
 * @file components/layout/Sidebar.tsx
 * @description Navigation sidebar with German menu items and responsive design
 * @created 2025-07-21
 * @todo F004-01C - Navigation sidebar with German menu items
 */

'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { GERMAN_UI } from '@/lib/theme/constants'

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
}

interface NavigationItem {
  key: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  children?: NavigationItem[]
}

/**
 * Main navigation sidebar component
 * Features: German menu items, responsive collapse, active state tracking
 */
export function Sidebar({
  className = '',
  isCollapsed = false,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // Navigation menu structure with German labels
  const navigationItems: NavigationItem[] = [
    {
      key: 'dashboard',
      label: GERMAN_UI.navigation.dashboard,
      href: '/dashboard',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5v4l2-2 2 2V5"
          />
        </svg>
      ),
    },
    {
      key: 'listings',
      label: GERMAN_UI.navigation.listings,
      href: '/dashboard/inseraten',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8h4M10 12h4"
          />
        </svg>
      ),
      children: [
        {
          key: 'listings-all',
          label: 'Alle Inseraten',
          href: '/dashboard/inseraten',
          icon: (
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          ),
        },
        {
          key: 'listings-create',
          label: 'Neues Inserat',
          href: '/dashboard/inseraten/neu',
          icon: (
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          ),
        },
      ],
    },
    {
      key: 'analytics',
      label: GERMAN_UI.navigation.analytics,
      href: '/dashboard/analysen',
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      badge: 'Neu',
    },
    {
      key: 'settings',
      label: GERMAN_UI.navigation.einstellungen,
      href: '/dashboard/einstellungen',
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
  ]

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const hasActiveChild = (children?: NavigationItem[]) => {
    return children?.some((child) => isItemActive(child.href)) || false
  }

  const renderNavigationItem = (item: NavigationItem, depth: number = 0) => {
    const isActive = isItemActive(item.href)
    const isExpanded = expandedItems.includes(item.key)
    const hasChildren = item.children && item.children.length > 0
    const hasActiveChildren = hasActiveChild(item.children)

    return (
      <li key={item.key} className="mb-1">
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.key)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
              hasActiveChildren || isActive
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            } ${isCollapsed ? 'justify-center' : ''}`}
            aria-expanded={isExpanded}
            aria-label={`${item.label} ${isExpanded ? 'zuklappen' : 'aufklappen'}`}
          >
            <div className="flex items-center space-x-3">
              <span
                className={`flex-shrink-0 ${hasActiveChildren || isActive ? 'text-blue-600' : 'text-gray-400'}`}
              >
                {item.icon}
              </span>
              {!isCollapsed && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </div>
            {!isCollapsed && (
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        ) : (
          <a
            href={item.href}
            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            } ${depth > 0 ? 'ml-6' : ''} ${isCollapsed ? 'justify-center' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="ml-3 font-medium">{item.label}</span>
            )}
            {!isCollapsed && item.badge && (
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.badge}
              </span>
            )}
          </a>
        )}

        {/* Render children */}
        {hasChildren && (isExpanded || isCollapsed) && !isCollapsed && (
          <ul className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-4">
            {item.children?.map((child) =>
              renderNavigationItem(child, depth + 1)
            )}
          </ul>
        )}
      </li>
    )
  }

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900">
            {GERMAN_UI.navigation.dashboard}
          </h2>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={
              isCollapsed ? 'Sidebar aufklappen' : 'Sidebar zuklappen'
            }
          >
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7M8 12h13"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav
        className="flex-1 px-4 py-4 overflow-y-auto"
        aria-label="Hauptnavigation"
      >
        <ul className="space-y-1">
          {navigationItems.map((item) => renderNavigationItem(item))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="text-xs text-gray-500">
            <p className="font-medium">ListingBoost Pro</p>
            <p>DACH Market Edition</p>
          </div>
        )}
        <div className="mt-2">
          <a
            href="/dashboard/hilfe"
            className={`flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            aria-label={GERMAN_UI.navigation.hilfe}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {!isCollapsed && (
              <span className="ml-3">{GERMAN_UI.navigation.hilfe}</span>
            )}
          </a>
        </div>
      </div>
    </aside>
  )
}
