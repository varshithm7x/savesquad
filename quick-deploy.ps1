#!/usr/bin/env pwsh
# Quick Deploy Script for SaveSquad

Write-Host "🚀 SaveSquad Quick Deploy" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Set the SUI CLI path
$suiPath = "C:\Tools\sui\sui.exe"

Write-Host ""
Write-Host "📋 Current Setup:" -ForegroundColor Cyan
Write-Host "- Sui CLI: $suiPath" -ForegroundColor White
Write-Host "- Network: testnet" -ForegroundColor White

# Check Sui CLI
if (Test-Path $suiPath) {
    Write-Host "✅ Sui CLI found" -ForegroundColor Green
    
    # Show current address
    Write-Host ""
    Write-Host "📍 Current Address:" -ForegroundColor Cyan
    & $suiPath client active-address
    
    # Check balance
    Write-Host ""
    Write-Host "💰 Current Balance:" -ForegroundColor Cyan
    & $suiPath client balance
    
    $balance = & $suiPath client balance --json 2>$null | ConvertFrom-Json
    
    if ($balance -and $balance.Count -gt 0) {
        Write-Host ""
        Write-Host "🎯 Ready to deploy contracts!" -ForegroundColor Green
        
        $response = Read-Host "Do you want to deploy contracts now? (y/N)"
        
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host ""
            Write-Host "📦 Deploying contracts..." -ForegroundColor Yellow
            
            $deployResult = & $suiPath client publish --gas-budget 100000000 contracts/
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Contracts deployed successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "📋 Next Steps:" -ForegroundColor Cyan
                Write-Host "1. Copy the Package ID from the output above" -ForegroundColor White
                Write-Host "2. Update frontend/src/utils/constants.ts" -ForegroundColor White
                Write-Host "3. Test your dApp with real contracts!" -ForegroundColor White
            } else {
                Write-Host ""
                Write-Host "❌ Deployment failed. Check the output above for details." -ForegroundColor Red
            }
        }
    } else {
        Write-Host ""
        Write-Host "⚠️  No SUI balance found!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 To get testnet SUI:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://faucet.sui.io/" -ForegroundColor White
        Write-Host "2. Enter your address shown above" -ForegroundColor White
        Write-Host "3. Request testnet SUI" -ForegroundColor White
        Write-Host "4. Run this script again" -ForegroundColor White
        
        # Try web faucet automatically
        Write-Host ""
        $faucetResponse = Read-Host "Open faucet in browser? (y/N)"
        if ($faucetResponse -eq 'y' -or $faucetResponse -eq 'Y') {
            $address = & $suiPath client active-address
            Start-Process "https://faucet.sui.io/?address=$address"
        }
    }
} else {
    Write-Host "❌ Sui CLI not found at $suiPath" -ForegroundColor Red
    Write-Host "Please run the setup script first." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 Your dApp is running at: http://localhost:5173/" -ForegroundColor Cyan
Write-Host "📚 Documentation: MIGRATION_COMPLETE.md" -ForegroundColor Cyan
