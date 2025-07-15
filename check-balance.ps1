#!/usr/bin/env pwsh
# Check balance for your actual wallet address

$yourAddress = "0xf62dfcac4ca3f129bbdc4f117b0c4b30b767eac74a27963ca6bc3f0988c32507"
$suiPath = "C:\Tools\sui\sui.exe"

Write-Host "🔍 Checking balance for your wallet address..." -ForegroundColor Cyan
Write-Host "Address: $yourAddress" -ForegroundColor White
Write-Host ""

# Check balance using RPC
try {
    $balanceCheck = & $suiPath client balance --address $yourAddress 2>$null
    
    if ($balanceCheck -and $balanceCheck -notmatch "No coins found") {
        Write-Host "✅ SUI balance found!" -ForegroundColor Green
        Write-Host "Balance:" -ForegroundColor Cyan
        & $suiPath client balance --address $yourAddress
        
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Import your wallet to Sui CLI to deploy contracts" -ForegroundColor White
        Write-Host "2. Or use the web interface for deployment" -ForegroundColor White
        Write-Host ""
        Write-Host "Would you like to import your wallet? (y/N): " -NoNewline -ForegroundColor Yellow
    } else {
        Write-Host "💰 No SUI found yet." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://faucet.sui.io/?address=$yourAddress" -ForegroundColor White
        Write-Host "2. Request testnet SUI" -ForegroundColor White
        Write-Host "3. Run this script again to check balance" -ForegroundColor White
        Write-Host ""
        
        $openFaucet = Read-Host "Open faucet in browser? (y/N)"
        if ($openFaucet -eq 'y' -or $openFaucet -eq 'Y') {
            Start-Process "https://faucet.sui.io/?address=$yourAddress"
        }
    }
} catch {
    Write-Host "❌ Error checking balance: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 Your dApp: http://localhost:5173/" -ForegroundColor Cyan
Write-Host "📚 Documentation: MIGRATION_COMPLETE.md" -ForegroundColor Cyan
