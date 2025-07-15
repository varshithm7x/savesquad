import { useState, useEffect } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Trophy, Medal, Star, Crown, Gem, Gift, CheckCircle, Lock } from 'lucide-react'

import { cn } from '../utils'
import { CONTRACTS, CONTRACT_OBJECTS, MILESTONES } from '../utils/constants'

interface NFTMilestone {
  type: 'Bronze' | 'Silver' | 'Gold' | 'Diamond'
  requirement: number
  name: string
  description: string
  isUnlocked: boolean
  isClaimed: boolean
  canClaim: boolean
}

interface ClaimPageProps {
  currentStreak: number
  squadTokensBalance: string
  canClaimReward: boolean
  squadId: string
  onClaimComplete: () => void
}

export default function ClaimPage({ 
  currentStreak, 
  squadTokensBalance, 
  canClaimReward,
  squadId,
  onClaimComplete 
}: ClaimPageProps) {
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const [loading, setLoading] = useState(false)
  const [claimingType, setClaimingType] = useState<'tokens' | 'nft' | null>(null)
  const [milestones, setMilestones] = useState<NFTMilestone[]>([])

  useEffect(() => {
    initializeMilestones()
  }, [currentStreak])

  const initializeMilestones = () => {
    const allMilestones: NFTMilestone[] = [
      {
        type: 'Bronze',
        requirement: MILESTONES.BRONZE,
        name: 'Bronze Streak Badge',
        description: 'Complete 4 weeks of consistent deposits',
        isUnlocked: currentStreak >= MILESTONES.BRONZE,
        isClaimed: false,
        canClaim: currentStreak >= MILESTONES.BRONZE
      },
      {
        type: 'Silver',
        requirement: MILESTONES.SILVER,
        name: 'Silver Streak Badge',
        description: 'Complete 8 weeks of consistent deposits',
        isUnlocked: currentStreak >= MILESTONES.SILVER,
        isClaimed: false,
        canClaim: currentStreak >= MILESTONES.SILVER
      },
      {
        type: 'Gold',
        requirement: MILESTONES.GOLD,
        name: 'Gold Streak Badge',
        description: 'Complete 12 weeks of consistent deposits',
        isUnlocked: currentStreak >= MILESTONES.GOLD,
        isClaimed: false,
        canClaim: currentStreak >= MILESTONES.GOLD
      },
      {
        type: 'Diamond',
        requirement: MILESTONES.DIAMOND,
        name: 'Diamond Streak Badge',
        description: 'Complete 24 weeks of consistent deposits',
        isUnlocked: currentStreak >= MILESTONES.DIAMOND,
        isClaimed: false,
        canClaim: currentStreak >= MILESTONES.DIAMOND
      }
    ]

    // TODO: Check owned NFTs from blockchain when contracts are deployed
    // For now, all NFTs are claimable if unlocked
    setMilestones(allMilestones)
  }

  const handleClaimTokens = async () => {
    if (!currentAccount || !canClaimReward) return
    
    setClaimingType('tokens')
    setLoading(true)
    
    try {
      // Contracts deployment check
      if (CONTRACTS.PACKAGE_ID === '0x0') {
        console.warn('Contracts not deployed yet');
        alert('Contracts not deployed yet. Please deploy contracts first.');
        return;
      }
      
      const tx = new Transaction()
      
      // Get the actual treasury ID from our deployed contracts
      const treasuryId = CONTRACT_OBJECTS.TREASURY
      
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.REWARDS_MODULE}::claim_rewards`,
        arguments: [
          tx.object(treasuryId),
          tx.object(squadId),
          tx.object('0x6'), // Clock object
        ],
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            console.log('Tokens claimed successfully')
            onClaimComplete()
          },
          onError: (error) => {
            console.error('Error claiming tokens:', error)
          }
        }
      )
    } catch (error) {
      console.error('Error claiming tokens:', error)
    } finally {
      setLoading(false)
      setClaimingType(null)
    }
  }

  const handleClaimNFT = async (milestone: NFTMilestone) => {
    if (!currentAccount || !milestone.canClaim || milestone.isClaimed) return
    
    setClaimingType('nft')
    setLoading(true)
    
    try {
      // Contracts deployment check
      if (CONTRACTS.PACKAGE_ID === '0x0') {
        console.warn('Contracts not deployed yet');
        alert('Contracts not deployed yet. Please deploy contracts first.');
        return;
      }
      
      const tx = new Transaction()
      
      const registryId = '0x1234567890123456789012345678901234567890123456789012345678901234'
      const squadId = '0x1234567890123456789012345678901234567890123456789012345678901234'
      
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.NFT_MODULE}::mint_milestone_nft`,
        arguments: [
          tx.object(registryId),
          tx.object(squadId),
          tx.object('0x6'), // Clock object
        ],
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            console.log('NFT minted successfully')
            onClaimComplete()
          },
          onError: (error) => {
            console.error('Error minting NFT:', error)
          }
        }
      )
    } catch (error) {
      console.error('Error claiming NFT:', error)
    } finally {
      setLoading(false)
      setClaimingType(null)
    }
  }

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'Bronze': return Medal
      case 'Silver': return Star
      case 'Gold': return Crown
      case 'Diamond': return Gem
      default: return Trophy
    }
  }

  const getMilestoneColor = (type: string) => {
    switch (type) {
      case 'Bronze': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'Silver': return 'text-gray-600 bg-gray-100 border-gray-200'
      case 'Gold': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'Diamond': return 'text-purple-600 bg-purple-100 border-purple-200'
      default: return 'text-blue-600 bg-blue-100 border-blue-200'
    }
  }

  const claimableTokens = canClaimReward ? '10.0' : '0.0'
  const claimableNFTs = milestones.filter(m => m.canClaim && !m.isClaimed).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Claim Your Rewards
        </h2>
        <p className="text-gray-600">
          Claim your earned SQUAD tokens and milestone NFTs
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Tokens</h3>
          <p className="text-3xl font-bold text-blue-600">{claimableTokens}</p>
          <p className="text-sm text-gray-600 mt-1">SQUAD tokens ready</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Claimable NFTs</h3>
          <p className="text-3xl font-bold text-purple-600">{claimableNFTs}</p>
          <p className="text-sm text-gray-600 mt-1">New badges available</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Balance</h3>
          <p className="text-3xl font-bold text-green-600">{squadTokensBalance}</p>
          <p className="text-sm text-gray-600 mt-1">SQUAD tokens owned</p>
        </div>
      </div>

      {/* Claim Tokens Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim SQUAD Tokens</h3>
        
        {canClaimReward ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {claimableTokens} SQUAD tokens ready to claim!
                </p>
                <p className="text-xs text-green-600">
                  Reward for maintaining your streak this week
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-gray-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  No tokens available to claim
                </p>
                <p className="text-xs text-gray-600">
                  Make your weekly deposit to earn tokens
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleClaimTokens}
          disabled={!canClaimReward || loading || claimingType === 'tokens'}
          className={cn(
            'btn w-full',
            canClaimReward ? 'btn-primary' : 'btn-secondary'
          )}
        >
          {claimingType === 'tokens' ? 'Claiming...' : 'Claim Tokens'}
        </button>
      </div>

      {/* NFT Milestones Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone NFTs</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((milestone) => {
            const Icon = getMilestoneIcon(milestone.type)
            const colorClass = getMilestoneColor(milestone.type)
            
            return (
              <div 
                key={milestone.type}
                className={cn(
                  'border rounded-lg p-4 transition-all',
                  milestone.isUnlocked 
                    ? colorClass
                    : 'border-gray-200 bg-gray-50'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      milestone.isUnlocked ? colorClass : 'bg-gray-200'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        milestone.isUnlocked ? '' : 'text-gray-400'
                      )} />
                    </div>
                    <div>
                      <h4 className={cn(
                        'font-medium',
                        milestone.isUnlocked ? 'text-gray-900' : 'text-gray-500'
                      )}>
                        {milestone.name}
                      </h4>
                      <p className={cn(
                        'text-sm',
                        milestone.isUnlocked ? 'text-gray-600' : 'text-gray-400'
                      )}>
                        {milestone.requirement} week streak
                      </p>
                    </div>
                  </div>
                  
                  {milestone.isClaimed && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                
                <p className={cn(
                  'text-sm mb-4',
                  milestone.isUnlocked ? 'text-gray-600' : 'text-gray-400'
                )}>
                  {milestone.description}
                </p>
                
                {milestone.isClaimed ? (
                  <div className="flex items-center justify-center py-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-700">Claimed</span>
                  </div>
                ) : milestone.canClaim ? (
                  <button
                    onClick={() => handleClaimNFT(milestone)}
                    disabled={loading || claimingType === 'nft'}
                    className="btn btn-primary w-full"
                  >
                    {claimingType === 'nft' ? 'Minting...' : 'Claim NFT'}
                  </button>
                ) : (
                  <div className="flex items-center justify-center py-2 bg-gray-100 rounded-lg">
                    <Lock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      {currentStreak}/{milestone.requirement} weeks
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

