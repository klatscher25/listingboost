# Database Setup Instructions

## ⚠️ CRITICAL: Manual Schema Creation Required

Since automated SQL execution via the Supabase client is not working, you need to manually create the database schema using the Supabase Dashboard.

## 🔗 Quick Access
**Supabase Dashboard**: https://supabase.com/dashboard/project/exarikehlmtczpaarfed

## 📋 Step-by-Step Instructions

### Step 1: Open SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"**

### Step 2: Execute Initial Schema
Copy and paste the contents of `supabase/migrations/20250720_001_initial_schema.sql` into the SQL editor and run it.

This will create:
- ✅ 13 System tables (profiles, organizations, subscriptions, payments, etc.)
- ✅ Performance indexes
- ✅ Update triggers
- ✅ Plan limits data

### Step 3: Execute Listing Tables Schema
Copy and paste the contents of `supabase/migrations/20250720_002_listing_tables.sql` into the SQL editor and run it.

This will create:
- ✅ 7 Listing tables (listings, listing_reviews, listing_images, etc.)
- ✅ Performance indexes
- ✅ All constraints and relationships

## 🎯 Validation

After running both migrations, verify the schema by running this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see **19 tables** total:
1. api_keys
2. audit_logs
3. listings
4. listing_availability
5. listing_images
6. listing_reviews
7. listing_scores
8. location_competitors
9. notifications
10. organization_members
11. organizations
12. payments
13. plan_limits
14. price_checks
15. profiles
16. subscriptions
17. support_tickets
18. usage_tracking
19. waitlist

## 🔄 Next Steps After Schema Creation

Once the schema is created:

1. ✅ Update TODO.md - mark F002-02 as COMPLETE
2. ▶️ Continue with F002-03: Row Level Security (RLS) Policies
3. ▶️ F002-04: Performance Indexes & Constraints (already included)
4. ▶️ F002-05: Database Migration Scripts (created)
5. ▶️ F002-06: Seed Data für Development

## 🚨 If You Encounter Errors

Common issues and solutions:

### Error: "Extension uuid-ossp does not exist"
Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "Relation already exists"
Some tables might already exist. You can either:
1. Drop existing tables: `DROP TABLE IF EXISTS table_name CASCADE;`
2. Or modify the SQL to use `CREATE TABLE IF NOT EXISTS`

### Error: "Permission denied"
Make sure you're logged in as the project owner or have admin privileges.

## 📞 Support

If you encounter issues:
1. Check the Supabase Dashboard logs
2. Verify your project permissions
3. Contact Supabase support if needed

**Status**: Ready for manual execution
**Next Agent**: Can proceed with F002-03 after manual schema creation