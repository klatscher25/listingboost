#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const MAX_LINES = 400
const EXCLUDED_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'out',
  '.venv',
  'venv',
  '__pycache__', // Python virtual environments
  'build',
  'coverage',
  '.nyc_output', // Build and test outputs
  '.turbo',
  '.swc',
  '.cache', // Build caches
  '__tests__',
  'tests',
  'test', // Test directories (separate validation)
]

// PROGRAM FILES ONLY - documentation files (.md, .txt, .rst) and config files (.json, .yaml) are EXEMPT
const INCLUDED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx', // TypeScript/JavaScript
  '.py', // Python
  '.go', // Go
  '.css',
  '.scss', // Stylesheets
]

function checkFileSize(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').length
  return { lines, oversized: lines > MAX_LINES }
}

function scanDirectory(dir) {
  const violations = []

  function walk(currentDir) {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(item)) {
          walk(fullPath)
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item)
        if (INCLUDED_EXTENSIONS.includes(ext)) {
          const result = checkFileSize(fullPath)
          if (result.oversized) {
            violations.push({
              file: fullPath,
              lines: result.lines,
              excess: result.lines - MAX_LINES,
            })
          }
        }
      }
    }
  }

  walk(dir)
  return violations
}

function main() {
  console.log(`🔍 Checking program file sizes (max ${MAX_LINES} lines)...`)
  console.log(`📋 Checking extensions: ${INCLUDED_EXTENSIONS.join(', ')}`)
  console.log(
    `📁 Excluding documentation (.md, .txt, .rst) and config files (.json, .yaml)\n`
  )

  const violations = scanDirectory(process.cwd())

  if (violations.length === 0) {
    console.log('✅ All program files are within the size limit!')
    process.exit(0)
  } else {
    console.log(`❌ Found ${violations.length} oversized program file(s):\n`)

    violations.forEach(({ file, lines, excess }) => {
      console.log(
        `  ${file.replace(process.cwd(), '.')}: ${lines} lines (+${excess})`
      )
    })

    console.log(
      `\n💡 Consider refactoring these program files to stay under ${MAX_LINES} lines.`
    )
    console.log(
      `ℹ️  Documentation files (.md, .txt) are exempt from this limit.`
    )
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
