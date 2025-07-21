/**
 * @file app/dashboard/layout.tsx
 * @description Dashboard layout wrapper for all dashboard routes
 * @created 2025-07-21
 * @todo F004-01D - Dashboard layout integration
 */

import { DashboardLayout } from '@/components/layout/DashboardLayout'

interface DashboardLayoutWrapperProps {
  children: React.ReactNode
}

/**
 * Layout wrapper for all dashboard routes
 * Provides consistent header, sidebar, and navigation
 */
export default function DashboardLayoutWrapper({
  children,
}: DashboardLayoutWrapperProps) {
  return <DashboardLayout>{children}</DashboardLayout>
}
