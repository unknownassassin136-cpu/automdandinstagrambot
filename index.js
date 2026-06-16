// This file exists solely for Pterodactyl Panel compatibility 
// because some Pterodactyl Eggs have a strict 16-character limit on the MAIN_FILE setting.

const { execSync } = require('child_process');

try {
  console.log('🔄 [Pterodactyl Bypass] Installing backend dependencies directly...');
  // Force install only the backend workspace with production dependencies
  execSync('npx pnpm@9 install --filter backend --prod --no-frozen-lockfile', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully.');
} catch (err) {
  console.error('⚠️ Dependency installation failed (usually safe to ignore if dist is prebuilt). Continuing...');
}

require('./apps/backend/dist/server.js');
