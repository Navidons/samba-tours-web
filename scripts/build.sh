#!/bin/bash

# Exit on any error
set -e

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🔍 Verifying Prisma client..."
node scripts/verify-prisma.js

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!" 