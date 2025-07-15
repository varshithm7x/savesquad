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
$network = sui client active-env
if ($network -ne "testnet") {
    Write-Host "⚠️  Switching to testnet..." -ForegroundColor Yellow
    sui client switch --env testnet
}

# Get some testnet SUI if needed
Write-Host "💰 Requesting testnet SUI..." -ForegroundColor Yellow
sui client faucet

# Deploy contracts
Write-Host "📦 Deploying contracts..." -ForegroundColor Yellow
$deployResult = sui client publish --gas-budget 100000000 contracts/

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contracts deployed successfully!" -ForegroundColor Green
    Write-Host "📋 Please update frontend/src/utils/constants.ts with the package ID from the output above." -ForegroundColor Cyan
} else {
    Write-Host "❌ Contract deployment failed." -ForegroundColor Red
}
