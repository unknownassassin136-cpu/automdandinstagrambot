// This file exists solely for Pterodactyl Panel compatibility 
// because some Pterodactyl Eggs have a strict 16-character limit on the MAIN_FILE setting.

const { execSync } = require('child_process');

try {
  console.log('🔄 [Pterodactyl Bypass] Installing backend dependencies directly...');
  // Force install only the backend workspace with production dependencies
  execSync('npx --yes pnpm@9 install --filter backend --no-frozen-lockfile', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully.');
} catch (err) {
  console.error('⚠️ Dependency installation failed (usually safe to ignore if dist is prebuilt). Continuing...');
}
try {
  console.log('🔄 [Pterodactyl] Building backend before starting...');
  execSync('npx --yes pnpm@9 --filter backend run build', { stdio: 'inherit' });
} catch (err) {
  console.error('⚠️ Build failed. Continuing...');
}

require('./apps/backend/dist/server.js');
