# 🛠️ VS Code Setup for দোকান হিসাব Android Development

## ✅ Complete VS Code Android Development Guide

Your Bengali business management app can be fully developed and built using VS Code with the right extensions and setup.

## 📦 Required VS Code Extensions

### **Essential Extensions:**
1. **Android iOS Emulator** - Run Android emulators
2. **Android Full Support** - Complete Android development support
3. **Gradle for Java** - Gradle build system support
4. **Extension Pack for Java** - Java development tools
5. **APKLab** - APK analysis and building

### **Recommended Extensions:**
- **Git Graph** - Visual git management
- **Prettier** - Code formatting for your React code
- **ES7+ React/Redux/React-Native snippets** - React development
- **Bracket Pair Colorizer** - Better code readability

## 🚀 VS Code Setup Steps

### **1. Install Required Tools:**
```bash
# Android SDK (if not already installed)
# Download from: https://developer.android.com/studio#command-tools

# Java JDK 11 (required for Android)
sudo apt install openjdk-11-jdk

# Gradle (usually comes with Android project)
# Will be available in android/gradlew
```

### **2. Configure Environment Variables:**
Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
```

### **3. Open Project in VS Code:**
```bash
# Download your complete project from Replit
# Extract to local directory
cd /path/to/your/dokan-hisab-project

# Open in VS Code
code .
```

## 🏗️ Building in VS Code

### **Method 1: Integrated Terminal**
```bash
# Install dependencies
npm install

# Sync Capacitor
npx cap sync android

# Build Android APK
cd android
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### **Method 2: VS Code Tasks**
Create `.vscode/tasks.json`:
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Build Android Debug",
            "type": "shell",
            "command": "./gradlew",
            "args": ["assembleDebug"],
            "options": {
                "cwd": "${workspaceFolder}/android"
            },
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Clean Android Build",
            "type": "shell",
            "command": "./gradlew",
            "args": ["clean"],
            "options": {
                "cwd": "${workspaceFolder}/android"
            },
            "group": "build"
        },
        {
            "label": "Sync Capacitor",
            "type": "shell",
            "command": "npx",
            "args": ["cap", "sync", "android"],
            "group": "build"
        }
    ]
}
```

## 📱 Testing & Debugging

### **Run on Android Emulator:**
```bash
# Create emulator (one-time setup)
avdmanager create avd -n Pixel_API_30 -k "system-images;android-30;google_apis;x86_64"

# Start emulator
emulator -avd Pixel_API_30

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### **Run on Physical Device:**
```bash
# Enable USB debugging on your Android device
# Connect via USB

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🎯 VS Code Workflow

### **Daily Development:**
1. **Edit React Code** - Work on your Bengali business features
2. **Build Web App** - `npm run build`
3. **Sync to Android** - `npx cap sync android`
4. **Build APK** - `cd android && ./gradlew assembleDebug`
5. **Test on Device** - Install and test APK

### **VS Code Shortcuts:**
- `Ctrl+Shift+P` - Command palette
- `Ctrl+`` ` - Toggle terminal
- `Ctrl+Shift+Y` - Toggle debug console
- `F5` - Start debugging (if configured)

## 🛠️ Advanced VS Code Features

### **1. Debugging Configuration:**
Create `.vscode/launch.json` for debugging:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Chrome",
            "request": "launch",
            "type": "chrome",
            "url": "http://localhost:5000",
            "webRoot": "${workspaceFolder}/client/src"
        }
    ]
}
```

### **2. Settings for Android Development:**
Create `.vscode/settings.json`:
```json
{
    "java.home": "/usr/lib/jvm/java-11-openjdk-amd64",
    "android.sdk.path": "/home/username/Android/Sdk",
    "files.exclude": {
        "**/node_modules": true,
        "**/android/build": true,
        "**/android/.gradle": true
    }
}
```

## 📋 Build Commands Summary

### **Quick Commands:**
```bash
# Full build process
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug

# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View connected devices
adb devices
```

## 🎉 Advantages of VS Code for Your Project

### **Benefits:**
- **Lightweight** - Faster than Android Studio for code editing
- **Integrated Terminal** - Run all commands in one place
- **Git Integration** - Built-in version control
- **Extensions** - Massive ecosystem of helpful tools
- **Cross-platform** - Works on Windows, Mac, Linux
- **React Support** - Excellent for your web app development

### **Perfect for:**
- Editing React/TypeScript code
- Running build commands
- Git version control
- APK building and testing
- Code formatting and linting

## 🚀 Getting Started

1. **Download VS Code** from https://code.visualstudio.com/
2. **Install the Android extensions** listed above
3. **Download your project** from Replit
4. **Follow the setup steps** in this guide
5. **Start building** your দোকান হিসাব Android app!

VS Code provides a perfect development environment for your Bengali business management app!