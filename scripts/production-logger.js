#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Production Build Logger Cleanup
 * Removes console.log calls from Logger.ts for production builds
 */

const fs = require('fs');
const path = require('path');

const LOGGER_PATH = path.join(__dirname, '..', 'src', 'utils', 'Logger.ts');

console.log('🔧 Disabling console.log in production build...');

try {
  let content = fs.readFileSync(LOGGER_PATH, 'utf8');
  
  // Comment out console.log lines but preserve logic
  content = content.replace(
    /(\s+)(console\.log\()/g,
    '$1// PRODUCTION: Disabled for security $1// $2'
  );
  
  fs.writeFileSync(LOGGER_PATH, content, 'utf8');
  console.log('✓ Production logger configured');
} catch (error) {
  console.error('✗ Failed to configure logger:', error.message);
  process.exit(1);
}
