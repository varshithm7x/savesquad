#!/usr/bin/env pwsh
# Auto-deploy when SUI balance is available

Write-Host "💰 Waiting for SUI tokens to arrive..." -ForegroundColor Yellow
Write-Host "Address: 0x8e073f8be88b1e58781625d6de6e2c8632f941057ded566dea6994937fb73132" -ForegroundColor Cyan
Write-Host ""

$suiPath = "C:\Tools\sui\sui.exe"
$maxAttempts = 60  # Wait up to 10 minutes
$attempt = 0

do {
    $attempt++
    Write-Host "Checking balance... (Attempt $attempt/$maxAttempts)" -ForegroundColor Gray
    
    try {
        $balanceOutput = & $suiPath client balance 2>$null
        
        if ($balanceOutput -and $balanceOutput -notmatch "No coins found") {
            Write-Host ""
            Write-Host "✅ SUI tokens detected!" -ForegroundColor Green
            Write-Host "Current balance:" -ForegroundColor Cyan
            & $suiPath client balance
            
            Write-Host ""
            Write-Host "🚀 Auto-deploying contracts..." -ForegroundColor Yellow
            
            $deployResult = & $suiPath client publish --gas-budget 100000000 --skip-fetch-latest-git-deps contracts/
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "🎉 CONTRACT DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
                Write-Host ""
                Write-Host "📋 Next Steps:" -ForegroundColor Cyan
                Write-Host "1. Find the 'Package ID' in the output above" -ForegroundColor White
                Write-Host "2. Copy the Package ID (looks like: 0x1234...)" -ForegroundColor White
                Write-Host "3. Update frontend/src/utils/constants.ts" -ForegroundColor White
                Write-Host "   Replace: PACKAGE_ID: '0x0'" -ForegroundColor Gray
                Write-Host "   With:    PACKAGE_ID: 'YOUR_PACKAGE_ID'" -ForegroundColor Green
                Write-Host ""
                Write-Host "🌐 Your dApp: http://localhost:5173/" -ForegroundColor Cyan
                Write-Host "📚 Docs: MIGRATION_COMPLETE.md" -ForegroundColor Cyan
                
                return
            } else {
                Write-Host ""
                Write-Host "❌ Deployment failed. Check output above." -ForegroundColor Red
                return
            }
        }
    } catch {
        # Continue checking
    }
    
    if ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 10
    }
    
} while ($attempt -lt $maxAttempts)

Write-Host ""
Write-Host "⏰ Timeout reached. Please check faucet manually:" -ForegroundColor Yellow
Write-Host "https://faucet.sui.io/?address=0x8e073f8be88b1e58781625d6de6e2c8632f941057ded566dea6994937fb73132" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then run: .\quick-deploy.ps1" -ForegroundColor White
