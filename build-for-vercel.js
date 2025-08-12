#!/usr/bin/env node

/**
 * Build script for deploying দোকান হিসাব to Vercel
 * This script prepares the React app for production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building দোকান হিসাব for Vercel deployment...\n');

try {
  // Step 1: Clean previous builds
  console.log('1️⃣  Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }
  if (fs.existsSync('client/dist')) {
    execSync('rm -rf client/dist', { stdio: 'inherit' });
  }

  // Step 2: Install dependencies
  console.log('2️⃣  Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Step 3: Build React app
  console.log('3️⃣  Building React application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 4: Verify build output
  console.log('4️⃣  Verifying build output...');
  const distPath = fs.existsSync('dist') ? 'dist' : 'client/dist';
  
  if (!fs.existsSync(distPath)) {
    throw new Error('Build output directory not found');
  }

  const buildFiles = fs.readdirSync(distPath);
  console.log(`   ✅ Build successful! Generated ${buildFiles.length} files in ${distPath}/`);
  
  // Step 5: Create vercel.json if it doesn't exist
  console.log('5️⃣  Configuring Vercel settings...');
  const vercelConfig = {
    "name": "dokan-hisab",
    "version": 2,
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/static-build",
        "config": {
          "distDir": distPath
        }
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/index.html"
      }
    ],
    "env": {
      "NODE_ENV": "production"
    }
  };

  if (!fs.existsSync('vercel.json')) {
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('   ✅ Created vercel.json configuration');
  }

  // Step 6: Display deployment instructions
  console.log('\n🚀 Build Complete! Ready for Vercel deployment\n');
  console.log('📋 Deployment Options:');
  console.log('');
  console.log('   Option 1 - Vercel CLI:');
  console.log('   npm install -g vercel');
  console.log('   vercel --prod');
  console.log('');
  console.log('   Option 2 - Vercel Dashboard:');
  console.log('   1. Push to GitHub');
  console.log('   2. Connect repository at vercel.com');
  console.log('   3. Deploy automatically');
  console.log('');
  console.log('   Option 3 - Manual Upload:');
  console.log(`   1. Upload ${distPath}/ folder to any web host`);
  console.log('   2. Configure as static site');
  console.log('');
  console.log('🎉 Your দোকান হিসাব app will be live and accessible worldwide!');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  console.error('\n🔧 Troubleshooting:');
  console.error('   1. Ensure Node.js is installed');
  console.error('   2. Run: npm install');
  console.error('   3. Check for any error messages above');
  process.exit(1);
}