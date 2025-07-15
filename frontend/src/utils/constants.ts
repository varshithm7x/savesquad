// SaveSquad contract addresses and configuration
export const CONTRACTS = {
  PACKAGE_ID: '0xb57ad8a526669ccd0ecead77f666368fa068e91d0ca488af389e0533b150f892',
  SQUAD_MODULE: 'squad',
  REWARDS_MODULE: 'rewards', 
  NFT_MODULE: 'nft',
}

export const NETWORK = 'testnet'

// Demo mode - set to true to show working features without wallet
export const DEMO_MODE = true

// Development mode - set to true to use mock data when contracts fail
export const MOCK_MODE = false

// Minimum deposit in MIST (0.001 SUI)
export const MIN_DEPOSIT = 1_000_000n

// Squad settings
export const MAX_SQUAD_SIZE = 10
export const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000

// NFT milestone requirements
export const MILESTONES = {
  BRONZE: 4,
  SILVER: 8,
  GOLD: 12,
  DIAMOND: 24,
} as const

// Token decimals
export const SUI_DECIMALS = 9
export const SQUAD_DECIMALS = 6
