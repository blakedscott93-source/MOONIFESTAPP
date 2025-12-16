# Running Moonifest-mobile on Android Emulator

## Prerequisites

- Android Studio installed (with Android SDK and platform tools)
- Android Emulator AVD created and configured
- Node.js and npm installed
- ADB (Android Debug Bridge) accessible in PATH

## Quick Start

### Option 1: Using npm script (Recommended)
```powershell
npm run android:run
```

### Option 2: Direct PowerShell script
```powershell
.\run-android.ps1
```

## Starting the Emulator

If no emulator is running, start one:

1. **List available AVDs:**
   ```powershell
   emulator -list-avds
   ```

2. **Start a specific emulator:**
   ```powershell
   emulator -avd Medium_Phone_API_36.0
   ```
   (Replace `Medium_Phone_API_36.0` with your AVD name)

3. **Or use Android Studio:**
   - Open Android Studio
   - Go to Tools → Device Manager
   - Click the Play button next to your AVD

Wait for the emulator to fully boot before running the app.

## What the Script Does

The `run-android.ps1` script automatically:
1. Checks ADB device connection
2. Restarts ADB server if devices show as "offline"
3. Verifies an emulator is connected
4. Installs npm dependencies
5. Starts Expo and launches the app on Android

## Common Issues & Fixes

### "No Android emulator device detected"
- **Solution:** Start an emulator first (see "Starting the Emulator" above)
- Verify with: `adb devices` (should show a device, not "offline")

### Device shows as "offline"
- **Solution:** The script automatically restarts ADB, but you can manually run:
  ```powershell
  adb kill-server
  adb start-server
  adb devices
  ```

### "adb: command not found"
- **Solution:** Add Android SDK platform-tools to your PATH:
  - Default location: `C:\Users\<YourUser>\AppData\Local\Android\Sdk\platform-tools`
  - Add to System Environment Variables → Path

### Metro bundler opens but app doesn't launch
- **Solution:** Press `a` in the Metro bundler terminal to launch on Android

### Terminal/PowerShell execution policy error
- **Solution:** Run PowerShell as Administrator and execute:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
  Or use the npm script which bypasses this: `npm run android:run`

### Need to restart everything
1. Close Metro bundler (Ctrl+C)
2. Restart VS Code terminal
3. Restart emulator if needed
4. Run `npm run android:run` again

## Manual Commands

If you prefer to run commands manually:

```powershell
# Check devices
adb devices

# Install dependencies
npm install

# Start Expo on Android
npx expo start --android
```

## Notes

- Android Studio does NOT need to be open while running the app
- The script handles ADB connection issues automatically
- First run may take longer due to dependency installation
- Ensure your emulator has sufficient resources allocated (RAM, disk space)





