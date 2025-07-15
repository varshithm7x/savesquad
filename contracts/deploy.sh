#!/bin/bash

echo "🚀 Deploying SaveSquad Contracts to Sui Testnet"
echo "================================================"

# Check if we're in the contracts directory
if [ ! -f "Move.toml" ]; then
    echo "❌ Please run this script from the contracts directory"
    exit 1
fi

# Check if Sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI is not installed. Please install it first:"
    echo "cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui"
    exit 1
fi

# Set up testnet environment
echo "🔧 Setting up Sui testnet environment..."
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443 2>/dev/null || true
sui client switch --env testnet

# Check wallet balance
echo "💰 Checking wallet balance..."
BALANCE=$(sui client balance 2>/dev/null | grep "SUI" | head -1 | grep -o '[0-9.]*' | head -1)
if [ -z "$BALANCE" ] || (( $(echo "$BALANCE < 0.1" | bc -l) )); then
    echo "⚠️  Low SUI balance. Getting testnet tokens..."
    sui client faucet
    sleep 5
fi

# Build contracts
echo "🔨 Building Move contracts..."
sui move build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy contracts
    echo "📤 Deploying to Sui testnet..."
    DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json)
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        
        # Extract package ID
        PACKAGE_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
        
        echo "📝 Contract Information:"
        echo "   Package ID: $PACKAGE_ID"
        echo "   Network: Sui Testnet"
        echo ""
        echo "🔧 Next steps:"
        echo "1. Update frontend/src/utils/constants.ts with the Package ID"
        echo "2. Replace CONTRACTS.PACKAGE_ID with: '$PACKAGE_ID'"
        echo ""
        echo "📋 Copy this Package ID:"
        echo "$PACKAGE_ID"
    else
        echo "❌ Deployment failed. Check the error messages above."
        exit 1
    fi
else
    echo "❌ Build failed. Please fix the compilation errors."
    exit 1
fi
