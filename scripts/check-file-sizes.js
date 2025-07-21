#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const MAX_LINES = 400
const EXCLUDED_DIRS = ['node_modules', '.next', '.git', 'dist', 'out']
const INCLUDED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

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
  console.log(`🔍 Checking file sizes (max ${MAX_LINES} lines)...\n`)

  const violations = scanDirectory(process.cwd())

  if (violations.length === 0) {
    console.log('✅ All files are within the size limit!')
    process.exit(0)
  } else {
    console.log(`❌ Found ${violations.length} oversized file(s):\n`)

    violations.forEach(({ file, lines, excess }) => {
      console.log(
        `  ${file.replace(process.cwd(), '.')}: ${lines} lines (+${excess})`
      )
    })

    console.log(
      `\n💡 Consider refactoring these files to stay under ${MAX_LINES} lines.`
    )
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
