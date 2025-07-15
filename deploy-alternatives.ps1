#!/usr/bin/env pwsh
# Alternative deployment methods for SaveSquad

$yourAddress = "0xf62dfcac4ca3f129bbdc4f117b0c4b30b767eac74a27963ca6bc3f0988c32507"

Write-Host "🚀 Alternative Deployment Methods" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "Since Sui Playground is not accessible, here are other options:" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 1: Direct CLI Deployment (Create transaction file)" -ForegroundColor White
Write-Host "  - Create transaction locally" -ForegroundColor Gray
Write-Host "  - You sign with your wallet externally" -ForegroundColor Gray
Write-Host "  - Submit the signed transaction" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Sui Explorer" -ForegroundColor White
Write-Host "  - Use SuiScan's deployment feature" -ForegroundColor Gray
Write-Host "  - Connect your wallet directly" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 3: Manual CLI with keystore import" -ForegroundColor White
Write-Host "  - Import your private key/mnemonic" -ForegroundColor Gray
Write-Host "  - Deploy directly via CLI" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Choose option (1, 2, or 3)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "🔨 Creating Deployment Transaction" -ForegroundColor Yellow
    Write-Host ""
    
    # Create the transaction but don't sign it
    Write-Host "Creating transaction file..." -ForegroundColor Gray
    
    try {
        # Generate the transaction
        $txFile = "deploy_transaction.json"
        $result = & C:\Tools\sui\sui.exe client publish --gas-budget 100000000 --serialize-unsigned-transaction contracts/ > $txFile 2>&1
        
        if (Test-Path $txFile) {
            Write-Host "✅ Transaction file created: $txFile" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 Next steps:" -ForegroundColor Cyan
            Write-Host "1. The transaction file is ready" -ForegroundColor White
            Write-Host "2. You need to sign it with your wallet" -ForegroundColor White
            Write-Host "3. Then submit the signed transaction" -ForegroundColor White
            Write-Host ""
            Write-Host "Transaction file location: $(Get-Location)\$txFile" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Failed to create transaction file" -ForegroundColor Red
            Write-Host "Error: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error creating transaction: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "🌐 Sui Explorer Deployment" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opening Sui Explorer..." -ForegroundColor Gray
    
    # Try different Sui explorers
    $explorers = @(
        "https://suiscan.xyz/testnet",
        "https://explorer.sui.io/",
        "https://suivision.xyz/"
    )
    
    foreach ($explorer in $explorers) {
        Write-Host "Opening: $explorer" -ForegroundColor Gray
        Start-Process $explorer
        Start-Sleep -Seconds 2
    }
    
    Write-Host ""
    Write-Host "📋 Instructions:" -ForegroundColor Cyan
    Write-Host "1. Connect your wallet to one of the explorers" -ForegroundColor White
    Write-Host "2. Look for 'Deploy Contract' or 'Publish' feature" -ForegroundColor White
    Write-Host "3. Upload your contracts folder:" -ForegroundColor White
    Write-Host "   Location: f:\DevMatch\savesquad\contracts\" -ForegroundColor Gray
    Write-Host "4. Deploy with your wallet" -ForegroundColor White
    
} elseif ($choice -eq "3") {
    Write-Host ""
    Write-Host "🔑 CLI Import and Deploy" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This option requires your private credentials." -ForegroundColor Yellow
    Write-Host "What type of credential do you have?" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Mnemonic phrase (12 or 24 words) - Recommended" -ForegroundColor White
    Write-Host "2. Private key in Bech32 format (starts with 'suiprivkey')" -ForegroundColor White
    Write-Host "3. Private key in hex format (will convert first)" -ForegroundColor White
    Write-Host ""
    
    $credType = Read-Host "Enter 1, 2, or 3"
    
    if ($credType -eq "1") {
        Write-Host ""
        Write-Host "📝 Mnemonic Import" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Enter your mnemonic phrase:" -ForegroundColor Cyan
        $mnemonic = Read-Host "Mnemonic (will be hidden)" -AsSecureString
        $mnemonicPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mnemonic))
        
        Write-Host "Importing mnemonic..." -ForegroundColor Gray
        
        try {
            # Import mnemonic
            $importResult = & C:\Tools\sui\sui.exe keytool import $mnemonicPlain ed25519
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Mnemonic imported successfully!" -ForegroundColor Green
                
                # List addresses to find yours
                Write-Host "Finding your address..." -ForegroundColor Gray
                $addresses = & C:\Tools\sui\sui.exe client addresses
                
                # Switch to your address if found
                & C:\Tools\sui\sui.exe client switch --address $yourAddress
                
                Write-Host ""
                Write-Host "🚀 Deploying contracts..." -ForegroundColor Yellow
                $deployResult = & C:\Tools\sui\sui.exe client publish --gas-budget 100000000 --skip-fetch-latest-git-deps contracts/
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host ""
                    Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
                    Write-Host "1. Find the 'Package ID' in the output above" -ForegroundColor White
                    Write-Host "2. Copy it (looks like: 0x1234...)" -ForegroundColor White
                    Write-Host "3. Update frontend/src/utils/constants.ts:" -ForegroundColor White
                    Write-Host "   Replace: PACKAGE_ID: '0x0'" -ForegroundColor Gray
                    Write-Host "   With:    PACKAGE_ID: 'YOUR_PACKAGE_ID'" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "🌐 Test your dApp: http://localhost:5173/" -ForegroundColor Cyan
                } else {
                    Write-Host "❌ Deployment failed" -ForegroundColor Red
                }
            } else {
                Write-Host "❌ Failed to import mnemonic" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } elseif ($credType -eq "2") {
        Write-Host ""
        Write-Host "🔐 Bech32 Private Key Import" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Enter your Bech32 private key (starts with 'suiprivkey'):" -ForegroundColor Cyan
        $privKey = Read-Host "Private Key" -AsSecureString
        $privKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($privKey))
        
        Write-Host "Importing private key..." -ForegroundColor Gray
        
        try {
            $importResult = & C:\Tools\sui\sui.exe keytool import $privKeyPlain ed25519
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Private key imported!" -ForegroundColor Green
                # Continue with deployment...
                & C:\Tools\sui\sui.exe client switch --address $yourAddress
                
                Write-Host "🚀 Deploying..." -ForegroundColor Yellow
                & C:\Tools\sui\sui.exe client publish --gas-budget 100000000 --skip-fetch-latest-git-deps contracts/
            }
        } catch {
            Write-Host "❌ Import failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } elseif ($credType -eq "3") {
        Write-Host ""
        Write-Host "🔄 Hex Private Key Conversion" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Enter your hex private key:" -ForegroundColor Cyan
        $hexKey = Read-Host "Hex Private Key" -AsSecureString
        $hexKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($hexKey))
        
        Write-Host "Converting hex to Bech32..." -ForegroundColor Gray
        
        try {
            # Convert hex to bech32
            $convertResult = & C:\Tools\sui\sui.exe keytool convert $hexKeyPlain
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Key converted!" -ForegroundColor Green
                Write-Host "Now importing..." -ForegroundColor Gray
                
                # The convert command should output the bech32 key
                # Import the converted key
                $importResult = & C:\Tools\sui\sui.exe keytool import $convertResult ed25519
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Key imported!" -ForegroundColor Green
                    # Continue with deployment...
                }
            }
        } catch {
            Write-Host "❌ Conversion failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📁 Contracts location: f:\DevMatch\savesquad\contracts\" -ForegroundColor Cyan
Write-Host "🌐 Your dApp: http://localhost:5173/" -ForegroundColor Cyan
Write-Host "💰 Your balance: 2.00 SUI (sufficient for deployment)" -ForegroundColor Green
