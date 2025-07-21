/**
 * @file types/database/tables.ts
 * @description Database table definitions for ListingBoost Pro
 * @created 2025-07-21
 * @todo F002-02: Database table schemas
 */

import type {
  Json,
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

/**
 * PROFILES TABLE - User management
 */
export interface ProfilesTable {
  Row: BaseRow & {
    email: string
    full_name: string | null
    avatar_url: string | null
    timezone: string
    language: string
    onboarding_completed: boolean
    marketing_emails_enabled: boolean
  }
  Insert: BaseInsert & {
    email: string
    full_name?: string | null
    avatar_url?: string | null
    timezone?: string
    language?: string
    onboarding_completed?: boolean
    marketing_emails_enabled?: boolean
  }
  Update: BaseUpdate & {
    email?: string
    full_name?: string | null
    avatar_url?: string | null
    timezone?: string
    language?: string
    onboarding_completed?: boolean
    marketing_emails_enabled?: boolean
  }
}

/**
 * SUBSCRIPTIONS TABLE - Billing management
 */
export interface SubscriptionsTable {
  Row: BaseRow & UserRelation & {
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    status: SubscriptionStatus
    plan_name: string
    plan_price: number
    billing_cycle: 'monthly' | 'yearly'
    trial_ends_at: string | null
    current_period_start: string
    current_period_end: string
    cancel_at_period_end: boolean
    metadata: SubscriptionMetadata | null
  }
  Insert: BaseInsert & UserRelation & {
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    status?: SubscriptionStatus
    plan_name: string
    plan_price: number
    billing_cycle?: 'monthly' | 'yearly'
    trial_ends_at?: string | null
    current_period_start: string
    current_period_end: string
    cancel_at_period_end?: boolean
    metadata?: SubscriptionMetadata | null
  }
  Update: BaseUpdate & {
    user_id?: string
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    status?: SubscriptionStatus
    plan_name?: string
    plan_price?: number
    billing_cycle?: 'monthly' | 'yearly'
    trial_ends_at?: string | null
    current_period_start?: string
    current_period_end?: string
    cancel_at_period_end?: boolean
    metadata?: SubscriptionMetadata | null
  }
}

/**
 * USAGE TRACKING TABLE - Resource consumption
 */
export interface UsageTrackingTable {
  Row: BaseRow & UserRelation & SubscriptionRelation & {
    resource_type: ResourceType
    count: number
    date: string
    metadata: UsageMetadata | null
  }
  Insert: BaseInsert & UserRelation & SubscriptionRelation & {
    resource_type: ResourceType
    count?: number
    date?: string
    metadata?: UsageMetadata | null
  }
  Update: BaseUpdate & {
    user_id?: string
    subscription_id?: string | null
    resource_type?: ResourceType
    count?: number
    date?: string
    metadata?: UsageMetadata | null
  }
}

/**
 * API KEYS TABLE - API access management
 */
export interface ApiKeysTable {
  Row: BaseRow & UserRelation & {
    name: string
    key_hash: string
    prefix: string
    permissions: Json
    last_used_at: string | null
    expires_at: string | null
    is_active: boolean
  }
  Insert: BaseInsert & UserRelation & {
    name: string
    key_hash: string
    prefix: string
    permissions?: Json
    last_used_at?: string | null
    expires_at?: string | null
    is_active?: boolean
  }
  Update: BaseUpdate & {
    user_id?: string
    name?: string
    key_hash?: string
    prefix?: string
    permissions?: Json
    last_used_at?: string | null
    expires_at?: string | null
    is_active?: boolean
  }
}

/**
 * AUDIT LOGS TABLE - System audit trail
 */
export interface AuditLogsTable {
  Row: BaseRow & UserRelation & {
    action: string
    resource_type: string | null
    resource_id: string | null
    old_values: Json | null
    new_values: Json | null
    ip_address: string | null
    user_agent: string | null
  }
  Insert: BaseInsert & UserRelation & {
    action: string
    resource_type?: string | null
    resource_id?: string | null
    old_values?: Json | null
    new_values?: Json | null
    ip_address?: string | null
    user_agent?: string | null
  }
  Update: BaseUpdate & {
    user_id?: string
    action?: string
    resource_type?: string | null
    resource_id?: string | null
    old_values?: Json | null
    new_values?: Json | null
    ip_address?: string | null
    user_agent?: string | null
  }
}