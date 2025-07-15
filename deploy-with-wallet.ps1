#!/usr/bin/env pwsh
# Import and deploy with your wallet address

$yourAddress = "0xf62dfcac4ca3f129bbdc4f117b0c4b30b767eac74a27963ca6bc3f0988c32507"
$suiPath = "C:\Tools\sui\sui.exe"

Write-Host "🔐 Adding your wallet address to Sui CLI" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your address: $yourAddress" -ForegroundColor Cyan
Write-Host ""

# Check if we can query the address balance
Write-Host "💰 Checking balance for your address..." -ForegroundColor Yellow

try {
    $balanceOutput = & $suiPath client balance --address $yourAddress 2>&1
    
    if ($balanceOutput -match "No coins found") {
        Write-Host "❌ No SUI found at your address" -ForegroundColor Red
        Write-Host ""
        Write-Host "📋 Get testnet SUI first:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://faucet.sui.io/?address=$yourAddress" -ForegroundColor White
        Write-Host "2. Request SUI tokens" -ForegroundColor White
        Write-Host "3. Wait for tokens to arrive" -ForegroundColor White
        Write-Host "4. Run this script again" -ForegroundColor White
        
        $openFaucet = Read-Host "`nOpen faucet now? (y/N)"
        if ($openFaucet -eq 'y' -or $openFaucet -eq 'Y') {
            Start-Process "https://faucet.sui.io/?address=$yourAddress"
        }
        return
    } else {
        Write-Host "✅ SUI balance found!" -ForegroundColor Green
        Write-Host "Balance details:" -ForegroundColor Cyan
        & $suiPath client balance --address $yourAddress
        Write-Host ""
    }
} catch {
    Write-Host "⚠️  Could not check balance directly" -ForegroundColor Yellow
}

# Options for deployment
Write-Host "🚀 Deployment Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Import your wallet to CLI (secure, recommended)" -ForegroundColor White
Write-Host "  - Need: Private key or mnemonic phrase" -ForegroundColor Gray
Write-Host "  - Pro: Direct deployment from this script" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Manual deployment via browser" -ForegroundColor White  
Write-Host "  - Use: Sui Explorer or other web tools" -ForegroundColor Gray
Write-Host "  - Pro: No need to share private keys" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Choose option (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "🔑 Import Wallet to CLI" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "What do you have?" -ForegroundColor Cyan
    Write-Host "1. Private key (64-character hex string)" -ForegroundColor White
    Write-Host "2. Mnemonic phrase (12 or 24 words)" -ForegroundColor White
    Write-Host ""
    
    $keyType = Read-Host "Enter 1 or 2"
    
    if ($keyType -eq "1") {
        Write-Host ""
        $privateKey = Read-Host "Enter your private key (will be hidden)" -AsSecureString
        $privateKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($privateKey))
        
        Write-Host "Importing private key..." -ForegroundColor Yellow
        
        # Import the private key
        $importResult = echo $privateKeyPlain | & $suiPath keytool import $privateKeyPlain ed25519 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Wallet imported successfully!" -ForegroundColor Green
            
            # Switch to the imported address
            & $suiPath client switch --address $yourAddress
            
            Write-Host ""
            Write-Host "🚀 Ready to deploy contracts!" -ForegroundColor Green
            $deploy = Read-Host "Deploy now? (y/N)"
            
            if ($deploy -eq 'y' -or $deploy -eq 'Y') {
                Write-Host ""
                Write-Host "📦 Deploying contracts..." -ForegroundColor Yellow
                & $suiPath client publish --gas-budget 100000000 --skip-fetch-latest-git-deps contracts/
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host ""
                    Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
                    Write-Host "1. Find 'Package ID' in the output above" -ForegroundColor White
                    Write-Host "2. Copy the Package ID (starts with 0x)" -ForegroundColor White
                    Write-Host "3. Update frontend/src/utils/constants.ts:" -ForegroundColor White
                    Write-Host "   Replace: PACKAGE_ID: '0x0'" -ForegroundColor Gray
                    Write-Host "   With:    PACKAGE_ID: 'YOUR_PACKAGE_ID'" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "❌ Failed to import wallet" -ForegroundColor Red
            Write-Host "Error: $importResult" -ForegroundColor Red
        }
        
    } elseif ($keyType -eq "2") {
        Write-Host ""
        Write-Host "Enter your mnemonic phrase (12 or 24 words):" -ForegroundColor Cyan
        $mnemonic = Read-Host "Mnemonic" -AsSecureString
        $mnemonicPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mnemonic))
        
        Write-Host "Importing mnemonic..." -ForegroundColor Yellow
        
        # Import the mnemonic
        $importResult = echo $mnemonicPlain | & $suiPath keytool import $mnemonicPlain ed25519 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Wallet imported successfully!" -ForegroundColor Green
            # Continue with deployment...
        } else {
            Write-Host "❌ Failed to import wallet" -ForegroundColor Red
            Write-Host "Error: $importResult" -ForegroundColor Red
        }
    }
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "🌐 Manual Deployment Instructions" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Since you have SUI in your wallet, you can:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Use Sui Explorer's publish feature:" -ForegroundColor White
    Write-Host "   - Go to: https://suiscan.xyz/testnet" -ForegroundColor Gray
    Write-Host "   - Connect your wallet" -ForegroundColor Gray
    Write-Host "   - Upload your contracts folder" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Use Sui CLI with a different approach:" -ForegroundColor White
    Write-Host "   - Create transaction file" -ForegroundColor Gray
    Write-Host "   - Sign with your wallet" -ForegroundColor Gray
    Write-Host "   - Submit transaction" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Alternative: Use Move Playground:" -ForegroundColor White
    Write-Host "   - Go to: https://play.sui.io/" -ForegroundColor Gray
    Write-Host "   - Upload and deploy contracts" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After deployment, copy the Package ID and update:" -ForegroundColor Cyan
    Write-Host "frontend/src/utils/constants.ts" -ForegroundColor White
}

Write-Host ""
Write-Host "🌐 Your dApp: http://localhost:5173/" -ForegroundColor Cyan
Write-Host "📚 Documentation: MIGRATION_COMPLETE.md" -ForegroundColor Cyan
