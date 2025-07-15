#!/bin/bash

# SaveSquad Contract Deployment Script
# This script deploys the SaveSquad contracts to Sui testnet

echo "🚀 Starting SaveSquad contract deployment..."

# Check if sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI is not installed. Please install it first:"
    echo "cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui"
    exit 1
fi

# Set up testnet environment
echo "🔧 Setting up testnet environment..."
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet

# Get or create wallet
echo "💳 Checking wallet setup..."
if ! sui client addresses; then
    echo "Creating new wallet..."
    sui client new-address ed25519
fi

# Request testnet tokens
echo "💰 Requesting testnet tokens..."
sui client faucet

# Build the contracts
echo "🔨 Building Move contracts..."
cd contracts
sui move build

# Deploy the contracts
echo "📦 Deploying contracts to testnet..."
DEPLOY_RESULT=$(sui client publish --gas-budget 100000000)

# Extract package ID from deployment result
PACKAGE_ID=$(echo "$DEPLOY_RESULT" | grep -o '0x[a-f0-9]\{64\}' | head -1)

if [ -z "$PACKAGE_ID" ]; then
    echo "❌ Failed to extract package ID from deployment"
    exit 1
fi

echo "✅ Contracts deployed successfully!"
echo "📋 Package ID: $PACKAGE_ID"

# Update frontend constants
echo "🔄 Updating frontend constants..."
cd ../frontend/src/utils
sed -i "s/PACKAGE_ID: '0x0'/PACKAGE_ID: '$PACKAGE_ID'/" constants.ts

echo "✅ Frontend constants updated!"

# Find shared objects (Treasury, NFTRegistry, etc.)
echo "🔍 Finding shared objects..."
SHARED_OBJECTS=$(sui client objects --json | grep -A 20 -B 20 "treasury\|registry")

echo "📝 Deployment Summary:"
echo "===================="
echo "Package ID: $PACKAGE_ID"
echo "Network: Sui Testnet"
echo "Explorer: https://testnet.suivision.xyz/package/$PACKAGE_ID"
echo ""
echo "🎉 SaveSquad contracts are now live on Sui testnet!"
echo "You can now run the frontend with: npm run dev"
