#!/usr/bin/env pwsh
# Complete SaveSquad Real Data Migration Script

Write-Host "🚀 SaveSquad Final Migration to Real Data" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Get the current directory
$rootDir = Get-Location

# Function to replace mock imports
function Update-ComponentFile {
    param([string]$filePath, [string]$componentName)
    
    Write-Host "📝 Updating $componentName..." -ForegroundColor Yellow
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Remove mock data imports
        $content = $content -replace "import.*mockData.*\n", ""
        $content = $content -replace "import.*MOCK_MODE.*from", "import { CONTRACTS } from"
        $content = $content -replace ", MOCK_MODE", ""
        $content = $content -replace ", mockContractCalls", ""
        $content = $content -replace ", MOCK_CONTRACTS", ""
        $content = $content -replace "MOCK_CONTRACTS", "// MOCK_CONTRACTS removed"
        $content = $content -replace "mockContractCalls", "// mockContractCalls removed"
        
        # Replace mock mode checks
        $content = $content -replace "if \(MOCK_MODE\) \{[^}]*\} else \{", "// Contracts deployment check
      if (CONTRACTS.PACKAGE_ID === '0x0') {
        console.warn('Contracts not deployed yet');
        alert('Contracts not deployed yet. Please deploy contracts first.');
        return;
      }
      {"
        
        # Write back the updated content
        Set-Content -Path $filePath -Value $content
        Write-Host "✅ Updated $componentName" -ForegroundColor Green
    } else {
        Write-Host "⚠️  File not found: $filePath" -ForegroundColor Yellow
    }
}

# Update all components
$components = @(
    @{ Path = "frontend/src/components/SquadList.tsx"; Name = "SquadList" },
    @{ Path = "frontend/src/components/SquadMembers.tsx"; Name = "SquadMembers" },
    @{ Path = "frontend/src/components/RewardsPanel.tsx"; Name = "RewardsPanel" },
    @{ Path = "frontend/src/components/ClaimPage.tsx"; Name = "ClaimPage" }
)

foreach ($component in $components) {
    Update-ComponentFile -filePath $component.Path -componentName $component.Name
}

# Create deployment configuration
Write-Host "📄 Creating deployment configuration..." -ForegroundColor Yellow

$deployConfig = @"
# SaveSquad Deployment Configuration

## Contract Addresses (Update after deployment)
PACKAGE_ID=0x0  # Update with your package ID
TREASURY_ID=0x0  # Update with treasury object ID
NFT_REGISTRY_ID=0x0  # Update with NFT registry object ID
CLOCK_ID=0x0000000000000000000000000000000000000000000000000000000000000006

## Environment Variables
REACT_APP_SUI_NETWORK=testnet
REACT_APP_PACKAGE_ID=\$PACKAGE_ID
REACT_APP_TREASURY_ID=\$TREASURY_ID
REACT_APP_NFT_REGISTRY_ID=\$NFT_REGISTRY_ID

## Deployment Commands
# 1. Deploy contracts:
#    sui client publish --gas-budget 100000000 contracts/
# 2. Update constants.ts with package ID and shared objects
# 3. Test with wallet connection
# 4. Deploy frontend to production
"@

Set-Content -Path ".env.example" -Value $deployConfig

# Create quick deployment script
$quickDeploy = @"
#!/usr/bin/env pwsh
# Quick deployment script for SaveSquad

Write-Host "🚀 Deploying SaveSquad to Sui Testnet..." -ForegroundColor Green

# Check if sui CLI is available
if (!(Get-Command sui -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Sui CLI not found. Please install Sui CLI first." -ForegroundColor Red
    Write-Host "   Download from: https://github.com/MystenLabs/sui/releases" -ForegroundColor Yellow
    exit 1
}

# Check if in sui testnet
`$network = sui client active-env
if (`$network -ne "testnet") {
    Write-Host "⚠️  Switching to testnet..." -ForegroundColor Yellow
    sui client switch --env testnet
}

# Get some testnet SUI if needed
Write-Host "💰 Requesting testnet SUI..." -ForegroundColor Yellow
sui client faucet

# Deploy contracts
Write-Host "📦 Deploying contracts..." -ForegroundColor Yellow
`$deployResult = sui client publish --gas-budget 100000000 contracts/

if (`$LASTEXITCODE -eq 0) {
    Write-Host "✅ Contracts deployed successfully!" -ForegroundColor Green
    Write-Host "📋 Please update frontend/src/utils/constants.ts with the package ID from the output above." -ForegroundColor Cyan
} else {
    Write-Host "❌ Contract deployment failed." -ForegroundColor Red
}
"@

Set-Content -Path "deploy.ps1" -Value $quickDeploy

Write-Host ""
Write-Host "✅ Migration completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run './deploy.ps1' to deploy contracts" -ForegroundColor White
Write-Host "2. Update constants.ts with real package ID" -ForegroundColor White
Write-Host "3. Test wallet connection and transactions" -ForegroundColor White
Write-Host "4. (Optional) Set up backend services" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- REAL_BACKEND_GUIDE.md - Complete backend setup guide" -ForegroundColor White
Write-Host "- .env.example - Environment configuration" -ForegroundColor White
Write-Host "- deploy.ps1 - Quick deployment script" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Your SaveSquad dApp is now ready for real blockchain integration!" -ForegroundColor Green
