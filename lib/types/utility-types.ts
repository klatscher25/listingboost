/**
 * @file lib/types/utility-types.ts
 * @description Utility types for ListingBoost Pro - extracted from shared-types.ts for CLAUDE.md compliance
 * @created 2025-07-21
 * @todo FRONTEND-001-01: Type-safe utility functions
 */

// React types are available globally in Next.js - no import needed

/**
 * 🔧 UTILITY TYPES
 */

// Make properties optional
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Make properties required
export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>

// Extract prop types from component
export type PropsOf<T extends React.ComponentType<any>> = T extends React.ComponentType<infer P> ? P : never

// Brand type for IDs
export type BrandedId<T> = string & { readonly brand: T }
export type UserId = BrandedId<'User'>
export type ListingId = BrandedId<'Listing'>
export type AnalysisId = BrandedId<'Analysis'>

/**
 * 🌐 API & NETWORK TYPES
 */

// API response wrapper
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    version: string
    [key: string]: any
  }
}

// Network status
export type NetworkStatus = 'online' | 'offline' | 'slow'

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'