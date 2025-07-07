const fs = require('fs');
const path = require('path');

// Check both possible Prisma client locations
const legacyPath = path.join(__dirname, '../node_modules/.prisma/client/index.js');
const modernPath = path.join(__dirname, '../node_modules/@prisma/client/index.js');

if (!fs.existsSync(legacyPath) && !fs.existsSync(modernPath)) {
  console.error('❌ Prisma client not found. Please run "prisma generate" first.');
  process.exit(1);
}

console.log('✅ Prisma client found and ready!'); 