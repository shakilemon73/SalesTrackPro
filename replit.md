# Dokan Hisab - Offline-First Business Management App

## Project Overview
A comprehensive mobile-first business management application tailored for Bengali entrepreneurs, enabling efficient customer and sales tracking with robust offline-first functionality.

## Recent Changes (August 14, 2025)

### Major Architecture Update: Full Offline Functionality Implementation

**Completed Features:**
- ✅ **Service Worker Implementation**: Complete PWA service worker with cache-first strategies
- ✅ **IndexedDB Storage**: Enhanced offline storage with full CRUD operations  
- ✅ **Offline-First Data Hooks**: React hooks that work seamlessly online/offline
- ✅ **Automatic Sync Manager**: Background sync when connection returns
- ✅ **Network Status Detection**: Real-time online/offline status monitoring
- ✅ **Offline Status UI**: Visual indicators and sync progress display
- ✅ **Demo Page**: Interactive demonstration of offline capabilities

**Technical Implementation:**
- Service Worker (`client/public/sw.js`) with comprehensive caching strategies
- Enhanced OfflineStorageManager with IndexedDB for local data persistence
- Offline-first React hooks in `client/src/hooks/use-offline-data.tsx`
- Network-aware mutations that work offline and sync when online
- Visual offline status component with sync progress indicators

**Key Files Created/Modified:**
- `client/public/sw.js` - Service worker for offline functionality
- `client/public/offline.html` - Offline fallback page
- `client/src/hooks/use-offline-data.tsx` - Offline-first data hooks
- `client/src/components/ui/offline-status.tsx` - Network status component
- `client/src/pages/dashboard-offline-demo.tsx` - Interactive offline demo
- `client/src/lib/offline-storage.ts` - Enhanced with new methods
- `client/src/App.tsx` - Integration of offline status bar
- `client/index.html` - Service worker registration enabled

## Key Technologies
- **Frontend**: React with TypeScript, Tailwind CSS for responsive design
- **Backend**: Supabase for backend and authentication
- **Offline**: Service Worker + IndexedDB for full offline capability
- **State Management**: TanStack Query with offline persistence
- **PWA**: Complete Progressive Web App with manifest and service worker
- **Language**: Bengali (বাংলা) localization throughout

## Project Architecture

### Offline-First Strategy
The application now implements a comprehensive offline-first approach:

1. **Data Layer**: All API calls fallback to local IndexedDB storage
2. **Mutation Layer**: Create/Update operations work offline and sync later
3. **UI Layer**: Network status indicators and offline mode notifications
4. **Background Sync**: Automatic synchronization when connectivity returns

### Data Flow (Offline-First)
```
User Action → Offline Hook → 
├─ Online: Try Supabase → Success: Update Cache + Local Storage
├─ Online: Try Supabase → Fail: Use Local Storage + Queue for Sync
└─ Offline: Use Local Storage + Queue for Sync
```

## User Preferences
- **Language**: Bengali (বাংলা) - All UI text in Bengali
- **Target Users**: Small business owners and entrepreneurs in Bangladesh
- **Mobile-First**: Optimized for mobile devices and touch interfaces
- **Offline-First**: Full functionality works without internet connection
- **Sync Strategy**: Background sync with visual progress indicators

## Development Guidelines
- Always prioritize offline functionality over online-only features
- Use Bengali text for all user-facing strings
- Implement mobile-first responsive design patterns
- Ensure all data operations have offline fallbacks
- Display clear network status and sync progress to users
- Test offline functionality by disabling network in browser dev tools

## Testing Offline Functionality
To test the offline capabilities:
1. Open browser developer tools (F12)
2. Go to Network tab and check "Offline"  
3. Try creating customers, sales, expenses
4. All operations should work normally
5. Enable network - data should sync automatically

## Current Status
The application is now fully functional offline. All core business operations (customers, sales, expenses) work seamlessly without internet connection and automatically sync when connectivity returns.

## Next Steps
- User acceptance testing of offline functionality
- Performance optimization for large offline datasets
- Advanced conflict resolution for concurrent edits
- Offline-to-offline device synchronization via QR codes or Bluetooth