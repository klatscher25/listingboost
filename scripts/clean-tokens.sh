#!/bin/bash
# Token cleanup script for ListingBoost

echo "🔍 Searching for API tokens..."

# Find all files with potential tokens
REAL_TOKEN="apify_api_EXAMPLE_TOKEN_TO_REPLACE"
PLACEHOLDER="YOUR_TOKEN_HERE"

# List of files to clean
FILES_WITH_TOKENS=$(grep -r -l "$REAL_TOKEN" . --include="*.js" --include="*.json" --include="*.md" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .git)

if [ -z "$FILES_WITH_TOKENS" ]; then
    echo "✅ No tokens found!"
    exit 0
fi

echo "📝 Files with tokens:"
echo "$FILES_WITH_TOKENS"
echo ""

# Replace tokens in each file
for file in $FILES_WITH_TOKENS; do
    echo "🔧 Cleaning $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Replace token
    sed -i.tmp "s/$REAL_TOKEN/$PLACEHOLDER/g" "$file"
    rm "$file.tmp" 2>/dev/null || true
    
    # Verify replacement
    if grep -q "$REAL_TOKEN" "$file"; then
        echo "❌ Failed to clean $file"
        mv "$file.backup" "$file"
    else
        echo "✅ Cleaned $file"
        rm "$file.backup"
    fi
done

echo ""
echo "🔍 Verification - remaining tokens:"
REMAINING=$(grep -r "$REAL_TOKEN" . --include="*.js" --include="*.json" --include="*.md" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .git | wc -l)
echo "Count: $REMAINING"

if [ "$REMAINING" -eq 0 ]; then
    echo "✅ All tokens successfully anonymized!"
else
    echo "❌ Some tokens remain - manual review needed"
    grep -r "$REAL_TOKEN" . --include="*.js" --include="*.json" --include="*.md" --include="*.ts" 2>/dev/null | grep -v node_modules | grep -v .git
fi