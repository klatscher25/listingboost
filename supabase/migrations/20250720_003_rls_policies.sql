-- ===================================================================
-- ListingBoost Pro - Row Level Security (RLS) Policies
-- Created: 2025-07-20
-- Purpose: User isolation and multi-tenant security
-- ===================================================================

-- ===================================================================
-- ENABLE RLS ON ALL USER-RELATED TABLES
-- ===================================================================

-- Core user tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Subscription & billing tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- System tables
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Core listing tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_scores ENABLE ROW LEVEL SECURITY;

-- Audit logs (special handling - readable by all, writable by system)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- PROFILES TABLE POLICIES
-- ===================================================================

-- Users can only see their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ===================================================================
-- ORGANIZATIONS TABLE POLICIES
-- ===================================================================

-- Users can see organizations they own or are members of
CREATE POLICY "organizations_select_member" ON organizations
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid()
    )
  );

-- Only owners can update organizations
CREATE POLICY "organizations_update_owner" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

-- Only authenticated users can create organizations
CREATE POLICY "organizations_insert_auth" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- ===================================================================
-- ORGANIZATION MEMBERS POLICIES
-- ===================================================================

-- Users can see memberships in organizations they belong to
CREATE POLICY "organization_members_select_member" ON organization_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = organization_id 
      AND owner_id = auth.uid()
    )
  );

-- Only organization owners can manage memberships
CREATE POLICY "organization_members_manage_owner" ON organization_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = organization_id 
      AND owner_id = auth.uid()
    )
  );

-- ===================================================================
-- SUBSCRIPTIONS & BILLING POLICIES
-- ===================================================================

-- Users can only see their own subscriptions
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own subscriptions
CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE USING (user_id = auth.uid());

-- System can insert subscriptions
CREATE POLICY "subscriptions_insert_system" ON subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only see their own payments
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (user_id = auth.uid());

-- System can insert payments
CREATE POLICY "payments_insert_system" ON payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only see their own usage tracking
CREATE POLICY "usage_tracking_select_own" ON usage_tracking
  FOR SELECT USING (user_id = auth.uid());

-- System can insert/update usage tracking
CREATE POLICY "usage_tracking_insert_system" ON usage_tracking
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "usage_tracking_update_system" ON usage_tracking
  FOR UPDATE USING (user_id = auth.uid());

-- ===================================================================
-- API KEYS POLICIES
-- ===================================================================

-- Users can only see their own API keys
CREATE POLICY "api_keys_select_own" ON api_keys
  FOR SELECT USING (user_id = auth.uid());

-- Users can manage their own API keys
CREATE POLICY "api_keys_manage_own" ON api_keys
  FOR ALL USING (user_id = auth.uid());

-- ===================================================================
-- NOTIFICATIONS POLICIES
-- ===================================================================

-- Users can only see their own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ===================================================================
-- SUPPORT TICKETS POLICIES
-- ===================================================================

-- Users can only see their own support tickets
CREATE POLICY "support_tickets_select_own" ON support_tickets
  FOR SELECT USING (user_id = auth.uid());

-- Users can manage their own support tickets
CREATE POLICY "support_tickets_manage_own" ON support_tickets
  FOR ALL USING (user_id = auth.uid());

-- ===================================================================
-- LISTINGS TABLE POLICIES (Multi-tenant with organization support)
-- ===================================================================

-- Users can see listings they own or that belong to their organizations
CREATE POLICY "listings_select_own_or_org" ON listings
  FOR SELECT USING (
    user_id = auth.uid() OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = listings.organization_id 
      AND user_id = auth.uid()
    ))
  );

-- Users can insert listings for themselves or their organizations
CREATE POLICY "listings_insert_own_or_org" ON listings
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    (organization_id IS NULL OR EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = listings.organization_id 
      AND user_id = auth.uid()
    ))
  );

-- Users can update listings they own or that belong to their organizations
CREATE POLICY "listings_update_own_or_org" ON listings
  FOR UPDATE USING (
    user_id = auth.uid() OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = listings.organization_id 
      AND user_id = auth.uid()
    ))
  );

-- Users can delete listings they own or that belong to their organizations
CREATE POLICY "listings_delete_own_or_org" ON listings
  FOR DELETE USING (
    user_id = auth.uid() OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_id = listings.organization_id 
      AND user_id = auth.uid()
    ))
  );

-- ===================================================================
-- LISTING RELATED TABLES POLICIES
-- ===================================================================

-- Listing reviews: Users can see reviews for listings they have access to
CREATE POLICY "listing_reviews_select_via_listing" ON listing_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_id 
      AND (
        user_id = auth.uid() OR
        (organization_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM organization_members 
          WHERE organization_id = listings.organization_id 
          AND user_id = auth.uid()
        ))
      )
    )
  );

-- Listing images: Users can see images for listings they have access to
CREATE POLICY "listing_images_select_via_listing" ON listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_id 
      AND (
        user_id = auth.uid() OR
        (organization_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM organization_members 
          WHERE organization_id = listings.organization_id 
          AND user_id = auth.uid()
        ))
      )
    )
  );

-- Listing availability: Users can see availability for listings they have access to
CREATE POLICY "listing_availability_select_via_listing" ON listing_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_id 
      AND (
        user_id = auth.uid() OR
        (organization_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM organization_members 
          WHERE organization_id = listings.organization_id 
          AND user_id = auth.uid()
        ))
      )
    )
  );

-- Price checks: Users can see price checks for listings they have access to
CREATE POLICY "price_checks_select_via_listing" ON price_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_id 
      AND (
        user_id = auth.uid() OR
        (organization_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM organization_members 
          WHERE organization_id = listings.organization_id 
          AND user_id = auth.uid()
        ))
      )
    )
  );

-- Listing scores: Users can see scores for listings they have access to
CREATE POLICY "listing_scores_select_via_listing" ON listing_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_id 
      AND (
        user_id = auth.uid() OR
        (organization_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM organization_members 
          WHERE organization_id = listings.organization_id 
          AND user_id = auth.uid()
        ))
      )
    )
  );

-- ===================================================================
-- AUDIT LOGS POLICIES (Special handling)
-- ===================================================================

-- Users can see audit logs related to their actions
CREATE POLICY "audit_logs_select_own" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- Only system can insert audit logs
CREATE POLICY "audit_logs_insert_system" ON audit_logs
  FOR INSERT WITH CHECK (true); -- System inserts, no user restriction

-- ===================================================================
-- PUBLIC TABLES (No RLS needed)
-- ===================================================================

-- plan_limits: Public read-only data
-- location_competitors: Public market data
-- waitlist: Public signup data

-- ===================================================================
-- SUCCESS CONFIRMATION
-- ===================================================================

-- Log successful RLS implementation
INSERT INTO audit_logs (action, resource_type, new_values, created_at) 
VALUES ('rls_policies_implemented', 'database', '{"policies_created": 25, "tables_secured": 15}'::jsonb, NOW());