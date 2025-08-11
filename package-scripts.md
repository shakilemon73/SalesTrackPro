# Deployment Guide for দোকান হিসাব

## Direct Supabase + Vercel Deployment

Your app is now configured for **serverless deployment** with direct Supabase API calls.

### Features Maintained:
✅ **Full offline functionality** - Service worker caches Supabase API responses  
✅ **PWA capabilities** - Install on mobile, works offline  
✅ **Bengali language support** - Native Bangla throughout  
✅ **All business features** - Sales, inventory, customers, reports  

### Deployment Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Business management PWA with Supabase"
   git remote add origin YOUR_GITHUB_REPO
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to vercel.com and connect your GitHub repo
   - Set environment variables:
     ```
     VITE_SUPABASE_URL=https://lkhqdqlryjzalsemofdt.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Deploy automatically

### Benefits:
- **Global CDN** - Fast loading worldwide including Bangladesh
- **Free hosting** - No server costs for small businesses  
- **Auto-scaling** - Handles traffic spikes automatically
- **HTTPS by default** - Secure for business data

### Offline Features:
- Caches all data for offline viewing
- Queues failed requests when offline
- Syncs automatically when back online
- Works as installed mobile app