// SaveSquad contract addresses and configuration
export const CONTRACTS = {
  PACKAGE_ID: '0xb57ad8a526669ccd0ecead77f666368fa068e91d0ca488af389e0533b150f892',
  SQUAD_MODULE: 'squad',
  REWARDS_MODULE: 'rewards', 
  NFT_MODULE: 'nft',
}

export const CONTRACT_OBJECTS = {
  TREASURY: "0x232e8e02f7e12aa68eec13c9301e9d254d935be1e15088f67711474fd1db6081",
  NFT_REGISTRY: "0x9e28c7a39cc4af905433ef242f10d586ca5ab7307bc6c7ffa3607b0a2ce5e11f",
  ADMIN_CAP: "0xf07c9fa2912f1d7f08dcb2a783c264394ac13aa3b9e53f0f4af1c9daf043860a",
  SQUAD_TOKEN_METADATA: "0xf3171b91e0d7a414e539eafa2d3a1fcb7de9e7464b9213375c7be4c43a737edf"
}

export const NETWORK = 'testnet'

// Development mode - set to true to use mock data
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
