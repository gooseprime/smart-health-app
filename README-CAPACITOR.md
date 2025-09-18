# Capacitor Native App Setup

Your Smart Health Monitor app is now configured with Capacitor for native mobile functionality! Here's what has been set up and how to use it.

## 🚀 What's Been Configured

### ✅ Core Setup
- **Capacitor Core**: Installed and configured
- **Android Platform**: Added and synced
- **Native Plugins**: Essential plugins for device features
- **Development Server**: Configured to work with Next.js dev server

### 📱 Available Native Features

The following native capabilities are now available through `lib/capacitor.ts`:

#### 📸 Camera & Photos
```typescript
import NativeFeatures from '@/lib/capacitor'

// Take a photo with camera
const photo = await NativeFeatures.takePhoto()

// Select from photo gallery
const photo = await NativeFeatures.selectPhoto()
```

#### 💾 File System
```typescript
// Save data to device
await NativeFeatures.saveFile('report.json', JSON.stringify(reportData))

// Read data from device
const data = await NativeFeatures.readFile('report.json')
```

#### ⚙️ Preferences (Secure Storage)
```typescript
// Store data persistently
await NativeFeatures.setPreference('user_token', 'abc123')

// Retrieve stored data
const token = await NativeFeatures.getPreference('user_token')

// Remove stored data
await NativeFeatures.removePreference('user_token')
```

#### 📱 Device Information
```typescript
// Get device details
const deviceInfo = await NativeFeatures.getDeviceInfo()
console.log(deviceInfo.platform) // 'android' | 'ios'
console.log(deviceInfo.model)    // Device model
console.log(deviceInfo.osVersion) // OS version
```

#### 🌐 Network Status
```typescript
// Check network connection
const network = await NativeFeatures.getNetworkStatus()
console.log(network.connected)     // true/false
console.log(network.connectionType) // 'wifi' | 'cellular' | 'none'

// Listen for network changes
setupNetworkListener((status) => {
  console.log('Network changed:', status)
})
```

#### 🎨 Splash Screen
```typescript
// Control splash screen
await NativeFeatures.hideSplashScreen()
await NativeFeatures.showSplashScreen()
```

## 🛠️ Development Workflow

### Running in Development
1. **Start Next.js dev server** (already running on port 3001):
   ```bash
   pnpm dev
   ```

2. **Sync Capacitor** (when you make changes):
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

### Building for Production

#### Android APK
```bash
# Build the web app
pnpm build

# Sync with native platform
npx cap sync android

# Build APK (requires Android SDK)
cd android
.\gradlew.bat assembleDebug
```

The APK will be available at: `android/app/build/outputs/apk/debug/app-debug.apk`

## 🔧 Native Development Setup

### Android Development
To build and run on Android devices/emulators:

1. **Install Android Studio** from [developer.android.com](https://developer.android.com/studio)

2. **Set up Android SDK**:
   - Install Android SDK through Android Studio
   - Set `ANDROID_HOME` environment variable
   - Add platform-tools to your PATH

3. **Enable USB Debugging** on your Android device

4. **Run on device**:
   ```bash
   npx cap run android
   ```

### Environment Variables
Create a `local.properties` file in the `android/` directory:
```properties
sdk.dir=C:\\Users\\YourUser\\AppData\\Local\\Android\\Sdk
```

## 📋 Next Steps

### 🔒 Security & Permissions
Add these permissions to `android/app/src/main/AndroidManifest.xml`:
```xml
<!-- Camera -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>

<!-- Network -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 🎨 App Icons & Splash
- Replace icons in `android/app/src/main/res/mipmap-*`
- Customize splash screen in `android/app/src/main/res/drawable/`

### 🚀 Deployment
- **Google Play Store**: Follow [Capacitor deployment guide](https://capacitorjs.com/docs/android/deploying-to-google-play-store)
- **Enterprise Distribution**: Use APK files directly

## 🆘 Troubleshooting

### Common Issues
1. **Android SDK not found**: Set `ANDROID_HOME` environment variable
2. **Build fails**: Run `npx cap sync android` after plugin changes
3. **Dev server not connecting**: Ensure Next.js is running on port 3001

### Getting Help
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Community](https://github.com/capacitor-community)
- [Ionic Forums](https://forum.ionicframework.com/)

## 🎯 Integration Example

Here's how to integrate native features into your health app:

```typescript
// In your report submission component
import NativeFeatures from '@/lib/capacitor'

async function submitReport() {
  // Check network status
  const network = await NativeFeatures.getNetworkStatus()
  if (!network.connected) {
    alert('No internet connection. Report will be saved locally.')
  }
  
  // Get device info for report metadata
  const deviceInfo = await NativeFeatures.getDeviceInfo()
  
  // Take photo of symptoms if needed
  const photo = await NativeFeatures.takePhoto()
  
  // Save report locally
  await NativeFeatures.saveFile(`report_${Date.now()}.json`, JSON.stringify({
    ...reportData,
    deviceInfo,
    photo,
    timestamp: new Date().toISOString()
  }))
}
```

Your Smart Health Monitor app is now ready for native mobile deployment with full device capabilities! 🎉