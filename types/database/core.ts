/**
 * @file types/database/core.ts  
 * @description Core database types and JSON definitions
 * @created 2025-07-21
 * @todo F002-02: Database schema core types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Base table structure for all database tables
 */
export interface BaseTable {
  Row: Record<string, any>
  Insert: Record<string, any>
  Update: Record<string, any>
}

/**
 * Common fields present in most tables
 */
export interface TimestampFields {
  created_at: string
  updated_at: string
}

export interface BaseRow extends TimestampFields {
  id: string
}

export interface BaseInsert {
  id?: string
  created_at?: string
  updated_at?: string
}

export interface BaseUpdate {
  id?: string
  updated_at?: string
}

/**
 * User relation fields
 */
export interface UserRelation {
  user_id: string
}

/**
 * Subscription relation fields
 */
export interface SubscriptionRelation {
  subscription_id: string | null
}

/**
 * Common enum types used across tables
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
export type AnalysisType = 'quick' | 'comprehensive'
export type ResourceType = 'listing_analysis' | 'api_call' | 'export' | 'competitor_check'
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * Metadata interfaces for JSON fields
 */
export interface AnalysisMetadata {
  scraping_duration?: number
  ai_analysis_duration?: number
  total_photos?: number
  total_reviews?: number
  data_completeness?: number
  [key: string]: any
}

export interface SubscriptionMetadata {
  stripe_customer_id?: string
  stripe_subscription_id?: string
  billing_cycle_anchor?: number
  trial_end?: number
  [key: string]: any
}

export interface UsageMetadata {
  source?: string
  endpoint?: string
  ip_address?: string
  user_agent?: string
  [key: string]: any
}