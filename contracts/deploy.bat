@echo off
echo 🚀 Deploying SaveSquad Contracts to Sui Testnet
echo ================================================

REM Check if we're in the contracts directory
if not exist "Move.toml" (
    echo ❌ Please run this script from the contracts directory
    exit /b 1
)

REM Check if Sui CLI is installed
sui --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Sui CLI is not installed. Please install it first:
    echo cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
    exit /b 1
)

REM Set up testnet environment
echo 🔧 Setting up Sui testnet environment...
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443 2>nul
sui client switch --env testnet

REM Request testnet tokens
echo 💰 Requesting testnet SUI tokens...
sui client faucet

REM Build contracts
echo 🔨 Building Move contracts...
sui move build

if errorlevel 1 (
    echo ❌ Build failed. Please fix the compilation errors.
    exit /b 1
)

echo ✅ Build successful!

REM Deploy contracts
echo 📤 Deploying to Sui testnet...
sui client publish --gas-budget 100000000

if errorlevel 1 (
    echo ❌ Deployment failed. Check the error messages above.
    exit /b 1
)

echo 🎉 Deployment successful!
echo.
echo 🔧 Next steps:
echo 1. Copy the Package ID from the deployment output above
echo 2. Update frontend/src/utils/constants.ts with the Package ID
echo 3. Replace CONTRACTS.PACKAGE_ID with your actual Package ID
echo.
echo 📱 Then restart your frontend development server
