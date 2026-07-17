/* ============================================
   CineVault — Catalog Sync Script
   Helper script to copy local JSON updates and push to GitHub
   ============================================ */

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FILES = ['movies.json', 'collections.json', 'settings.json'];
const SRC_DIR = join(__dirname, 'data');
const DEST_DIR = join(__dirname, 'public', 'data');

console.log('🎬 Syncing CineVault Catalog files...');

// Ensure public/data exists
if (!existsSync(DEST_DIR)) {
  mkdirSync(DEST_DIR, { recursive: true });
}

// Copy JSON files
for (const file of FILES) {
  const src = join(SRC_DIR, file);
  const dest = join(DEST_DIR, file);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`✓ Copied ${file} to public folder.`);
  }
}

// Git automation
try {
  console.log('🚀 Pushing updates to GitHub...');
  
  execSync('git add .', { stdio: 'inherit' });
  
  // Try to commit, catch if nothing changed
  try {
    execSync('git commit -m "chore: Sync movie catalog update"', { stdio: 'inherit' });
  } catch (e) {
    console.log('ℹ No catalog updates to commit.');
  }

  execSync('git push origin main', { stdio: 'inherit' });
  console.log('\n🎉 Catalog successfully synced and pushed to GitHub! Netlify will update your live site shortly.');
} catch (error) {
  console.error('\n❌ Git push failed. Please verify your connection or git credentials.');
}
