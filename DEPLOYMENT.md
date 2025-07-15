# SaveSquad Contract Deployment Guide

## Prerequisites

1. **Install Sui CLI**
   ```bash
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
   ```

2. **Set up Sui Testnet**
   ```bash
   sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
   sui client switch --env testnet
   ```

3. **Create/Import Wallet**
   ```bash
   sui client new-address ed25519
   ```

4. **Get Testnet Tokens**
   ```bash
   sui client faucet
   ```

## Deployment Steps

### 1. Build Contracts
```bash
cd contracts
sui move build
```

### 2. Deploy to Testnet
```bash
sui client publish --gas-budget 100000000
```

### 3. Update Frontend Constants
After deployment, update `frontend/src/utils/constants.ts` with the actual package ID:

```typescript
export const CONTRACTS = {
  PACKAGE_ID: '0x[YOUR_PACKAGE_ID]', // Replace with actual package ID
  SQUAD_MODULE: 'squad',
  REWARDS_MODULE: 'rewards', 
  NFT_MODULE: 'nft',
}
```

### 4. Find Shared Objects
After deployment, find the shared objects IDs:
- Treasury object from rewards module
- NFTRegistry object from nft module

You can find these in the deployment output or by running:
```bash
sui client objects
```

## Contract Functions

### Squad Module
- `create_squad(name, description, weekly_goal)` - Create a new squad
- `join_squad(squad_id)` - Join an existing squad
- `make_weekly_deposit(squad_id, coin, clock)` - Make weekly deposit

### Rewards Module
- `claim_rewards(treasury, squad, clock)` - Claim weekly rewards
- `unlock_to_coin(locked_token)` - Convert locked tokens to transferable coins

### NFT Module
- `mint_milestone_nft(registry, squad, clock)` - Mint milestone NFT

## Testing

1. **Frontend Development**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Contract Testing**
   ```bash
   cd contracts
   sui move test
   ```

## Explorer Links

- **Testnet Explorer**: https://testnet.suivision.xyz/
- **Package**: https://testnet.suivision.xyz/package/[PACKAGE_ID]

## Next Steps

1. Deploy contracts to testnet
2. Update frontend constants with actual IDs
3. Test core functionality (create squad, make deposits, claim rewards)
4. Add error handling and loading states
5. Implement proper state management
6. Add more advanced features (invitations, leaderboards, etc.)
