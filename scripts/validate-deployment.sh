#!/bin/bash
# Validation script for the CI/CD deployment

set -e

echo "🔍 Validating deployment configuration..."

# Check if required files exist
echo "✅ Checking required files..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi

if [ ! -f "vite.config.ts" ]; then
    echo "❌ vite.config.ts not found"
    exit 1
fi

if [ ! -f ".github/workflows/azure-static-web-apps.yml" ]; then
    echo "❌ GitHub Actions workflow not found"
    exit 1
fi

if [ ! -f "public/staticwebapp.config.json" ]; then
    echo "❌ staticwebapp.config.json not found in public directory"
    exit 1
fi

echo "✅ Installing dependencies..."
npm ci --silent

echo "✅ Building application..."
npm run build

echo "✅ Checking build output..."
if [ ! -d "dist" ]; then
    echo "❌ dist directory not created"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ index.html not found in dist"
    exit 1
fi

if [ ! -f "dist/staticwebapp.config.json" ]; then
    echo "❌ staticwebapp.config.json not copied to dist"
    exit 1
fi

echo "✅ Checking for JavaScript bundles..."
if [ ! -d "dist/assets" ] || [ -z "$(ls -A dist/assets/*.js 2>/dev/null)" ]; then
    echo "❌ JavaScript bundles not found"
    exit 1
fi

echo "✅ Checking for CSS files..."
if [ -z "$(ls -A dist/assets/*.css 2>/dev/null)" ]; then
    echo "❌ CSS files not found"
    exit 1
fi

echo "🎉 All validation checks passed!"
echo "📦 Ready for deployment to Azure Static Web Apps"