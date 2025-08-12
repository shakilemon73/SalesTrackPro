#!/usr/bin/env node

/**
 * Build script for Vercel deployment
 * This script builds the client app and moves the output to the correct location
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Building for Vercel deployment...');

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync('./dist')) {
    fs.rmSync('./dist', { recursive: true, force: true });
  }
  if (fs.existsSync('./client/dist')) {
    fs.rmSync('./client/dist', { recursive: true, force: true });
  }

  // Build the client app
  console.log('🔨 Building client app...');
  process.chdir('./client');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Go back to root
  process.chdir('..');
  
  // The build output is in ./dist/public/ due to vite.config.ts
  // We need to move it to the root ./dist/ for Vercel
  console.log('📦 Moving build output for Vercel...');
  
  if (fs.existsSync('./dist/public')) {
    // Copy files from dist/public to dist
    const publicPath = './dist/public';
    const targetPath = './dist';
    
    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
    
    // Copy all files from dist/public to dist
    const files = fs.readdirSync(publicPath);
    files.forEach(file => {
      const srcPath = path.join(publicPath, file);
      const destPath = path.join(targetPath, file);
      
      if (fs.lstatSync(srcPath).isDirectory()) {
        // Copy directory recursively
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
      }
    });
    
    // Remove the public directory
    fs.rmSync('./dist/public', { recursive: true, force: true });
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Output directory: ./dist/');
  
  // List the contents of the dist directory
  if (fs.existsSync('./dist')) {
    console.log('📋 Build output contents:');
    const files = fs.readdirSync('./dist');
    files.forEach(file => {
      console.log(`  - ${file}`);
    });
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}