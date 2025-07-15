// Smart contract interaction utilities for SaveSquad dApp
import { SuiClient, SuiTransactionBlockResponse } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { CONTRACTS } from './constants'

export interface SquadData {
  id: string
  name: string
  description: string
  memberCount: number
  maxMembers: number
  weeklyGoal: string
  creator: string
  createdAt: number
  isActive: boolean
}

export interface UserBalance {
  totalBalance: number
  lockedBalance: number
  transferableBalance: number
  lastRewardWeek: number
}

export interface RewardClaim {
  totalClaimed: number
  lastClaimWeek: number
}

export interface NFTRecord {
  milestoneType: string
  streakAchieved: number
  mintedAt: number
  nftId: string
}

// Squad contract functions
export async function createSquad(
  suiClient: SuiClient,
  signer: Ed25519Keypair,
  name: string,
  weeklyTarget: bigint
): Promise<SuiTransactionBlockResponse> {
  const tx = new Transaction()
  
  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.SQUAD_MODULE}::create_squad`,
    arguments: [
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(name))),
      tx.pure.u64(weeklyTarget),
      tx.object('0x6') // Clock object ID
    ]
  })
  
  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    }
  })
}

export async function joinSquad(
  suiClient: SuiClient,
  signer: Ed25519Keypair,
  squadId: string
): Promise<SuiTransactionBlockResponse> {
  const tx = new Transaction()
  
  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.SQUAD_MODULE}::join_squad`,
    arguments: [
      tx.object(squadId)
    ]
  })
  
  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    }
  })
}

export async function makeWeeklyDeposit(
  suiClient: SuiClient,
  signer: Ed25519Keypair,
  squadId: string,
  amount: bigint
): Promise<SuiTransactionBlockResponse> {
  const tx = new Transaction()
  
  // Split SUI coin for the deposit
  const [coin] = tx.splitCoins(tx.gas, [amount])
  
  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.SQUAD_MODULE}::make_deposit`,
    arguments: [
      tx.object(squadId),
      coin,
      tx.object('0x6') // Clock object ID
    ]
  })
  
  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    }
  })
}

// Rewards contract functions
export async function claimRewards(
  suiClient: SuiClient,
  signer: Ed25519Keypair,
  treasuryId: string,
  squadId: string
): Promise<SuiTransactionBlockResponse> {
  const tx = new Transaction()
  
  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.REWARDS_MODULE}::claim_rewards`,
    arguments: [
      tx.object(treasuryId),
      tx.object(squadId),
      tx.object('0x6') // Clock object ID
    ]
  })
  
  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    }
  })
}

export async function unlockTokensToCoin(
  suiClient: SuiClient,
  signer: Ed25519Keypair,
  lockedTokenId: string
): Promise<SuiTransactionBlockResponse> {
  const tx = new Transaction()
  
  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.REWARDS_MODULE}::unlock_to_coin`,
    arguments: [
      tx.object(lockedTokenId)
    ]
  })
  
  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    }
  })
}

// NFT contract functions
export async function mintMilestoneNFT(
  suiClient: SuiClient,
  signer: Ed25519Keypair,
  registryId: string,
  squadId: string,
  clockId: string
): Promise<SuiTransactionBlockResponse> {
  const tx = new Transaction()
  
  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.NFT_MODULE}::mint_milestone_nft`,
    arguments: [
      tx.object(registryId),
      tx.object(squadId),
      tx.object(clockId)
    ]
  })
  
  return await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer,
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    }
  })
}

// View functions to read contract state
export async function getUserBalance(
  suiClient: SuiClient,
  treasuryId: string,
  userAddress: string
): Promise<UserBalance> {
  try {
    const tx = new Transaction()
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.REWARDS_MODULE}::get_user_balance`,
      arguments: [
        tx.object(treasuryId),
        tx.pure.address(userAddress)
      ]
    })
    
    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: userAddress
    })
    
    // Parse the returned values
    const returnValues = result.results?.[0]?.returnValues
    if (returnValues && returnValues.length >= 3) {
      return {
        totalBalance: Number(returnValues[0][0] || 0),
        lockedBalance: Number(returnValues[1][0] || 0),
        transferableBalance: Number(returnValues[2][0] || 0),
        lastRewardWeek: 0 // Would need separate call for this
      }
    }
  } catch (error) {
    console.error('Error fetching user balance:', error)
  }
  
  return {
    totalBalance: 0,
    lockedBalance: 0,
    transferableBalance: 0,
    lastRewardWeek: 0
  }
}

export async function getUserClaims(
  suiClient: SuiClient,
  treasuryId: string,
  userAddress: string
): Promise<RewardClaim> {
  try {
    const tx = new Transaction()
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.REWARDS_MODULE}::get_user_claims`,
      arguments: [
        tx.object(treasuryId),
        tx.pure.address(userAddress)
      ]
    })
    
    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: userAddress
    })
    
    const returnValues = result.results?.[0]?.returnValues
    if (returnValues && returnValues.length >= 2) {
      return {
        totalClaimed: Number(returnValues[0][0] || 0),
        lastClaimWeek: Number(returnValues[1][0] || 0)
      }
    }
  } catch (error) {
    console.error('Error fetching user claims:', error)
  }
  
  return {
    totalClaimed: 0,
    lastClaimWeek: 0
  }
}

export async function canClaimReward(
  suiClient: SuiClient,
  treasuryId: string,
  squadId: string,
  userAddress: string
): Promise<boolean> {
  try {
    const tx = new Transaction()
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.REWARDS_MODULE}::can_claim_reward`,
      arguments: [
        tx.object(treasuryId),
        tx.object(squadId),
        tx.pure.address(userAddress)
      ]
    })
    
    const result = await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: userAddress
    })
    
    const returnValues = result.results?.[0]?.returnValues
    if (returnValues && returnValues.length >= 1) {
      return Boolean(returnValues[0][0])
    }
  } catch (error) {
    console.error('Error checking reward eligibility:', error)
  }
  
  return false
}

export async function getUserNFTs(
  suiClient: SuiClient,
  registryId: string,
  userAddress: string
): Promise<NFTRecord[]> {
  try {
    const tx = new Transaction()
    tx.moveCall({
      target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.NFT_MODULE}::get_user_nfts`,
      arguments: [
        tx.object(registryId),
        tx.pure.address(userAddress)
      ]
    })
    
    await suiClient.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: userAddress
    })
    
    // Parse NFT records from the result
    // This would need proper parsing based on the actual return format
    return []
  } catch (error) {
    console.error('Error fetching user NFTs:', error)
    return []
  }
}

// Helper function to get the current week number
export function getCurrentWeek(): number {
  const now = Date.now()
  const weekStart = new Date(2025, 0, 1).getTime() // January 1, 2025
  return Math.floor((now - weekStart) / (7 * 24 * 60 * 60 * 1000)) + 1
}

// Helper function to format SQUAD tokens
export function formatSquadTokens(amount: number): string {
  return (amount / 1_000_000).toFixed(2) // 6 decimals
}

// Helper function to format SUI
export function formatSui(amount: bigint): string {
  return (Number(amount) / 1_000_000_000).toFixed(3) // 9 decimals
}
