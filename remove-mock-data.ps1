#!/usr/bin/env pwsh
# SaveSquad Real Data Migration Script
# This script removes all mock data usage and prepares for real backend deployment

Write-Host "🚀 SaveSquad Real Data Migration" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Step 1: Remove mock data file
Write-Host "📦 Removing mock data file..." -ForegroundColor Yellow
if (Test-Path "frontend/src/utils/mockData.ts") {
    Remove-Item "frontend/src/utils/mockData.ts"
    Write-Host "✅ mockData.ts removed" -ForegroundColor Green
} else {
    Write-Host "⚠️  mockData.ts not found" -ForegroundColor Yellow
}

# Step 2: Verify constants are set to real mode
Write-Host "🔧 Verifying constants configuration..." -ForegroundColor Yellow
$constantsFile = "frontend/src/utils/constants.ts"
if (Test-Path $constantsFile) {
    $constants = Get-Content $constantsFile -Raw
    if ($constants -match "MOCK_MODE = false") {
        Write-Host "✅ MOCK_MODE is disabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MOCK_MODE may still be enabled" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ constants.ts not found" -ForegroundColor Red
}

# Step 3: Check for any remaining mock imports
Write-Host "🔍 Checking for remaining mock imports..." -ForegroundColor Yellow
$mockImports = Get-ChildItem "frontend/src" -Recurse -Filter "*.tsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "mockData|MOCK_MODE|mockContractCalls") {
        Write-Host "⚠️  Found mock usage in: $($_.Name)" -ForegroundColor Yellow
        return $_.FullName
    }
}

if ($mockImports) {
    Write-Host "📝 Files needing manual cleanup:" -ForegroundColor Yellow
    $mockImports | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
} else {
    Write-Host "✅ No mock imports found" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Next Steps for Real Backend:" -ForegroundColor Cyan
Write-Host "1. Deploy Move contracts to Sui testnet" -ForegroundColor White
Write-Host "2. Update PACKAGE_ID in constants.ts" -ForegroundColor White  
Write-Host "3. Add treasury and registry object IDs" -ForegroundColor White
Write-Host "4. Test with real wallet connection" -ForegroundColor White
Write-Host "5. (Optional) Set up backend API server" -ForegroundColor White

Write-Host ""
Write-Host "📋 Contract Deployment Guide:" -ForegroundColor Cyan
Write-Host "   sui client publish --gas-budget 100000000 contracts/" -ForegroundColor Gray
Write-Host "   # Copy the package ID from output" -ForegroundColor Gray
Write-Host "   # Update constants.ts with real values" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Migration script completed!" -ForegroundColor Green
