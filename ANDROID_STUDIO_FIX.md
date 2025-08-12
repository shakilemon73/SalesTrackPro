# 🔧 Android Studio Dependency Fix

Your **দোকান হিসাব (Dokan Hisab)** Android project is ready! Here's how to fix the Capacitor dependency issue you're seeing:

## Error You're Seeing:
```
Failed to resolve: project :capacitor-android
Using flatDir should be avoided because it doesn't support any meta-data formats.
```

## ✅ Complete Fix Steps:

### Step 1: Download Project Files Correctly
1. **Download ALL project files** from Replit (not just the android folder)
2. **Extract the complete project** to your local machine
3. **Ensure node_modules folder** is included in the download

### Step 2: In Android Studio
1. **Open ONLY the `android` folder** in Android Studio
2. **Wait for initial sync to fail** (this is expected)
3. **Close Android Studio**

### Step 3: Terminal Commands (Run from project root)
```bash
# Navigate to your project root directory (where package.json is)
cd /path/to/your/dokan-hisab-project

# Install dependencies 
npm install

# Clean and rebuild Android
npx cap sync android

# Now open Android Studio again
```

### Step 4: Open in Android Studio Again
1. **Open the `android` folder** in Android Studio
2. **Wait for Gradle sync** (should work now)
3. **Build → Build Bundle(s)/APK(s) → Build APK(s)**

## 🚨 Alternative: Quick Fix

If you still see dependency issues, try this:

### Option A: Use the ZIP Download
1. **Download as ZIP** from Replit
2. **Extract everything** 
3. **Follow steps above**

### Option B: Manual Dependency Fix
If node_modules is missing:
```bash
# In your project root
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap sync android
```

### Option C: Use GitHub (Recommended)
1. **Push project to GitHub** from Replit
2. **Clone locally**: `git clone your-repo-url`
3. **Install dependencies**: `npm install`
4. **Sync Capacitor**: `npx cap sync android`
5. **Open android folder** in Android Studio

## 📱 Why This Happens:
- Capacitor needs the `node_modules` folder to resolve dependencies
- Android Studio only sees the android folder, not the parent project
- The sync command links the dependencies properly

## ✅ Expected Result:
After following these steps, you should see:
- ✅ No dependency errors
- ✅ Successful Gradle sync
- ✅ Ability to build APK
- ✅ APK file at: `android/app/build/outputs/apk/debug/app-debug.apk`

Your Bengali business management app will be ready to install on Android devices!

## 📞 Still Having Issues?
The project structure is correct. The main requirement is ensuring the complete project (including node_modules) is available when running the Capacitor sync command.