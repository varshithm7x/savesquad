#!/usr/bin/env pwsh
# Transfer SUI from your wallet to CLI for deployment

$cliAddress = "0x8e073f8be88b1e58781625d6de6e2c8632f941057ded566dea6994937fb73132"
$yourWalletAddress = "0xf62dfcac4ca3f129bbdc4f117b0c4b30b767eac74a27963ca6bc3f0988c32507"

Write-Host "💰 Transfer SUI for Deployment" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Slush wallet: $yourWalletAddress" -ForegroundColor Cyan
Write-Host "CLI address:       $cliAddress" -ForegroundColor Yellow
Write-Host ""
Write-Host "You need to transfer about 1 SUI from Slush to CLI address" -ForegroundColor White
Write-Host ""

Write-Host "📋 Steps:" -ForegroundColor Cyan
Write-Host "1. Open your Slush wallet" -ForegroundColor White
Write-Host "2. Click 'Send' or 'Transfer'" -ForegroundColor White
Write-Host "3. Paste this address: $cliAddress" -ForegroundColor Yellow
Write-Host "4. Amount: 1 SUI (keep 1 SUI in your wallet)" -ForegroundColor White
Write-Host "5. Send the transaction" -ForegroundColor White
Write-Host ""

# Monitor for SUI arrival
Write-Host "💡 I'll monitor for SUI arrival and auto-deploy when ready!" -ForegroundColor Green
Write-Host ""

$maxAttempts = 60
$attempt = 0

Write-Host "⏳ Waiting for SUI transfer to arrive..." -ForegroundColor Yellow
Write-Host "   (Send 1 SUI to: $cliAddress)" -ForegroundColor Gray
Write-Host ""

do {
    $attempt++
    if ($attempt % 5 -eq 0) {
        Write-Host "Checking... (Attempt $attempt/$maxAttempts)" -ForegroundColor Gray
    }
    
    try {
        $balance = & C:\Tools\sui\sui.exe client balance --json 2>$null | ConvertFrom-Json
        
        if ($balance -and $balance.Count -gt 0) {
            $suiBalance = $balance | Where-Object { $_.coinType -eq "0x2::sui::SUI" }
            if ($suiBalance -and [decimal]$suiBalance.totalBalance -gt 500000000) { # More than 0.5 SUI
                Write-Host ""
                Write-Host "✅ SUI received! Balance: $([decimal]$suiBalance.totalBalance / 1000000000) SUI" -ForegroundColor Green
                Write-Host ""
                Write-Host "🚀 Auto-deploying contracts..." -ForegroundColor Yellow
                
                # Deploy contracts
                $deployResult = & C:\Tools\sui\sui.exe client publish --gas-budget 100000000 --skip-fetch-latest-git-deps contracts/
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host ""
                    Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
                    Write-Host "========================================" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "📋 IMPORTANT - UPDATE YOUR FRONTEND:" -ForegroundColor Cyan
                    Write-Host ""
                    Write-Host "1. Look for 'Package ID' in the output above" -ForegroundColor White
                    Write-Host "   (It looks like: 0x1234567890abcdef...)" -ForegroundColor Gray
                    Write-Host ""
                    Write-Host "2. Copy the Package ID" -ForegroundColor White
                    Write-Host ""
                    Write-Host "3. Open: frontend/src/utils/constants.ts" -ForegroundColor White
                    Write-Host ""
                    Write-Host "4. Replace this line:" -ForegroundColor White
                    Write-Host "   PACKAGE_ID: '0x0'," -ForegroundColor Red
                    Write-Host ""
                    Write-Host "5. With your Package ID:" -ForegroundColor White
                    Write-Host "   PACKAGE_ID: 'YOUR_PACKAGE_ID_HERE'," -ForegroundColor Green
                    Write-Host ""
                    Write-Host "6. Save the file" -ForegroundColor White
                    Write-Host ""
                    Write-Host "7. Test your dApp at: http://localhost:5173/" -ForegroundColor Cyan
                    Write-Host ""
                    Write-Host "🎊 Your SaveSquad dApp is now LIVE on Sui testnet!" -ForegroundColor Green
                } else {
                    Write-Host ""
                    Write-Host "❌ Deployment failed. Check output above for details." -ForegroundColor Red
                }
                return
            }
        }
    } catch {
        # Continue checking
    }
    
    Start-Sleep -Seconds 5
    
} while ($attempt -lt $maxAttempts)

Write-Host ""
Write-Host "⏰ Timeout reached. Please check the transfer and try again." -ForegroundColor Yellow
Write-Host ""
Write-Host "To check manually:" -ForegroundColor Cyan
Write-Host "1. Run: C:\Tools\sui\sui.exe client balance" -ForegroundColor White
Write-Host "2. If you have SUI, run: .\quick-deploy.ps1" -ForegroundColor White
