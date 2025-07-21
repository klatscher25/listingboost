-- ===================================================================
-- ListingBoost Pro - Development Seed Data
-- Created: 2025-07-20
-- Purpose: Test data for development environment
-- ===================================================================

-- ===================================================================
-- SAMPLE USER PROFILES
-- ===================================================================

-- Create test user profiles (using fixed UUIDs for development)
INSERT INTO profiles (id, email, full_name, timezone, language, onboarding_completed) VALUES
('12345678-1234-4567-8901-123456789001', 'test@listingboost.com', 'Test User', 'Europe/Berlin', 'de', true),
('12345678-1234-4567-8901-123456789002', 'demo@listingboost.com', 'Demo User', 'America/New_York', 'en', true),
('12345678-1234-4567-8901-123456789003', 'host@listingboost.com', 'Host User', 'Europe/London', 'en', false);

-- ===================================================================
-- SAMPLE ORGANIZATION
-- ===================================================================

-- Create a test organization
INSERT INTO organizations (id, owner_id, name, slug) VALUES
('87654321-4321-7654-1098-876543210001', '12345678-1234-4567-8901-123456789001', 'Demo Properties GmbH', 'demo-properties');

-- Add organization members
INSERT INTO organization_members (organization_id, user_id, role, joined_at) VALUES
('87654321-4321-7654-1098-876543210001', '12345678-1234-4567-8901-123456789001', 'owner', NOW()),
('87654321-4321-7654-1098-876543210001', '12345678-1234-4567-8901-123456789002', 'member', NOW());

-- ===================================================================
-- SAMPLE SUBSCRIPTIONS
-- ===================================================================

-- Create test subscriptions for different plan types
INSERT INTO subscriptions (user_id, plan_type, status, current_period_start, current_period_end) VALUES
('12345678-1234-4567-8901-123456789001', 'pro', 'active', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days'),
('12345678-1234-4567-8901-123456789002', 'starter', 'active', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),
('12345678-1234-4567-8901-123456789003', 'freemium', 'active', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days');

-- ===================================================================
-- SAMPLE LISTINGS
-- ===================================================================

-- Create sample Airbnb listings
INSERT INTO listings (
  id, user_id, organization_id, airbnb_id, airbnb_url, title, description,
  property_type, room_type, person_capacity, bedroom_count, bed_count, bathroom_count,
  location, location_subtitle, coordinates_latitude, coordinates_longitude,
  overall_rating, reviews_count, price_per_night, currency,
  wifi_available, kitchen_available, parking_available,
  host_name, host_is_superhost, analysis_status
) VALUES
(
  '11111111-2222-3333-4444-555555555001', 
  '12345678-1234-4567-8901-123456789001',
  '87654321-4321-7654-1098-876543210001',
  'demo123456789',
  'https://www.airbnb.com/rooms/demo123456789',
  'Moderne Wohnung im Herzen von München',
  'Wunderschöne, moderne 2-Zimmer-Wohnung in zentraler Lage mit perfekter Verkehrsanbindung.',
  'Entire apartment',
  'Entire home/apt',
  4, 2, 2, 1,
  'Munich',
  'Munich, Bavaria, Germany',
  48.1351, 11.5820,
  4.85, 127,
  12500, 'EUR',
  true, true, false,
  'Maria Schmidt',
  true,
  'completed'
),
(
  '11111111-2222-3333-4444-555555555002',
  '12345678-1234-4567-8901-123456789002',
  NULL,
  'demo987654321',
  'https://www.airbnb.com/rooms/demo987654321',
  'Cozy Studio in Berlin Mitte',
  'Perfect studio apartment for travelers. Walking distance to all major attractions.',
  'Entire apartment',
  'Entire home/apt',
  2, 1, 1, 1,
  'Berlin',
  'Berlin, Germany',
  52.5200, 13.4050,
  4.65, 89,
  8500, 'EUR',
  true, true, true,
  'John Anderson',
  false,
  'pending'
),
(
  '11111111-2222-3333-4444-555555555003',
  '12345678-1234-4567-8901-123456789003',
  NULL,
  'demo555777999',
  'https://www.airbnb.com/rooms/demo555777999',
  'Luxury Villa with Pool in Hamburg',
  'Exclusive villa with private pool and garden. Perfect for families and groups.',
  'Entire house',
  'Entire home/apt',
  8, 4, 5, 3,
  'Hamburg',
  'Hamburg, Germany',
  53.5511, 9.9937,
  4.92, 203,
  25000, 'EUR',
  true, true, true,
  'Sarah Wilson',
  true,
  'analyzing'
);

-- ===================================================================
-- SAMPLE LISTING REVIEWS
-- ===================================================================

-- Create sample reviews for the listings
INSERT INTO listing_reviews (
  listing_id, airbnb_review_id, text, rating, 
  reviewer_first_name, created_at_airbnb,
  sentiment_score, sentiment_category
) VALUES
(
  '11111111-2222-3333-4444-555555555001',
  'review_001_demo',
  'Absolutely fantastic stay! The apartment was spotless, well-located, and Maria was an excellent host. Highly recommend!',
  5,
  'David',
  NOW() - INTERVAL '30 days',
  0.85,
  'positive'
),
(
  '11111111-2222-3333-4444-555555555001',
  'review_002_demo',
  'Great location and clean apartment. The kitchen was well-equipped and the WiFi was fast. Would stay again.',
  5,
  'Emma',
  NOW() - INTERVAL '15 days',
  0.75,
  'positive'
),
(
  '11111111-2222-3333-4444-555555555002',
  'review_003_demo',
  'Nice studio in a good location. The space was a bit small but adequate for a short stay. Host was responsive.',
  4,
  'Michael',
  NOW() - INTERVAL '10 days',
  0.45,
  'neutral'
),
(
  '11111111-2222-3333-4444-555555555003',
  'review_004_demo',
  'Incredible villa! The pool was amazing and the space was perfect for our family reunion. Sarah was a wonderful host.',
  5,
  'Jennifer',
  NOW() - INTERVAL '5 days',
  0.95,
  'positive'
);

-- ===================================================================
-- SAMPLE LISTING IMAGES
-- ===================================================================

-- Create sample image entries
INSERT INTO listing_images (listing_id, image_url, caption, orientation, position_order) VALUES
('11111111-2222-3333-4444-555555555001', 'https://demo.listingboost.com/images/munich_1.jpg', 'Living room with modern furniture', 'LANDSCAPE', 1),
('11111111-2222-3333-4444-555555555001', 'https://demo.listingboost.com/images/munich_2.jpg', 'Fully equipped kitchen', 'LANDSCAPE', 2),
('11111111-2222-3333-4444-555555555001', 'https://demo.listingboost.com/images/munich_3.jpg', 'Comfortable bedroom', 'LANDSCAPE', 3),
('11111111-2222-3333-4444-555555555002', 'https://demo.listingboost.com/images/berlin_1.jpg', 'Cozy studio space', 'LANDSCAPE', 1),
('11111111-2222-3333-4444-555555555002', 'https://demo.listingboost.com/images/berlin_2.jpg', 'Compact kitchen area', 'LANDSCAPE', 2),
('11111111-2222-3333-4444-555555555003', 'https://demo.listingboost.com/images/hamburg_1.jpg', 'Luxury villa exterior with pool', 'LANDSCAPE', 1),
('11111111-2222-3333-4444-555555555003', 'https://demo.listingboost.com/images/hamburg_2.jpg', 'Spacious living room', 'LANDSCAPE', 2);

-- ===================================================================
-- SAMPLE LISTING SCORES
-- ===================================================================

-- Create sample AI scoring results
INSERT INTO listing_scores (
  listing_id, overall_score, category_scores, 
  gemini_analysis_raw, analysis_summary, scoring_version
) VALUES
(
  '11111111-2222-3333-4444-555555555001',
  87,
  '{
    "title_score": 85,
    "description_score": 90,
    "location_score": 95,
    "amenities_score": 88,
    "photos_score": 82,
    "pricing_score": 85
  }'::jsonb,
  'Excellent listing with strong performance across all categories. Title could be optimized with more descriptive keywords.',
  '{
    "strengths": ["Excellent location", "High rating", "Complete amenities"],
    "improvements": ["Add more descriptive title keywords", "Include local attractions in description"],
    "priority": "medium"
  }'::jsonb,
  'v1.0'
),
(
  '11111111-2222-3333-4444-555555555002',
  72,
  '{
    "title_score": 75,
    "description_score": 70,
    "location_score": 85,
    "amenities_score": 65,
    "photos_score": 68,
    "pricing_score": 80
  }'::jsonb,
  'Good listing with potential for improvement. Consider expanding amenities description and adding more photos.',
  '{
    "strengths": ["Good location", "Competitive pricing"],
    "improvements": ["Expand amenities description", "Add more high-quality photos", "Improve title appeal"],
    "priority": "high"
  }'::jsonb,
  'v1.0'
);

-- ===================================================================
-- SAMPLE NOTIFICATIONS
-- ===================================================================

-- Create sample notifications
INSERT INTO notifications (user_id, type, title, message, data) VALUES
(
  '12345678-1234-4567-8901-123456789001',
  'listing_analyzed',
  'Listing Analysis Complete',
  'Your München apartment listing has been analyzed. Overall score: 87/100.',
  '{"listing_id": "11111111-2222-3333-4444-555555555001", "score": 87}'::jsonb
),
(
  '12345678-1234-4567-8901-123456789002',
  'listing_analyzed',
  'Listing Analysis Complete',
  'Your Berlin studio listing has been analyzed. Overall score: 72/100.',
  '{"listing_id": "11111111-2222-3333-4444-555555555002", "score": 72}'::jsonb
),
(
  '12345678-1234-4567-8901-123456789001',
  'subscription_expiring',
  'Subscription Expiring Soon',
  'Your Pro plan subscription will expire in 15 days.',
  '{"days_remaining": 15, "plan": "pro"}'::jsonb
);

-- ===================================================================
-- SAMPLE USAGE TRACKING
-- ===================================================================

-- Create sample usage data
INSERT INTO usage_tracking (user_id, resource_type, count, date, metadata) VALUES
('12345678-1234-4567-8901-123456789001', 'listing_analysis', 3, CURRENT_DATE, '{"listings_analyzed": ["demo123456789"]}'::jsonb),
('12345678-1234-4567-8901-123456789001', 'export', 1, CURRENT_DATE, '{"export_type": "pdf"}'::jsonb),
('12345678-1234-4567-8901-123456789002', 'listing_analysis', 1, CURRENT_DATE, '{"listings_analyzed": ["demo987654321"]}'::jsonb),
('12345678-1234-4567-8901-123456789003', 'listing_analysis', 1, CURRENT_DATE, '{"listings_analyzed": ["demo555777999"]}'::jsonb);

-- ===================================================================
-- SUCCESS CONFIRMATION
-- ===================================================================

-- Log successful seed data creation
INSERT INTO audit_logs (action, resource_type, new_values, created_at) 
VALUES ('seed_data_created', 'database', '{"profiles": 3, "listings": 3, "reviews": 4, "organizations": 1}'::jsonb, NOW());

-- ===================================================================
-- DEVELOPMENT SUMMARY
-- ===================================================================

-- Display summary of created test data
DO $$
BEGIN
  RAISE NOTICE '=== DEVELOPMENT SEED DATA SUMMARY ===';
  RAISE NOTICE 'Created 3 test user profiles';
  RAISE NOTICE 'Created 1 test organization with 2 members';
  RAISE NOTICE 'Created 3 test subscriptions (freemium, starter, pro)';
  RAISE NOTICE 'Created 3 sample listings in Munich, Berlin, Hamburg';
  RAISE NOTICE 'Created 4 sample reviews with sentiment analysis';
  RAISE NOTICE 'Created 7 sample listing images';
  RAISE NOTICE 'Created 2 sample listing scores';
  RAISE NOTICE 'Created 3 sample notifications';
  RAISE NOTICE 'Created sample usage tracking data';
  RAISE NOTICE '=== SEED DATA READY FOR DEVELOPMENT ===';
END $$;