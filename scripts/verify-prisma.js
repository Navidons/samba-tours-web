const fs = require('fs');
const path = require('path');

// Check if Prisma client exists
const prismaClientPath = path.join(__dirname, '../node_modules/.prisma/client/index.js');

if (!fs.existsSync(prismaClientPath)) {
  console.error('❌ Prisma client not found. Please run "prisma generate" first.');
  process.exit(1);
}

console.log('✅ Prisma client found and ready!'); 