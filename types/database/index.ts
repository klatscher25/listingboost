/**
 * @file types/database/index.ts
 * @description Main database type definitions - Re-export hub for all database types
 * @created 2025-07-21
 * @todo F002-02: Database schema integration
 */

// Re-export core types
export type { 
  Json,
  BaseTable,
  TimestampFields,
  BaseRow,
  BaseInsert,
  BaseUpdate,
  UserRelation,
  SubscriptionRelation,
  SubscriptionStatus,
  AnalysisType,
  ResourceType,
  AnalysisStatus,
  AnalysisMetadata,
  SubscriptionMetadata,
  UsageMetadata
} from './core'

// Re-export table definitions
export type {
  ProfilesTable,
  SubscriptionsTable,
  UsageTrackingTable,
  ApiKeysTable,
  AuditLogsTable
} from './tables'

// Re-export listings tables
export type {
  ListingsTable,
  AnalysisResultsTable
} from './listings'

// Import required dependencies
import type { createClient } from '@supabase/supabase-js'
import type {
  ProfilesTable,
  SubscriptionsTable,
  UsageTrackingTable,
  ApiKeysTable,
  AuditLogsTable
} from './tables'
import type {
  ListingsTable,
  AnalysisResultsTable
} from './listings'

/**
 * Complete Database interface
 */
export interface Database {
  public: {
    Tables: {
      profiles: ProfilesTable
      subscriptions: SubscriptionsTable
      usage_tracking: UsageTrackingTable
      listings: ListingsTable
      analysis_results: AnalysisResultsTable
      api_keys: ApiKeysTable
      audit_logs: AuditLogsTable
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/**
 * Type-safe Supabase client
 */
export type SupabaseClient = ReturnType<typeof createClient<Database>>

/**
 * Utility types for working with database tables
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type TablesRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

// Default export for backwards compatibility
export default Database