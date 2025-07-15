# SaveSquad Setup Guide 🎯

Welcome to SaveSquad! This guide will help you set up and run the project locally.

## Quick Start

### Option 1: Windows Users
```bash
# Run the setup script
.\start-dev.bat
```

### Option 2: Mac/Linux Users  
```bash
# Make script executable and run
chmod +x start-dev.sh
./start-dev.sh
```

### Option 3: Manual Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to http://localhost:5173
   - Connect your Sui wallet

## Smart Contract Deployment

### Prerequisites
- Install Sui CLI: `cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui`
- Have a Sui wallet with testnet SUI tokens

### Deploy Contracts

1. **Windows Users**
   ```bash
   cd contracts
   .\deploy.bat
   ```

2. **Mac/Linux Users**
   ```bash
   cd contracts
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Manual Deployment**
   ```bash
   cd contracts
   sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
   sui client switch --env testnet
   sui client faucet
   sui move build
   sui client publish --gas-budget 100000000
   ```

### After Deployment

1. Copy the Package ID from deployment output
2. Update `frontend/src/utils/constants.ts`:
   ```typescript
   export const CONTRACTS = {
     PACKAGE_ID: 'YOUR_PACKAGE_ID_HERE', // Replace with actual Package ID
     // ... rest of config
   }
   ```
3. Restart the frontend development server

## Project Structure

```
savesquad/
├── README.md                 # Main project documentation
├── SETUP.md                 # This setup guide
├── start-dev.sh/.bat        # Development startup scripts
├── contracts/
│   ├── sources/
│   │   ├── squad.move       # Squad management contract
│   │   ├── rewards.move     # Token rewards contract
│   │   └── nft.move         # NFT milestone contract
│   ├── Move.toml            # Move package configuration
│   └── deploy.sh/.bat       # Deployment scripts
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── utils/          # Helper functions and constants
    │   ├── App.tsx         # Main app component
    │   └── main.tsx        # Entry point
    ├── package.json        # Node.js dependencies
    ├── vite.config.ts      # Vite configuration
    └── tailwind.config.js  # Tailwind CSS configuration
```

## Development Workflow

1. **First Time Setup**
   - Clone/download the project
   - Run setup script or manually install dependencies
   - Deploy contracts to testnet
   - Update frontend configuration

2. **Daily Development**
   - Start development server: `npm run dev`
   - Make changes to frontend code
   - Hot reload will update the browser automatically

3. **Contract Changes**
   - Modify Move files in `contracts/sources/`
   - Re-run deployment script
   - Update Package ID in frontend constants

## Troubleshooting

### Common Issues

**Frontend won't start:**
- Make sure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again
- Check for port conflicts (default: 5173)

**Contract deployment fails:**
- Ensure Sui CLI is installed and configured
- Check you have sufficient testnet SUI tokens
- Verify Move.toml configuration

**Wallet connection issues:**
- Make sure you have a Sui wallet extension installed
- Switch to Sui testnet in your wallet
- Clear browser cache and try again

**Transaction failures:**
- Ensure contracts are deployed and Package ID is correct
- Check you have sufficient SUI for gas fees
- Verify wallet is connected to testnet

### Getting Help

1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure correct network configuration (testnet)
4. Review the README.md for detailed information

## What's Included

### Smart Contracts
- **squad.move**: Squad creation, member management, deposits
- **rewards.move**: SQUAD token minting and distribution  
- **nft.move**: Milestone NFT creation and management

### Frontend Features
- Modern React + TypeScript application
- Sui wallet integration with dApp Kit
- Responsive design with Tailwind CSS
- Real-time balance and streak tracking
- Squad management interface
- Rewards and NFT collection display

### Key Functionalities
- Create and join savings squads
- Make weekly SUI deposits
- Track saving streaks
- Earn SQUAD tokens
- Collect milestone NFTs
- View personal dashboard

Ready to start saving with SaveSquad! 🚀
