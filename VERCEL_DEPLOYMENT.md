# Vercel Deployment Guide

## Quick Deployment Steps

### Option 1: Dashboard Deployment (Recommended)

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project" and connect your Git repository

2. **Configure Build Settings**
   - **Root Directory**: Set to `client`
   - **Framework Preset**: Select "Vite" 
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables** (if using Supabase)
   - Add `VITE_SUPABASE_URL` with your Supabase project URL
   - Add `VITE_SUPABASE_ANON_KEY` with your Supabase anon key

4. **Deploy**
   - Click "Deploy" - Vercel will automatically deploy on every git push

### Option 2: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# From your project root directory
vercel --prod
```

## Project Structure

Your app structure is:
```
project-root/
├── client/                 # React/Vite app (set as Root Directory in Vercel)
│   ├── src/
│   ├── public/
│   │   ├── manifest.json
│   │   └── sw.js
│   ├── index.html
│   └── dist/              # Build output (automatically created)
├── vercel.json            # Configuration file
└── vite.config.ts         # Vite configuration
```

## Configuration Files

### vercel.json (Already Updated)
- Handles SPA routing with rewrites
- Configures headers for PWA files (service worker, manifest)
- Sets security headers

### Key Features Supported
- ✅ Progressive Web App (PWA)
- ✅ Bengali language support
- ✅ Offline functionality
- ✅ Client-side routing
- ✅ Service worker caching
- ✅ Mobile-first responsive design

## Troubleshooting

### Common Issues

1. **404 on Direct URL Access**
   - Fixed by the `rewrites` rule in vercel.json

2. **Service Worker Not Loading**
   - Handled by proper headers in vercel.json

3. **Build Fails**
   - Ensure Root Directory is set to `client`
   - Check that all dependencies are in package.json

### Build Output
Your build creates files in `client/dist/` which Vercel automatically serves.

## Post-Deployment

After successful deployment:
1. Test the app on the provided Vercel URL
2. Verify PWA installation works
3. Test offline functionality
4. Check Bengali text rendering

## Notes

- The app works offline-first, so it will function even without Supabase credentials
- All Bengali business features are preserved
- PWA installation will work on mobile devices
- The service worker enables offline functionality