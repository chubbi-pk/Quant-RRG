#!/bin/bash

# RRG Dashboard Diagnostic Script
# Run this to check for common setup issues

echo "🔍 RRG Dashboard Diagnostic Check"
echo "=================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "  Node.js: $NODE_VERSION"
else
    echo "  ❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "  npm: $NPM_VERSION"
else
    echo "  ❌ npm not found"
    exit 1
fi

# Check directory structure
echo ""
echo "✓ Checking directory structure..."

REQUIRED_DIRS=("components" "services")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir/ exists"
    else
        echo "  ❌ $dir/ missing - Create it!"
    fi
done

# Check required files
echo ""
echo "✓ Checking required files..."

REQUIRED_FILES=(
    "components/RRGChart.tsx"
    "services/dataService.ts"
    "services/geminiService.ts"
    "App.tsx"
    "types.ts"
    "constants.tsx"
    "index.tsx"
    "index.html"
    "package.json"
    "vite.config.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file missing"
    fi
done

# Check .env file
echo ""
echo "✓ Checking environment configuration..."
if [ -f ".env" ]; then
    echo "  ✅ .env file exists"
    if grep -q "VITE_GEMINI_API_KEY=" .env; then
        if grep -q "VITE_GEMINI_API_KEY=your_api_key_here" .env; then
            echo "  ⚠️  .env file has placeholder - update with real API key"
        else
            echo "  ✅ VITE_GEMINI_API_KEY is set"
        fi
    else
        echo "  ❌ VITE_GEMINI_API_KEY not found in .env"
    fi
else
    echo "  ⚠️  .env file missing (copy from .env.example)"
fi

# Check node_modules
echo ""
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules exists"
else
    echo "  ❌ node_modules missing - Run: npm install"
fi

# Check package.json dependencies
if [ -f "package.json" ]; then
    echo ""
    echo "✓ Checking package.json..."
    
    REQUIRED_DEPS=("react" "react-dom" "d3" "@google/genai")
    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            echo "  ✅ $dep listed"
        else
            echo "  ❌ $dep missing from dependencies"
        fi
    done
fi

# Check vite.config.ts
echo ""
echo "✓ Checking vite.config.ts..."
if [ -f "vite.config.ts" ]; then
    if grep -q "base:" vite.config.ts; then
        BASE_PATH=$(grep "base:" vite.config.ts | sed -n "s/.*base: ['\"]\\([^'\"]*\\).*/\\1/p")
        echo "  Base path: $BASE_PATH"
        if [ "$BASE_PATH" = "/" ] || [ "$BASE_PATH" = "./" ]; then
            echo "  ⚠️  Using root path - OK for custom domain, update for GitHub Pages"
        else
            echo "  ✅ Custom base path set for GitHub Pages"
        fi
    fi
fi

echo ""
echo "=================================="
echo "📋 Summary"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Fix any ❌ issues above"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo "4. Check http://localhost:3000"
echo ""
echo "For deployment:"
echo "1. Update base path in vite.config.ts"
echo "2. Add VITE_GEMINI_API_KEY to GitHub secrets"
echo "3. Push to GitHub"
echo ""
