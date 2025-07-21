#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * TODO.md Sync Validator
 * Ensures TODO.md reflects actual project state
 */

function checkTodoSync() {
  console.log('🔍 Checking TODO.md synchronization...\n')

  const issues = []

  // 1. Check if TODO.md exists
  const todoPath = path.join(process.cwd(), 'TODO.md')
  if (!fs.existsSync(todoPath)) {
    issues.push('❌ TODO.md not found')
    return { synced: false, issues }
  }

  const todoContent = fs.readFileSync(todoPath, 'utf-8')

  // 2. Check for required sections
  const requiredSections = [
    'CURRENT SPRINT',
    'COMPLETED TASKS',
    'VALIDATION CRITERIA',
    'DELIVERABLES STATUS',
    'NEXT SPRINT',
  ]

  requiredSections.forEach((section) => {
    if (!todoContent.includes(section)) {
      issues.push(`❌ Missing required section: ${section}`)
    }
  })

  // 3. Check for orphaned "in progress" tasks
  const inProgressTasks = todoContent.match(/Status: In Progress/g) || []
  const currentTasks = todoContent.match(/\[CURRENT\]/g) || []

  if (inProgressTasks.length > 1) {
    issues.push(
      `⚠️ Multiple tasks marked "In Progress" (${inProgressTasks.length})`
    )
  }

  // 4. Check if timestamp is recent (within auto-commit window)
  const timestampMatch = todoContent.match(
    /Last Updated.*?(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/
  )
  if (timestampMatch) {
    const lastUpdate = new Date(timestampMatch[1])
    const now = new Date()
    const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60)

    // Auto-commit workflow runs every 6 hours - allow 8 hour buffer
    if (hoursDiff > 8) {
      issues.push(`⚠️ TODO.md last updated ${Math.round(hoursDiff)} hours ago`)
      issues.push(`💡 Auto-commit workflow should update this every 6 hours`)
    }
  } else {
    issues.push('❌ No valid timestamp found in TODO.md')
    issues.push('💡 Use format: Last Updated: YYYY-MM-DD HH:MM:SS')
  }

  // 5. Check for project file consistency
  const projectFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'app/layout.tsx',
    'lib/config.ts',
  ]

  const missingFiles = projectFiles.filter(
    (file) => !fs.existsSync(path.join(process.cwd(), file))
  )

  if (missingFiles.length > 0) {
    issues.push(`❌ Missing expected files: ${missingFiles.join(', ')}`)
  }

  // 6. Check for completed tasks that might be false
  const completedTasks =
    todoContent.match(/\[✅\].*?Status: ✅ COMPLETED/g) || []

  // Report results
  const synced = issues.length === 0

  if (synced) {
    console.log('✅ TODO.md is synchronized!')
    console.log(`📊 Found ${completedTasks.length} completed tasks`)
  } else {
    console.log('❌ TODO.md synchronization issues found:\n')
    issues.forEach((issue) => console.log(`  ${issue}`))
    console.log('\n💡 Please update TODO.md before proceeding')
  }

  return { synced, issues }
}

function main() {
  const result = checkTodoSync()
  process.exit(result.synced ? 0 : 1)
}

if (require.main === module) {
  main()
}

module.exports = { checkTodoSync }
