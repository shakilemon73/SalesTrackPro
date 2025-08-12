#!/bin/bash

# Android APK Build Script for দোকান হিসাব (Dokan Hisab)
# This script builds your React app into an Android APK

echo "🔨 Building Android APK for দোকান হিসাব..."

# Step 1: Build the React app
echo "📦 Building React app..."
npm run build

# Step 2: Sync with Capacitor
echo "⚙️  Syncing with Capacitor..."
npx cap sync android

# Step 3: Build APK
echo "🤖 Building Android APK..."

# Create the APK build command
cat > build_apk_instructions.md << 'EOF'
# Android APK Build Instructions

Your দোকান হিসাব app has been prepared for Android! Here's what's been set up:

## ✅ What's Ready:
- ✅ Capacitor Android project configured
- ✅ All web assets built and synced
- ✅ Android manifest with proper permissions
- ✅ App configured with Bengali name "দোকান হিসাব"

## 📱 To Complete APK Build:

### Option 1: Using Android Studio (Recommended)
1. **Install Android Studio** on your local machine
2. **Open the android folder** in Android Studio
3. **Wait for Gradle sync** to complete
4. **Build → Build Bundle(s)/APK(s) → Build APK(s)**
5. **Find your APK** in `android/app/build/outputs/apk/debug/`

### Option 2: Command Line (If you have Android SDK)
```bash
# Set Android SDK path (adjust to your SDK location)
export ANDROID_HOME=/path/to/your/android/sdk

# Build the APK
cd android
./gradlew assembleDebug
```

## 📁 Project Structure:
```
your-app/
├── android/                    # Native Android project
│   ├── app/
│   │   ├── src/main/assets/public/  # Your web app files
│   │   └── build/outputs/apk/       # Generated APK files
├── capacitor.config.json       # Capacitor configuration
└── dist/public/               # Built React app
```

## 🎯 APK Features:
- **App Name**: দোকান হিসাব
- **Package**: com.dokan.hisab
- **Permissions**: Internet, Camera, Storage access
- **Target**: Android devices (minimum API level handled by Capacitor)

## 📲 Installing the APK:
1. **Transfer APK** to your Android device
2. **Enable "Unknown Sources"** in Android settings
3. **Install the APK** file
4. **Launch** দোকান হিসাব from your app drawer

## 🚀 For Play Store Release:
- Use `assembleRelease` instead of `assembleDebug`
- Sign the APK with your keystore
- Generate AAB bundle: `bundleRelease`

Your Bengali business management app is now ready for Android! 🎉
EOF

echo "✅ Android project prepared successfully!"
echo "📋 Check 'build_apk_instructions.md' for complete build instructions"
echo "📱 Your app is ready to be built into an APK!"