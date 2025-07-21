/**
 * @file types/database.ts
 * @description Database types for ListingBoost Pro - Modularized for CLAUDE.md compliance
 * @created 2025-07-20
 * @modified 2025-07-21
 * @todo F002-02: Database schema implementation
 */

// Re-export all types from the modularized database structure
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
  UsageMetadata,
  ProfilesTable,
  SubscriptionsTable,
  UsageTrackingTable,
  ApiKeysTable,
  AuditLogsTable,
  ListingsTable,
  AnalysisResultsTable,
  Database,
  SupabaseClient,
  Tables,
  TablesInsert,
  TablesUpdate,
  TablesRow
} from './database/index'

// Default export for backwards compatibility  
export type { default } from './database/index'