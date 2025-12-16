# 🚀 Quick Start Guide - Moonifest Mobile

## Prerequisites

Make sure you have these installed before running the app:

### Required:
- ✅ Node.js v20.17.0+ (you have v20.17.0)
- ✅ npm (installed with Node)
- ✅ Expo CLI (`npm install -g expo-cli`)

### For Android Testing:
- ☑️ Android Studio
- ☑️ Android SDK
- ☑️ Java Development Kit (JDK)
- ☑️ Android Emulator (configured in Android Studio)

### For iOS Testing (Mac only):
- ☑️ Xcode
- ☑️ iOS Simulator

---

## 🏃‍♂️ Running the App

### Option 1: Expo Go (Easiest - Physical Device)

**Best for testing notifications and voice recording!**

1. **Start the development server:**
   ```powershell
   npx expo start
   ```

2. **On your phone:**
   - iOS: Scan QR code with Camera app
   - Android: Scan QR code with Expo Go app

3. **Download Expo Go:**
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

**⚠️ Note:** Voice recording and notifications work ONLY on physical devices, not in browser!

---

### Option 2: Android Emulator

1. **Open Android Studio:**
   - Launch Android Studio
   - Open "AVD Manager" (Device Manager)
   - Create/start a virtual device

2. **Set JAVA_HOME** (if not set):
   ```powershell
   # Find your JDK installation, usually:
   # C:\Program Files\Java\jdk-XX.X.X
   # or
   # C:\Program Files\Android\Android Studio\jbr

   # Set it temporarily:
   $env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
   ```

3. **Run the app:**
   ```powershell
   npx expo run:android
   ```

   OR if Expo server is already running on port 8081:
   ```powershell
   # In one terminal:
   npx expo start

   # In another terminal (from Android Studio):
   adb install <path-to-apk>
   ```

---

### Option 3: Web Browser (Limited Testing)

**⚠️ Voice recording will NOT work in browser!**

```powershell
npx expo start --web
```

Opens at `http://localhost:8081` automatically.

---

## 📱 Testing New Features

### Test Notifications:

1. Run app on **physical device** (notifications don't work in emulator well)
2. Open the app → notifications auto-initialize
3. Check device notification settings → Moonifest should have permission
4. Wait for scheduled time (9AM, 2PM, 8PM, or 10PM)
5. OR add a test notification in code:
   ```typescript
   // In App.tsx or any component
   import * as Notifications from 'expo-notifications';

   // Add a button:
   <Button onPress={() => {
     Notifications.scheduleNotificationAsync({
       content: {
         title: "Test Notification",
         body: "This is a test!",
       },
       trigger: { seconds: 5 },
     });
   }} />
   ```

### Test Voice Recording:

1. Run app on **physical device** (voice recording doesn't work in browser/emulator)
2. Navigate to Journal tab
3. Tap any "Write" button or prompt card
4. **Press and hold** the gem button
5. You should see:
   - Permission request (first time)
   - Gem scales up and glows
   - Waveform animates
6. **Speak** your gratitude/manifestation
7. **Release** button
8. Alert appears with duration and "Save"/"Re-record" buttons
9. Tap "Save"
10. Check header → Aura points should increase by +10
11. Check counter → Should show 1/3, 2/3, or 3/3

### Test Aura Points:

1. Create gratitude check-ins (voice or text)
2. Watch header badge increase:
   - 1st check-in: +10 points
   - 2nd check-in: +10 points
   - 3rd check-in: +10 points + 20 bonus = +30 total
3. Close and reopen app → points should persist

---

## 🐛 Common Issues

### "JAVA_HOME is not set"
**Solution:** Set JAVA_HOME environment variable:
```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
```

### "Port 8081 is already in use"
**Solution:** Kill the process or use a different port:
```powershell
# Find what's using port 8081:
netstat -ano | findstr :8081

# Kill it:
taskkill /PID <pid> /F

# OR use different port:
npx expo start --port 8082
```

### "No connected devices"
**Solutions:**
- For emulator: Start it in Android Studio first
- For physical: Enable USB debugging and connect via USB
- For Expo Go: Make sure phone and computer are on same Wi-Fi

### "Voice recording doesn't work"
**Causes:**
- Running in web browser → Use physical device
- Microphone permission denied → Check device settings
- Using emulator → Some emulators don't support audio input

### "Notifications don't appear"
**Causes:**
- Running in web browser → Use physical device
- Notification permission denied → Check device settings
- App is closed → Notifications work when app is closed, but may need to be open for testing

---

## 🔧 Development Commands

```powershell
# Install dependencies
npm install

# Start development server
npx expo start

# Start with clear cache
npx expo start --clear

# Run on Android
npx expo run:android

# Run on iOS (Mac only)
npx expo run:ios

# Run on web
npx expo start --web

# Type checking
npx tsc --noEmit

# Check for updates
npx expo-doctor
```

---

## 📂 Project Structure

```
Moonifest-mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context (AppContext)
│   ├── navigation/      # React Navigation setup
│   ├── screens/         # Screen components
│   │   ├── VoiceJournalScreen.tsx  # ⭐ NEW voice recording
│   │   ├── GratitudeJournalScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── ...
│   ├── utils/           # Utility functions
│   │   ├── notifications.ts  # ⭐ NEW push notifications
│   │   ├── voiceRecording.ts # ⭐ NEW voice recording
│   │   ├── theme.ts
│   │   └── ...
│   └── types/           # TypeScript type definitions
├── App.tsx              # Root component
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── PHASE_1_IMPLEMENTATION.md  # What we just built
```

---

## 💡 Tips for Testing

1. **Always test on physical device** for notifications and voice
2. **Check console logs** - We log all important events:
   - `🎤 Started recording...`
   - `✅ Recording stopped, URI: ...`
   - `✨ +10 Aura points: Gratitude check-in`
   - `✅ Notifications initialized`
3. **Enable debugging** in Expo:
   - Shake device → "Debug Remote JS"
   - Chrome DevTools will open
4. **Check AsyncStorage** in React Native Debugger:
   - View saved aura points
   - View notification settings
   - View gratitude check-ins

---

## 📞 Need Help?

If you encounter issues:

1. **Check the logs** - Most errors show in terminal and device console
2. **Clear cache** - `npx expo start --clear`
3. **Reinstall** - `rm -rf node_modules && npm install`
4. **Check Expo status** - https://status.expo.dev/
5. **Review docs** - https://docs.expo.dev/

---

## 🎯 What to Test Now

Based on Phase 1 implementation, focus testing on:

✅ **Priority Testing:**
1. Voice recording (press and hold gem)
2. Aura points accumulation
3. Notification permissions
4. Gratitude check-in flow (3/3 completion)

⚠️ **Known Limitations:**
- Voice-to-text not yet implemented (shows placeholder)
- Notification times not customizable in-app (default times)
- No playback of voice recordings yet
- Waveform not synced to audio levels

See [PHASE_1_IMPLEMENTATION.md](PHASE_1_IMPLEMENTATION.md) for full details!

---

Happy testing! 🚀✨
