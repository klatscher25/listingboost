/**
 * @file scripts/create-analysis-results-table.js
 * @description Emergency script to create missing analysis_results table
 * @created 2025-07-22
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAnalysisResultsTable() {
  console.log('🔧 Creating analysis_results table...')
  
  const createTableSQL = `
-- analysis_results table - Store AI analysis results from various sources
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Analysis type and status
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('full', 'freemium', 'quick', 'competitor')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- AI insights and results
    ai_insights TEXT, -- JSON string with AI analysis
    gemini_response TEXT, -- Raw Gemini response
    processing_error TEXT, -- Error message if failed
    
    -- Processing metadata
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_duration_seconds INTEGER,
    
    -- Metadata for caching and attribution
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (error) {
      console.error('❌ Error creating table:', error)
      return false
    }
    
    console.log('✅ analysis_results table created successfully')
    return true
    
  } catch (err) {
    console.error('❌ Exception creating table:', err)
    return false
  }
}

async function createIndexes() {
  console.log('🔧 Creating indexes...')
  
  const indexSQL = `
-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_listing_id ON analysis_results(listing_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_type ON analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_results_status ON analysis_results(status);
CREATE INDEX IF NOT EXISTS idx_analysis_results_created ON analysis_results(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_results_metadata ON analysis_results USING GIN(metadata);`

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: indexSQL })
    
    if (error) {
      console.error('❌ Error creating indexes:', error)
      return false
    }
    
    console.log('✅ Indexes created successfully')
    return true
    
  } catch (err) {
    console.error('❌ Exception creating indexes:', err)
    return false
  }
}

async function createTriggers() {
  console.log('🔧 Creating update triggers...')
  
  const triggerSQL = `
-- Update trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_analysis_results_updated_at 
    BEFORE UPDATE ON analysis_results 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();`

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: triggerSQL })
    
    if (error) {
      console.error('❌ Error creating triggers:', error)
      return false
    }
    
    console.log('✅ Triggers created successfully')
    return true
    
  } catch (err) {
    console.error('❌ Exception creating triggers:', err)
    return false
  }
}

async function enableRLS() {
  console.log('🔧 Enabling Row Level Security...')
  
  const rlsSQL = `
-- Enable RLS
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own analysis results" ON analysis_results;
DROP POLICY IF EXISTS "Users can insert own analysis results" ON analysis_results;
DROP POLICY IF EXISTS "Users can update own analysis results" ON analysis_results;
DROP POLICY IF EXISTS "Users can delete own analysis results" ON analysis_results;

CREATE POLICY "Users can view own analysis results" ON analysis_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis results" ON analysis_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis results" ON analysis_results
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis results" ON analysis_results
    FOR DELETE USING (auth.uid() = user_id);`

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: rlsSQL })
    
    if (error) {
      console.error('❌ Error enabling RLS:', error)
      return false
    }
    
    console.log('✅ Row Level Security enabled')
    return true
    
  } catch (err) {
    console.error('❌ Exception enabling RLS:', err)
    return false
  }
}

async function testTable() {
  console.log('🧪 Testing table creation...')
  
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('id')
      .limit(1)
    
    if (error && !error.message.includes('relation "analysis_results" does not exist')) {
      console.error('❌ Error testing table:', error)
      return false
    }
    
    console.log('✅ Table is accessible')
    return true
    
  } catch (err) {
    console.error('❌ Exception testing table:', err)
    return false
  }
}

async function main() {
  console.log('🚀 Starting analysis_results table setup...\n')
  
  // Check if we can use exec_sql (might not be available)
  console.log('📋 Note: If this fails, please run the SQL manually in Supabase Dashboard')
  console.log('📋 SQL location: supabase/migrations/20250722_001_analysis_results.sql\n')
  
  const steps = [
    { name: 'Creating table', fn: createAnalysisResultsTable },
    { name: 'Creating indexes', fn: createIndexes },
    { name: 'Creating triggers', fn: createTriggers },
    { name: 'Enabling RLS', fn: enableRLS },
    { name: 'Testing table', fn: testTable }
  ]
  
  for (const step of steps) {
    const success = await step.fn()
    if (!success) {
      console.log(`\n❌ Setup failed at: ${step.name}`)
      console.log('📋 Please run the SQL migration manually in Supabase Dashboard')
      process.exit(1)
    }
  }
  
  console.log('\n🎉 analysis_results table setup completed successfully!')
  console.log('🔥 Freemium AI insights should now work properly')
}

main().catch(console.error)