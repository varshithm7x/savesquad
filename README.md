# SaveSquad 🎯 - Sui Blockchain Savings dApp

A decentralized savings application built on the Sui blockchain that gamifies group savings through squads, weekly deposits, and NFT rewards.

## 🌟 Features

### 🏆 Core Gameplay
- **Squad Formation**: Create or join savings squads with up to 10 members
- **Weekly Deposits**: Minimum 0.001 SUI weekly deposits to maintain streaks
- **Streak System**: Build consistency with weekly saving streaks
- **Social Accountability**: Save together with friends for motivation

### 🎁 Rewards System
- **SQUAD Tokens**: Earn custom tokens for consistent saving
  - Base rewards for each deposit
  - Bonus multipliers for longer streaks
  - Special creator bonuses (10% extra)
- **Milestone NFTs**: Non-transferable achievement badges
  - Bronze (4 weeks), Silver (8 weeks), Gold (12 weeks), Diamond (24 weeks)
  - Showcase your savings dedication

## 🚀 Live Demo

[Visit SaveSquad dApp](https://savesquad-dapp.vercel.app) *(Update with your actual Vercel URL)*
  - Future utility in SaveSquad ecosystem

### 🔧 Technical Stack
- **Smart Contracts**: Move language on Sui blockchain
- **Frontend**: React with TypeScript
- **Wallet Integration**: Sui dApp Kit (@mysten/dapp-kit)
- **Network**: Sui Testnet
- **Styling**: Tailwind CSS

## Project Structure

```
savesquad/
├── contracts/
│   ├── sources/
│   │   ├── squad.move      # Squad management and deposits
│   │   ├── rewards.move    # SQUAD token minting and rewards
│   │   └── nft.move        # Milestone NFT minting
│   └── Move.toml
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── hooks/         # Custom React hooks
    │   ├── utils/         # Helper functions
    │   └── main.tsx       # App entry point
    ├── package.json
    └── vite.config.ts
```

## Smart Contracts

### squad.move
- Squad creation and management
- Member joining and tracking  
- Weekly deposit handling
- Streak calculation and validation
- Pool management

### rewards.move
- SQUAD token creation and minting
- Streak-based reward calculation
- Reward claiming functionality
- Treasury management

### nft.move
- Milestone NFT creation
- Non-transferable badge system
- Achievement tracking
- Rarity-based rewards

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Sui CLI for contract deployment
- A Sui wallet (Sui Wallet, Suiet, etc.)

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Smart Contract Deployment

1. Install Sui CLI:
```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
```

2. Configure for testnet:
```bash
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
```

3. Get testnet SUI tokens:
```bash
sui client faucet
```

4. Deploy contracts:
```bash
cd contracts
sui move build
sui client publish --gas-budget 100000000
```

5. Update frontend configuration with deployed package ID in `src/utils/constants.ts`

## Game Mechanics

### Squad Creation
- Set squad name and weekly savings target
- Automatic creator privileges with bonus rewards
- Open for up to 10 total members

### Weekly Deposits
- Minimum 0.001 SUI per week
- Must deposit within each 7-day period
- Late deposits reset streak count
- All deposits locked in squad pool

### Streak Rewards
- **1-3 weeks**: Base reward + streak bonus
- **4-7 weeks**: 1.5x multiplier + Bronze NFT eligibility  
- **8-11 weeks**: 2x multiplier + Silver NFT eligibility
- **12+ weeks**: 2.5x multiplier + Gold/Diamond NFT eligibility

### NFT Milestones
- **Bronze Badge** (4 weeks): Entry-level achievement
- **Silver Badge** (8 weeks): Consistent saver status
- **Gold Badge** (12 weeks): Advanced dedication
- **Diamond Badge** (24 weeks): Ultimate savings master

## Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Advanced squad management features
- [ ] Mobile app development
- [ ] Additional reward mechanisms
- [ ] Integration with DeFi protocols
- [ ] Multi-token support
- [ ] Social features and leaderboards

## Support

For questions and support, please open an issue or reach out to our team.

---

**Built with ❤️ for the Sui ecosystem**
