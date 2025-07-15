import { useState, useEffect } from 'react'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { Trophy, Gift, Coins, Star, Medal, Crown, Gem } from 'lucide-react'

import { cn } from '../utils'
import { MILESTONES } from '../utils/constants'

interface RewardData {
  squadTokensBalance: string
  totalTokensEarned: string
  currentStreak: number
  canClaimReward: boolean
  nextMilestone: { name: string, requirement: number, reward: string }
  ownedNFTs: NFTData[]
}

interface NFTData {
  id: string
  name: string
  type: 'Bronze' | 'Silver' | 'Gold' | 'Diamond'
  streakAchieved: number
  mintedAt: number
}

export default function RewardsPanel() {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const [rewardData] = useState<RewardData>({
    squadTokensBalance: '15.50',
    totalTokensEarned: '42.75',
    currentStreak: 3,
    canClaimReward: true,
    nextMilestone: { name: 'Bronze', requirement: 4, reward: 'Bronze Badge NFT' },
    ownedNFTs: [
      {
        id: '0x123',
        name: 'SaveSquad Bronze Streak Badge',
        type: 'Bronze',
        streakAchieved: 4,
        mintedAt: Date.now() - 86400000
      }
    ]
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load user's reward data from contracts
    // This would make actual contract calls
  }, [currentAccount, suiClient])

  const handleClaimReward = async () => {
    if (!currentAccount || !rewardData.canClaimReward) return
    
    setLoading(true)
    try {
      // Implement claim reward transaction
      console.log('Claiming streak reward...')
      // Update UI after successful claim
    } catch (error) {
      console.error('Error claiming reward:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMintNFT = async () => {
    if (!currentAccount) return
    
    setLoading(true)
    try {
      // Implement mint NFT transaction
      console.log('Minting milestone NFT...')
      // Update UI after successful mint
    } catch (error) {
      console.error('Error minting NFT:', error)
    } finally {
      setLoading(false)
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
      case 'Bronze': return 'text-orange-600 bg-orange-100'
      case 'Silver': return 'text-gray-600 bg-gray-100'
      case 'Gold': return 'text-yellow-600 bg-yellow-100'
      case 'Diamond': return 'text-purple-600 bg-purple-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Rewards & Achievements</h2>
        <p className="text-gray-600">Track your progress and claim your earnings</p>
      </div>

      {/* Token Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">SQUAD Token Balance</h3>
            <Coins className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {rewardData.squadTokensBalance} SQUAD
              </p>
              <p className="text-sm text-gray-600">
                Total earned: {rewardData.totalTokensEarned} SQUAD
              </p>
            </div>
            
            {rewardData.canClaimReward && (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Streak Reward Available</span>
                  <span className="text-sm font-bold text-blue-600">+2.5 SQUAD</span>
                </div>
                <button
                  onClick={handleClaimReward}
                  disabled={loading}
                  className="btn btn-primary w-full text-sm"
                >
                  {loading ? 'Claiming...' : 'Claim Reward'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
            <Gift className="w-6 h-6 text-green-600" />
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold text-green-600 mb-1">
                {rewardData.currentStreak} weeks
              </p>
              <p className="text-sm text-gray-600">
                Keep it up to reach {rewardData.nextMilestone.name} milestone!
              </p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress to {rewardData.nextMilestone.name}</span>
                <span className="font-medium">
                  {rewardData.currentStreak}/{rewardData.nextMilestone.requirement}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((rewardData.currentStreak / rewardData.nextMilestone.requirement) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Milestone Progress</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(MILESTONES).map(([name, weeks]) => {
            const achieved = rewardData.currentStreak >= weeks
            const current = rewardData.currentStreak === weeks
            const Icon = getMilestoneIcon(name)
            
            return (
              <div
                key={name}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  achieved 
                    ? 'border-green-500 bg-green-50' 
                    : current
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                )}
              >
                <div className="text-center">
                  <Icon className={cn(
                    'w-8 h-8 mx-auto mb-2',
                    achieved 
                      ? 'text-green-600' 
                      : current
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  )} />
                  <h4 className={cn(
                    'font-semibold mb-1',
                    achieved ? 'text-green-900' : 'text-gray-700'
                  )}>
                    {name}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">{weeks} weeks</p>
                  
                  {achieved && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Completed
                    </div>
                  )}
                  
                  {current && !achieved && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      🎯 In Progress
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {rewardData.currentStreak >= rewardData.nextMilestone.requirement && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-yellow-800">
                  🎉 {rewardData.nextMilestone.name} Milestone Achieved!
                </h4>
                <p className="text-sm text-yellow-700">
                  You can now mint your {rewardData.nextMilestone.reward}
                </p>
              </div>
              <button
                onClick={handleMintNFT}
                disabled={loading}
                className="btn btn-secondary"
              >
                {loading ? 'Minting...' : 'Mint NFT'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NFT Collection */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">NFT Collection</h3>
        
        {rewardData.ownedNFTs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewardData.ownedNFTs.map((nft) => {
              const Icon = getMilestoneIcon(nft.type)
              const colorClass = getMilestoneColor(nft.type)
              
              return (
                <div key={nft.id} className="card p-4 hover:shadow-lg transition-shadow">
                  <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3', colorClass)}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-1">{nft.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {nft.streakAchieved} week streak
                    </p>
                    <p className="text-xs text-gray-500">
                      Minted {new Date(nft.mintedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No NFTs Yet</h4>
            <p className="text-gray-600">
              Complete milestones to earn exclusive SaveSquad NFT badges!
            </p>
          </div>
        )}
      </div>

      {/* Rewards Info */}
      <div className="card p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Rewards Work</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">SQUAD Tokens</h4>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Earn tokens for each weekly deposit</li>
              <li>• Bonus tokens for maintaining streaks</li>
              <li>• Higher rewards for longer streaks</li>
              <li>• Squad creators get 10% bonus</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">NFT Badges</h4>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Non-transferable achievement badges</li>
              <li>• Unlock at 4, 8, 12, and 24 week milestones</li>
              <li>• Show off your savings dedication</li>
              <li>• Future utility in SaveSquad ecosystem</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
