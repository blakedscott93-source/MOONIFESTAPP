# Complete Expo Cleanup Script
# This script performs a full cleanup to fix reanimated worklets mismatch and cache issues

Write-Host "Starting Complete Expo Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any running Metro/Expo processes
Write-Host "[1/10] Stopping any running Metro/Expo processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   [OK] Processes stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Delete node_modules
Write-Host "[2/10] Deleting node_modules folder..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Write-Host "   [OK] node_modules deleted" -ForegroundColor Green
} else {
    Write-Host "   [INFO] node_modules not found (already clean)" -ForegroundColor Gray
}
Write-Host ""

# Step 3: Delete package-lock.json
Write-Host "[3/10] Deleting package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
    Write-Host "   [OK] package-lock.json deleted" -ForegroundColor Green
} else {
    Write-Host "   [INFO] package-lock.json not found" -ForegroundColor Gray
}
Write-Host ""

# Step 4: Delete .expo folder
Write-Host "[4/10] Deleting .expo folder..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue
    Write-Host "   [OK] .expo folder deleted" -ForegroundColor Green
} else {
    Write-Host "   [INFO] .expo folder not found" -ForegroundColor Gray
}
Write-Host ""

# Step 5: Clear npm cache
Write-Host "[5/10] Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "   [OK] npm cache cleared" -ForegroundColor Green
Write-Host ""

# Step 6: Clear Metro bundler cache
Write-Host "[6/10] Clearing Metro bundler cache..." -ForegroundColor Yellow
if (Test-Path "$env:TEMP\metro-*") {
    Remove-Item -Recurse -Force "$env:TEMP\metro-*" -ErrorAction SilentlyContinue
}
if (Test-Path "$env:TEMP\haste-map-*") {
    Remove-Item -Recurse -Force "$env:TEMP\haste-map-*" -ErrorAction SilentlyContinue
}
Write-Host "   [OK] Metro cache cleared" -ForegroundColor Green
Write-Host ""

# Step 7: Fresh npm install
Write-Host "[7/10] Running fresh npm install..." -ForegroundColor Yellow
Write-Host "   (This may take a few minutes...)" -ForegroundColor Gray
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] npm install completed successfully" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] npm install failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 8: Fix Expo dependencies
Write-Host "[8/10] Running expo install --fix to ensure SDK compatibility..." -ForegroundColor Yellow
npx expo install --fix
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Expo dependencies fixed" -ForegroundColor Green
} else {
    Write-Host "   [WARNING] expo install --fix completed with warnings" -ForegroundColor Yellow
}
Write-Host ""

# Step 9: Verify babel.config.js has reanimated plugin
Write-Host "[9/10] Verifying babel.config.js configuration..." -ForegroundColor Yellow
$babelConfig = Get-Content "babel.config.js" -Raw
if ($babelConfig -match "react-native-reanimated/plugin") {
    Write-Host "   [OK] react-native-reanimated/plugin found in babel.config.js" -ForegroundColor Green
} else {
    Write-Host "   [WARNING] react-native-reanimated/plugin NOT found in babel.config.js" -ForegroundColor Red
    Write-Host "   Please add it manually as the LAST plugin in the plugins array" -ForegroundColor Yellow
}
Write-Host ""

# Step 10: Verify index.js exists (since main was changed)
Write-Host "[10/10] Verifying entry point..." -ForegroundColor Yellow
if (Test-Path "index.js") {
    Write-Host "   [OK] index.js found" -ForegroundColor Green
} else {
    Write-Host "   [WARNING] index.js not found. You may need to create it or change main back to index.ts" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the app with a fresh cache:" -ForegroundColor White
Write-Host "   npx expo start --clear" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. For iOS testing with Expo Go:" -ForegroundColor White
Write-Host "   - Scan the QR code with your iPhone camera" -ForegroundColor Gray
Write-Host "   - Or press 'i' in the terminal to open iOS simulator" -ForegroundColor Gray
Write-Host ""
Write-Host "3. If you still see errors:" -ForegroundColor White
Write-Host "   - Close and reopen Expo Go app on your device" -ForegroundColor Gray
Write-Host "   - Clear Expo Go app cache (shake device -> Reload)" -ForegroundColor Gray
Write-Host "   - Make sure you're using the latest Expo Go app version" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
