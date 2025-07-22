/**
 * @file scripts/check-database-schema.js
 * @description Check existing database schema and identify missing tables
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

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error && error.message.includes('does not exist')) {
      return false
    }
    
    return true
  } catch (err) {
    return false
  }
}

async function listAllTables() {
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;` 
      })
    
    if (error) {
      console.log('⚠️  Cannot query information_schema directly')
      return null
    }
    
    return data
  } catch (err) {
    return null
  }
}

async function checkCriticalTables() {
  console.log('🔍 Checking critical tables...\n')
  
  const criticalTables = [
    // Core user tables
    { name: 'profiles', required: true, description: 'User profiles' },
    { name: 'organizations', required: false, description: 'Team organizations' },
    { name: 'subscriptions', required: true, description: 'User subscriptions' },
    
    // Core listing tables
    { name: 'listings', required: true, description: 'Main listing data' },
    { name: 'listing_reviews', required: false, description: 'Review data' },
    { name: 'listing_scores', required: false, description: 'AI scoring results' },
    
    // Missing table
    { name: 'analysis_results', required: true, description: '🔥 AI analysis caching (MISSING!)' },
    
    // System tables
    { name: 'audit_logs', required: false, description: 'System audit trail' },
    { name: 'plan_limits', required: true, description: 'Plan configurations' }
  ]
  
  const results = []
  
  for (const table of criticalTables) {
    const exists = await checkTableExists(table.name)
    const status = exists ? '✅' : '❌'
    const priority = table.required ? '[REQUIRED]' : '[Optional]'
    
    console.log(`${status} ${table.name.padEnd(20)} ${priority} - ${table.description}`)
    
    results.push({
      name: table.name,
      exists,
      required: table.required,
      description: table.description
    })
  }
  
  return results
}

async function main() {
  console.log('🚀 ListingBoost Pro - Database Schema Check\n')
  
  // Check critical tables
  const tableResults = await checkCriticalTables()
  
  console.log('\n📊 SUMMARY:')
  console.log('=' .repeat(50))
  
  const missingRequired = tableResults.filter(t => t.required && !t.exists)
  const existingRequired = tableResults.filter(t => t.required && t.exists)
  const missingOptional = tableResults.filter(t => !t.required && !t.exists)
  
  console.log(`✅ Required tables existing: ${existingRequired.length}`)
  console.log(`❌ Required tables missing:  ${missingRequired.length}`)
  console.log(`⚠️  Optional tables missing:  ${missingOptional.length}`)
  
  if (missingRequired.length > 0) {
    console.log('\n🔥 CRITICAL MISSING TABLES:')
    missingRequired.forEach(table => {
      console.log(`   ❌ ${table.name} - ${table.description}`)
    })
    
    console.log('\n📋 SOLUTION:')
    console.log('1. Open Supabase Dashboard → SQL Editor')
    console.log('2. Run migration: supabase/migrations/20250722_001_analysis_results.sql')
    console.log('3. This will create analysis_results table and fix 404 errors')
    
    process.exit(1)
  } else {
    console.log('\n🎉 All required tables exist!')
    console.log('✅ Database schema is consistent')
  }
}

main().catch(console.error)