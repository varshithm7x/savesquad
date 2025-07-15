# SaveSquad Real Backend Implementation Guide

## 🎯 Overview
This guide transforms SaveSquad from mock data to a production-ready dApp with real Sui blockchain integration and optional backend services.

## 🔧 Phase 1: Remove Mock Data (COMPLETED)

### ✅ Changes Made:
- Set `MOCK_MODE = false` in constants.ts
- Removed `mockData.ts` file
- Updated Dashboard to use real contract calls
- Fixed contract utility functions syntax
- Added deployment checks in components

### 🔍 Remaining Mock Usage:
The following components still need mock data removal:
- `SquadList.tsx` 
- `SquadMembers.tsx`
- `RewardsPanel.tsx`
- `ClaimPage.tsx`

## 🚀 Phase 2: Contract Deployment

### Prerequisites:
```bash
# Install Sui CLI
# Windows: Download from https://github.com/MystenLabs/sui/releases
# Or use package manager

# Get testnet SUI
sui client faucet
```

### Deploy Contracts:
```bash
cd contracts
sui client publish --gas-budget 100000000 .
```

### Update Constants:
After deployment, update `frontend/src/utils/constants.ts`:
```typescript
export const CONTRACTS = {
  PACKAGE_ID: '0x[YOUR_PACKAGE_ID]',  // From deployment output
  SQUAD_MODULE: 'squad',
  REWARDS_MODULE: 'rewards',
  NFT_MODULE: 'nft',
}

// Add shared objects from deployment
export const SHARED_OBJECTS = {
  TREASURY_ID: '0x[TREASURY_OBJECT_ID]',
  NFT_REGISTRY_ID: '0x[REGISTRY_OBJECT_ID]',
  CLOCK_ID: '0x0000000000000000000000000000000000000000000000000000000000000006', // System clock
}
```

## 🏗️ Phase 3: Backend Architecture (Optional)

### Option A: Serverless Backend (Recommended)
```
SaveSquad Frontend (React)
    ↓
Sui Blockchain (Primary Data)
    ↓
Serverless Functions (Vercel/Netlify)
    ↓
Database (Supabase/PlanetScale)
```

### Option B: Traditional Backend
```
SaveSquad Frontend (React)
    ↓
Express.js API Server
    ↓
PostgreSQL Database
    ↓
Sui Blockchain Integration
```

## 📊 Backend Services Needed

### 1. User Analytics Service
```typescript
// Track user behavior, squad performance
interface UserAnalytics {
  totalDeposits: number
  streakHistory: number[]
  squadPerformance: SquadStats[]
  nftCollection: NFTRecord[]
}
```

### 2. Notification Service
```typescript
// Push notifications for deposits, rewards
interface NotificationService {
  sendDepositReminder(userAddress: string): void
  sendRewardNotification(userAddress: string, amount: number): void
  sendMilestoneAlert(userAddress: string, milestone: string): void
}
```

### 3. Leaderboard Service
```typescript
// Global and squad-specific leaderboards
interface LeaderboardEntry {
  userAddress: string
  totalSaved: number
  longestStreak: number
  nftCount: number
  rank: number
}
```

## 🔄 Real-Time Features

### 1. Squad Activity Feed
```typescript
// Real-time updates using WebSockets or Server-Sent Events
interface ActivityFeed {
  deposits: DepositEvent[]
  rewards: RewardEvent[]
  milestones: MilestoneEvent[]
}
```

### 2. Live Squad Statistics
```typescript
// Real-time squad performance metrics
interface LiveSquadStats {
  totalPoolValue: string
  activeMembers: number
  weeklyProgress: number
  averageDeposit: string
}
```

## 🗄️ Database Schema

### Core Tables:
```sql
-- Users table
CREATE TABLE users (
  address VARCHAR(66) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  total_deposited BIGINT DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  nft_count INTEGER DEFAULT 0
);

-- Squads table  
CREATE TABLE squads (
  id VARCHAR(66) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  creator_address VARCHAR(66) NOT NULL,
  weekly_goal BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Squad members table
CREATE TABLE squad_members (
  squad_id VARCHAR(66) NOT NULL,
  user_address VARCHAR(66) NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  current_streak INTEGER DEFAULT 0,
  total_deposited BIGINT DEFAULT 0,
  PRIMARY KEY (squad_id, user_address)
);

-- Deposits table
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  squad_id VARCHAR(66) NOT NULL,
  user_address VARCHAR(66) NOT NULL,
  amount BIGINT NOT NULL,
  week_number INTEGER NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rewards table
CREATE TABLE rewards (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(66) NOT NULL,
  squad_id VARCHAR(66) NOT NULL,
  amount BIGINT NOT NULL,
  week_number INTEGER NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NFTs table
CREATE TABLE nfts (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(66) NOT NULL,
  squad_id VARCHAR(66) NOT NULL,
  nft_object_id VARCHAR(66) NOT NULL,
  milestone_type VARCHAR(50) NOT NULL,
  streak_achieved INTEGER NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

### 1. User Management
```typescript
GET /api/users/:address - Get user profile
POST /api/users - Create/update user profile
GET /api/users/:address/stats - Get user statistics
```

### 2. Squad Management
```typescript
GET /api/squads - List all squads
GET /api/squads/:id - Get squad details
POST /api/squads - Create new squad
PUT /api/squads/:id/join - Join squad
GET /api/squads/:id/members - Get squad members
```

### 3. Deposits & Rewards
```typescript
GET /api/deposits/:squadId - Get squad deposits
POST /api/deposits - Record new deposit
GET /api/rewards/:address - Get user rewards
POST /api/rewards/claim - Claim rewards
```

### 4. Analytics
```typescript
GET /api/analytics/leaderboard - Global leaderboard
GET /api/analytics/squad/:id - Squad analytics
GET /api/analytics/user/:address - User analytics
```

## 🌐 Deployment Strategy

### Frontend Deployment (Vercel/Netlify)
```bash
# Build and deploy frontend
npm run build
# Deploy to Vercel/Netlify
```

### Backend Deployment Options:

#### Option A: Serverless (Vercel Functions)
```typescript
// api/squads.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle squad operations
}
```

#### Option B: Traditional Server (Railway/Render)
```typescript
// server.js
const express = require('express');
const app = express();
// Set up routes and middleware
```

## 🔐 Security Considerations

### 1. Transaction Verification
```typescript
// Verify on-chain transactions before updating database
async function verifyTransaction(txHash: string): Promise<boolean> {
  const tx = await suiClient.getTransactionBlock({ digest: txHash });
  return tx.effects?.status?.status === 'success';
}
```

### 2. Rate Limiting
```typescript
// Implement rate limiting for API endpoints
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};
```

### 3. Input Validation
```typescript
// Validate all user inputs
import { z } from 'zod';

const DepositSchema = z.object({
  squadId: z.string().length(66),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  userAddress: z.string().length(66)
});
```

## 📈 Performance Optimization

### 1. Caching Strategy
```typescript
// Cache frequently accessed data
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

### 2. Database Indexing
```sql
-- Create indexes for better query performance
CREATE INDEX idx_squad_members_squad_id ON squad_members(squad_id);
CREATE INDEX idx_deposits_user_address ON deposits(user_address);
CREATE INDEX idx_deposits_week_number ON deposits(week_number);
```

## 🧪 Testing Strategy

### 1. Contract Testing
```bash
# Test Move contracts
sui move test
```

### 2. Frontend Testing
```bash
# Run frontend tests
npm test
```

### 3. Backend Testing
```typescript
// API endpoint tests
describe('Squad API', () => {
  it('should create new squad', async () => {
    // Test implementation
  });
});
```

## 🚀 Production Checklist

### Before Launch:
- [ ] Deploy contracts to Sui testnet
- [ ] Update all contract addresses in constants.ts
- [ ] Remove all mock data from components
- [ ] Set up backend database
- [ ] Configure API endpoints
- [ ] Set up monitoring and logging
- [ ] Test wallet connections
- [ ] Test contract interactions
- [ ] Deploy frontend to production
- [ ] Set up SSL certificates
- [ ] Configure domain names

### Monitoring:
- [ ] Set up error tracking (Sentry)
- [ ] Monitor contract events
- [ ] Track user analytics
- [ ] Monitor API performance
- [ ] Set up alerts for failures

## 📚 Resources

### Documentation:
- [Sui Developer Docs](https://docs.sui.io/)
- [Sui dApp Kit](https://sui-typescript-docs.vercel.app/dapp-kit)
- [Move Language](https://move-language.github.io/move/)

### Tools:
- [Sui Explorer](https://explorer.sui.io/)
- [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet)
- [Postman](https://www.postman.com/) for API testing

This guide provides a complete roadmap for transforming SaveSquad from a mock-data prototype to a production-ready dApp with real blockchain integration and robust backend services.
