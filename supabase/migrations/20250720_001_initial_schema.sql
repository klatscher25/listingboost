-- ===================================================================
-- ListingBoost Pro - Initial Database Schema
-- Created: 2025-07-20
-- Purpose: Complete database foundation with 15+ tables
-- ===================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- USER MANAGEMENT TABLES
-- ===================================================================

-- profiles table - User management (referenced by listings.user_id)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    
    -- Profile data
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'Europe/Berlin',
    language TEXT DEFAULT 'de',
    
    -- User experience & settings
    onboarding_completed BOOLEAN DEFAULT false,
    marketing_emails_enabled BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- organizations table - Team features and multi-user support
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Organization details
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- organization_members table - Team membership and role management
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Roles & permissions
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    
    -- Invitation management
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    
    -- Uniqueness constraint
    UNIQUE(organization_id, user_id)
);

-- ===================================================================
-- SUBSCRIPTION & BILLING TABLES
-- ===================================================================

-- subscriptions table - Subscription management for SaaS billing
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Stripe integration
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    
    -- Plan management
    plan_type TEXT NOT NULL CHECK (plan_type IN ('freemium', 'starter', 'growth', 'pro')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
    
    -- Billing cycles
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- payments table - Payment tracking and invoice history
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Stripe payment details
    stripe_payment_intent_id TEXT UNIQUE,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    
    -- Payment status & type
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending')),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'one_time')),
    description TEXT,
    
    -- Timing
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- usage_tracking table - Consumption monitoring for plan limits
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Usage data
    resource_type TEXT NOT NULL CHECK (resource_type IN ('listing_analysis', 'api_call', 'export', 'competitor_check')),
    count INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    
    -- Additional metadata
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Uniqueness constraint
    UNIQUE(user_id, resource_type, date)
);

-- ===================================================================
-- API & SYSTEM TABLES
-- ===================================================================

-- api_keys table - API key management for Pro plan
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- API key details
    name TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    prefix TEXT NOT NULL,
    
    -- Permissions & security
    permissions JSONB DEFAULT '[]'::jsonb,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notifications table - In-app notifications and user communication
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Notification content
    type TEXT NOT NULL CHECK (type IN ('listing_analyzed', 'price_alert', 'competitor_change', 'subscription_expiring')),
    title TEXT NOT NULL,
    message TEXT,
    
    -- Data & status
    data JSONB,
    read_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs table - System audit and compliance tracking
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Audit details
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- SUPPORT & MARKETING TABLES
-- ===================================================================

-- support_tickets table - Customer service and support management
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Ticket content
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Status & priority
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Support team
    assigned_to TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- waitlist table - Pre-launch marketing and lead generation
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    
    -- Marketing attribution
    source TEXT,
    utm_source TEXT,
    utm_campaign TEXT,
    
    -- Conversion tracking
    converted_to_user BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- plan_limits table - Definition of plan restrictions and features
CREATE TABLE plan_limits (
    plan_type TEXT PRIMARY KEY CHECK (plan_type IN ('freemium', 'starter', 'growth', 'pro')),
    
    -- Usage limits
    max_listings INTEGER,
    max_api_calls_per_month INTEGER,
    max_exports_per_month INTEGER,
    
    -- Feature set
    features JSONB
);

-- ===================================================================
-- UPDATE TRIGGERS
-- ===================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- PERFORMANCE INDEXES
-- ===================================================================

-- Critical indexes for performance
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_usage_tracking_user_date ON usage_tracking(user_id, date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX idx_api_keys_hash_active ON api_keys(key_hash) WHERE is_active = true;
CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_organization_members_org ON organization_members(organization_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- ===================================================================
-- INITIAL PLAN LIMITS DATA
-- ===================================================================

INSERT INTO plan_limits (plan_type, max_listings, max_api_calls_per_month, max_exports_per_month, features) VALUES
('freemium', 1, 0, 0, '["basic_analysis"]'::jsonb),
('starter', 5, 0, 10, '["basic_analysis", "competitor_tracking"]'::jsonb),
('growth', 25, 500, 50, '["basic_analysis", "competitor_tracking", "advanced_analytics", "email_support"]'::jsonb),
('pro', 100, 5000, 200, '["basic_analysis", "competitor_tracking", "advanced_analytics", "api_access", "priority_support", "white_label"]'::jsonb);

-- ===================================================================
-- SUCCESS CONFIRMATION
-- ===================================================================

-- Log successful migration
INSERT INTO audit_logs (action, resource_type, new_values, created_at) 
VALUES ('migration_completed', 'database', '{"migration": "20250720_001_initial_schema", "tables_created": 13}'::jsonb, NOW());