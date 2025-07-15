#!/usr/bin/env pwsh
# Simple deployment guide for your wallet

$yourAddress = "0xf62dfcac4ca3f129bbdc4f117b0c4b30b767eac74a27963ca6bc3f0988c32507"

Write-Host "🎉 Great! You have 2.00 SUI in your wallet!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Address: $yourAddress" -ForegroundColor Cyan
Write-Host "Balance: 2.00 SUI (enough for deployment!)" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Deployment Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Import your wallet with correct format" -ForegroundColor White
Write-Host "  - If you have a Bech32 private key (starts with 'suiprivkey')" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Import via mnemonic phrase" -ForegroundColor White
Write-Host "  - If you have your 12/24 word seed phrase" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 3: Use browser-based deployment (Recommended)" -ForegroundColor White
Write-Host "  - Keep your keys secure in your browser wallet" -ForegroundColor Gray
Write-Host "  - Use web tools for deployment" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Choose option (1, 2, or 3)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "🔑 Import Bech32 Private Key" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Enter your Bech32 private key (starts with 'suiprivkey'):" -ForegroundColor Cyan
    $bech32Key = Read-Host "Private Key" -AsSecureString
    $keyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($bech32Key))
    
    Write-Host "Importing key..." -ForegroundColor Yellow
    
    try {
        # Import the key
        $result = & C:\Tools\sui\sui.exe keytool import $keyPlain ed25519
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Wallet imported successfully!" -ForegroundColor Green
            
            # Switch to your address
            & C:\Tools\sui\sui.exe client switch --address $yourAddress
            
            Write-Host ""
            Write-Host "🚀 Deploying contracts..." -ForegroundColor Yellow
            & C:\Tools\sui\sui.exe client publish --gas-budget 100000000 --skip-fetch-latest-git-deps contracts/
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
                Write-Host ""
                Write-Host "📋 Next Step: Update your frontend!" -ForegroundColor Cyan
                Write-Host "1. Find the 'Package ID' in the output above" -ForegroundColor White
                Write-Host "2. Copy it (looks like: 0x1234...)" -ForegroundColor White
                Write-Host "3. Update frontend/src/utils/constants.ts" -ForegroundColor White
                Write-Host "   Change: PACKAGE_ID: '0x0'" -ForegroundColor Gray
                Write-Host "   To:     PACKAGE_ID: 'YOUR_PACKAGE_ID'" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "❌ Import failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "🌱 Import via Mnemonic" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Enter your mnemonic phrase (12 or 24 words):" -ForegroundColor Cyan
    $mnemonic = Read-Host "Mnemonic" -AsSecureString
    $mnemonicPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mnemonic))
    
    Write-Host "Restoring from mnemonic..." -ForegroundColor Yellow
    
    try {
        # Try to generate address from mnemonic
        $result = & C:\Tools\sui\sui.exe keytool restore $mnemonicPlain
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Wallet restored!" -ForegroundColor Green
            # Continue with deployment...
        }
    } catch {
        Write-Host "❌ Restore failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} elseif ($choice -eq "3") {
    Write-Host ""
    Write-Host "🌐 Browser-Based Deployment (Recommended)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Since you have SUI in your wallet, you can deploy via:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Sui Playground:" -ForegroundColor White
    Write-Host "   - Go to: https://play.sui.io/" -ForegroundColor Gray
    Write-Host "   - Connect your wallet" -ForegroundColor Gray
    Write-Host "   - Upload contracts folder" -ForegroundColor Gray
    Write-Host "   - Deploy with 1-click" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Sui Explorer:" -ForegroundColor White
    Write-Host "   - Go to: https://suiscan.xyz/testnet" -ForegroundColor Gray
    Write-Host "   - Use the publish feature" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Manual Transaction:" -ForegroundColor White
    Write-Host "   - Create transaction locally" -ForegroundColor Gray
    Write-Host "   - Sign with your browser wallet" -ForegroundColor Gray
    Write-Host ""
    
    $openPlayground = Read-Host "Open Sui Playground? (y/N)"
    if ($openPlayground -eq 'y' -or $openPlayground -eq 'Y') {
        Start-Process "https://play.sui.io/"
        Write-Host ""
        Write-Host "📁 Contracts location: f:\DevMatch\savesquad\contracts\" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "After deployment:" -ForegroundColor Yellow
        Write-Host "1. Copy the Package ID" -ForegroundColor White
        Write-Host "2. Update frontend/src/utils/constants.ts" -ForegroundColor White
        Write-Host "3. Test your dApp at http://localhost:5173/" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🌐 Your dApp: http://localhost:5173/" -ForegroundColor Cyan
Write-Host "📚 Documentation: MIGRATION_COMPLETE.md" -ForegroundColor Cyan
