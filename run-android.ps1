# Run Android script for Moonifest-mobile
# This script checks ADB connection and runs the Expo app on Android emulator

Write-Host "=== Moonifest-mobile Android Runner ===" -ForegroundColor Cyan
Write-Host ""

# Change to repo root
Set-Location $PSScriptRoot

# Check ADB devices
Write-Host "Checking ADB devices..." -ForegroundColor Yellow
$adbOutput = adb devices 2>&1
Write-Host $adbOutput

# Check if any device shows as offline
if ($adbOutput -match "offline") {
    Write-Host ""
    Write-Host "Device detected as offline. Restarting ADB server..." -ForegroundColor Yellow
    adb kill-server
    adb start-server
    Write-Host "Waiting 5 seconds for ADB to restart..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Write-Host ""
    Write-Host "Checking ADB devices again..." -ForegroundColor Yellow
    $adbOutput = adb devices 2>&1
    Write-Host $adbOutput
}

# Check if any device is available (not offline, not unauthorized)
$deviceAvailable = $false
$lines = $adbOutput -split "`n"
foreach ($line in $lines) {
    if ($line -match "device$" -and $line -notmatch "List of devices") {
        $deviceAvailable = $true
        break
    }
}

if (-not $deviceAvailable) {
    Write-Host ""
    Write-Host "No Android emulator device detected!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start an emulator, run:" -ForegroundColor Yellow
    Write-Host "  emulator -list-avds" -ForegroundColor White
    Write-Host "  emulator -avd Medium_Phone_API_36.0" -ForegroundColor White
    Write-Host ""
    Write-Host "Or start it from Android Studio's AVD Manager." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Device detected! Installing dependencies..." -ForegroundColor Green
Write-Host ""

# Install dependencies
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "npm install failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting Expo on Android..." -ForegroundColor Green
Write-Host ""
Write-Host "NOTE: If Metro bundler opens, press 'a' to run on Android" -ForegroundColor Cyan
Write-Host ""

# Run Expo on Android
npx expo start --android





