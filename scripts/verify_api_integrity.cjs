const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const apiDir = path.join(projectRoot, 'api');
const sqlFile = path.join(projectRoot, 'siddhivinayak_tours.sql');
const apiConfigFile = path.join(projectRoot, 'src', 'config', 'apiConfig.js');

console.log('=== RUNNING TECHNICAL AUDIT & INTEGRITY VERIFICATION ===\n');

// 1. Verify SQL File Exists and Contains Core Schema
if (!fs.existsSync(sqlFile)) {
  console.error('[FAIL] siddhivinayak_tours.sql not found!');
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFile, 'utf8');
const requiredTables = [
  'users',
  'otp_verifications',
  'cities',
  'vehicles',
  'bookings',
  'payments',
  'reviews',
  'offers',
  'tour_packages',
  'contact_messages',
  'vendors',
  'drivers',
  'guides',
  'accounting_ledger',
  'system_settings'
];

let missingTables = [];
requiredTables.forEach(tbl => {
  if (!sqlContent.includes(`CREATE TABLE \`${tbl}\``)) {
    missingTables.push(tbl);
  }
});

if (missingTables.length > 0) {
  console.error(`[FAIL] SQL Schema is missing table definitions: ${missingTables.join(', ')}`);
  process.exit(1);
} else {
  console.log(`[PASS] SQL Schema verified: All ${requiredTables.length} core tables present in siddhivinayak_tours.sql.`);
}

// 2. Verify all API endpoints in apiConfig.js match actual PHP files
const apiConfigContent = fs.readFileSync(apiConfigFile, 'utf8');
const endpointRegex = /([A-Z_]+):\s*`\${API_BASE_URL}\/([^`]+)`/g;
let match;
let totalEndpoints = 0;
let missingEndpoints = 0;

while ((match = endpointRegex.exec(apiConfigContent)) !== null) {
  totalEndpoints++;
  const [_, key, relativePath] = match;
  const targetFile = path.join(apiDir, relativePath);
  if (fs.existsSync(targetFile)) {
    console.log(`[PASS] Endpoint ${key} -> api/${relativePath} exists.`);
  } else {
    console.error(`[FAIL] Endpoint ${key} -> api/${relativePath} DOES NOT EXIST!`);
    missingEndpoints++;
  }
}

console.log(`\nEndpoint Mapping Verified: ${totalEndpoints - missingEndpoints}/${totalEndpoints} endpoints exist.`);
if (missingEndpoints > 0) {
  process.exit(1);
}

// 3. Verify Vite config proxy
const viteConfigFile = path.join(projectRoot, 'vite.config.js');
const viteContent = fs.readFileSync(viteConfigFile, 'utf8');
if (viteContent.includes('/api') && viteContent.includes('http://localhost')) {
  console.log('[PASS] Vite proxy configured for /api -> XAMPP Apache backend.');
} else {
  console.warn('[WARNING] Vite proxy may need check in vite.config.js.');
}

console.log('\nAll Integrity Checks Passed!');
process.exit(0);
