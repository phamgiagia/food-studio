#!/usr/bin/env node
/**
 * Seed Script — Food Studio Demo Data
 *
 * Apply seed data migration vào D1 database.
 *
 * Cách dùng:
 *   node scripts/seed.js            (local)
 *   node scripts/seed.js --remote   (production)
 */

const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const envFlag = isRemote ? '' : '--local';

console.log(`🌱 Food Studio — Seeding demo data (${isRemote ? 'REMOTE' : 'LOCAL'})...\n`);

// Show file path
const seedFile = path.join(__dirname, '..', 'backend', 'src', 'db', 'migrations', '0002_seed_data.sql');
console.log(`📄 File seed data: ${seedFile}\n`);

// Instructions
console.log('📋 Apply migration:');
console.log(`   cd backend && wrangler d1 migrations apply food-studio-db-prod ${envFlag}\n`);

console.log('📋 Test accounts (password123 for all):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Admin:     admin@foodstudio.vn');
console.log('  Seller:    tam@bancotam.vn');
console.log('  Customer:  lan.nguyen@gmail.com');
console.log('  Customer:  minh.tran@yahoo.com');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ Seed ready! Wen wrangler D1 IDs are configured, run the command above.');