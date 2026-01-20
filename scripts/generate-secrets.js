#!/usr/bin/env node

/**
 * Security Key Generator
 * Generates secure cryptographic keys for production use
 */

const crypto = require('crypto');

console.log('\n🔐 CHULBULI JEWELS - Security Key Generator\n');
console.log('=' .repeat(60));

// Generate JWT Secret (256-bit)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📌 JWT_SECRET (256-bit):\n');
console.log(jwtSecret);
console.log('\nLength:', jwtSecret.length, 'characters');

// Generate API Key (128-bit)
const apiKey = crypto.randomBytes(16).toString('hex');
console.log('\n📌 API_KEY (128-bit):\n');
console.log(apiKey);

// Generate Session Secret (256-bit)
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📌 SESSION_SECRET (256-bit):\n');
console.log(sessionSecret);

// Generate CSRF Secret (128-bit)
const csrfSecret = crypto.randomBytes(16).toString('hex');
console.log('\n📌 CSRF_SECRET (128-bit):\n');
console.log(csrfSecret);

console.log('\n' + '=' .repeat(60));
console.log('\n⚠️  SECURITY WARNINGS:\n');
console.log('1. Keep these secrets PRIVATE and SECURE');
console.log('2. NEVER commit these to version control');
console.log('3. Use DIFFERENT secrets for dev/staging/production');
console.log('4. Rotate secrets periodically (every 90 days recommended)');
console.log('5. Store in environment variables, not in code');
console.log('\n📋 Add to your .env file:\n');
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log(`API_KEY="${apiKey}"`);
console.log(`SESSION_SECRET="${sessionSecret}"`);
console.log(`CSRF_SECRET="${csrfSecret}"`);
console.log('\n✅ Keys generated successfully!\n');
