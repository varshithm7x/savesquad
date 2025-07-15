import { useState, useEffect } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Gift, Star, Coins, Award, Zap, CheckCircle } from 'lucide-react'

import { CONTRACTS, DEMO_MODE } from '../utils/constants'
import { MOCK_USER_STATS } from '../utils/mockData'

interface ClaimableReward {
  id: string
  type: 'tokens' | 'nft' | 'bonus'
  amount: string
  description: string
  week: number
  squad: string
  claimed: boolean
}

export default function ClaimPage() {
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  
  const [claimableRewards, setClaimableRewards] = useState<ClaimableReward[]>([])
  const [claiming, setClaiming] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(!DEMO_MODE)

  useEffect(() => {
    if (DEMO_MODE) {
      // Mock claimable rewards
      setClaimableRewards([
        {
          id: 'reward-1',
          type: 'tokens',
          amount: '12.50',
          description: 'Weekly deposit completion bonus',
          week: 3,
          squad: 'College Savings Squad',
          claimed: false
        },
        {
          id: 'reward-2',
          type: 'nft',
          amount: '1',
          description: 'Three-week streak achievement',
          week: 3,
          squad: 'College Savings Squad',
          claimed: false
        },
        {
          id: 'reward-3',
          type: 'bonus',
          amount: '5.75',
          description: 'Squad leadership bonus',
          week: 2,
          squad: 'Emergency Fund Warriors',
          claimed: true
        },
        {
          id: 'reward-4',
          type: 'tokens',
          amount: '8.25',
          description: 'Perfect attendance bonus',
          week: 2,
          squad: 'College Savings Squad',
          claimed: false
        }
      ])
      setLoading(false)
    } else {
      // TODO: Fetch actual claimable rewards from blockchain
      setLoading(false)
    }
  }, [currentAccount])

  const handleClaim = async (reward: ClaimableReward) => {
    if (!currentAccount && !DEMO_MODE) return

    setClaiming(reward.id)
    
    try {
      if (DEMO_MODE) {
        // Demo mode: simulate claiming
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('Demo: Claimed reward:', reward)
        
        // Update reward as claimed
        setClaimableRewards(prev => 
          prev.map(r => r.id === reward.id ? { ...r, claimed: true } : r)
        )
        
        setSuccess(reward.id)
        setTimeout(() => setSuccess(null), 3000)
        return
      }
      
      const tx = new Transaction()
      
      if (reward.type === 'tokens') {
        tx.moveCall({
          package: CONTRACTS.PACKAGE_ID,
          module: CONTRACTS.REWARDS_MODULE,
          function: 'claim_squad_tokens',
          arguments: [
            tx.object(reward.id), // Reward object ID
          ],
        })
      } else if (reward.type === 'nft') {
        tx.moveCall({
          package: CONTRACTS.PACKAGE_ID,
          module: CONTRACTS.NFT_MODULE,
          function: 'claim_achievement_nft',
          arguments: [
            tx.object(reward.id), // Achievement object ID
          ],
        })
      }

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Reward claimed successfully:', result)
            setClaimableRewards(prev => 
              prev.map(r => r.id === reward.id ? { ...r, claimed: true } : r)
            )
            setSuccess(reward.id)
            setTimeout(() => setSuccess(null), 3000)
          },
          onError: (error) => {
            console.error('Error claiming reward:', error)
          },
        }
      )
    } catch (error) {
      console.error('Transaction error:', error)
    } finally {
      setClaiming(null)
    }
  }

  const unclaimedRewards = claimableRewards.filter(r => !r.claimed)
  const claimedRewards = claimableRewards.filter(r => r.claimed)
  const totalUnclaimedTokens = unclaimedRewards
    .filter(r => r.type === 'tokens' || r.type === 'bonus')
    .reduce((sum, r) => sum + parseFloat(r.amount), 0)

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'tokens': return <Coins className="w-6 h-6 text-yellow-600" />
      case 'nft': return <Award className="w-6 h-6 text-purple-600" />
      case 'bonus': return <Zap className="w-6 h-6 text-blue-600" />
      default: return <Gift className="w-6 h-6 text-gray-600" />
    }
  }

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'tokens': return 'border-yellow-200 bg-yellow-50'
      case 'nft': return 'border-purple-200 bg-purple-50'
      case 'bonus': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your rewards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Claim Rewards</h2>
        <p className="text-gray-600">Collect your earned Squad Tokens, NFTs, and bonus rewards</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <Coins className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{totalUnclaimedTokens.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Unclaimed Tokens</div>
        </div>
        
        <div className="card p-6 text-center">
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{unclaimedRewards.filter(r => r.type === 'nft').length}</div>
          <div className="text-sm text-gray-600">NFTs Available</div>
        </div>
        
        <div className="card p-6 text-center">
          <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{DEMO_MODE ? MOCK_USER_STATS.currentStreak : 0}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
        </div>
      </div>

      {/* Unclaimed Rewards */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Gift className="w-5 h-5 mr-2 text-green-600" />
          Available Rewards ({unclaimedRewards.length})
        </h3>
        
        {unclaimedRewards.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Rewards Available</h4>
            <p className="text-gray-600">Complete weekly deposits to earn rewards!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {unclaimedRewards.map((reward) => (
              <div key={reward.id} className={`border rounded-lg p-4 ${getRewardColor(reward.type)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getRewardIcon(reward.type)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{reward.description}</h4>
                      <p className="text-sm text-gray-600">
                        Week {reward.week} • {reward.squad}
                      </p>
                      <div className="text-lg font-bold text-gray-900 mt-1">
                        {reward.type === 'nft' ? `${reward.amount} NFT` : `${reward.amount} Tokens`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {success === reward.id && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm font-medium">Claimed!</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleClaim(reward)}
                      disabled={claiming === reward.id || success === reward.id}
                      className="btn btn-primary px-6 py-2 disabled:opacity-50"
                    >
                      {claiming === reward.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Claiming...</span>
                        </div>
                      ) : success === reward.id ? (
                        'Claimed!'
                      ) : (
                        'Claim'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claimed Rewards History */}
      {claimedRewards.length > 0 && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            Claimed Rewards ({claimedRewards.length})
          </h3>
          
          <div className="space-y-3">
            {claimedRewards.map((reward) => (
              <div key={reward.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getRewardIcon(reward.type)}
                    <div>
                      <h4 className="font-medium text-gray-900">{reward.description}</h4>
                      <p className="text-sm text-gray-600">
                        Week {reward.week} • {reward.squad}
                      </p>
                      <div className="text-lg font-semibold text-gray-700 mt-1">
                        {reward.type === 'nft' ? `${reward.amount} NFT` : `${reward.amount} Tokens`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm font-medium">Claimed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Rewards Info */}
      <div className="card p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Upcoming Rewards:
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Complete this week's deposit to earn 15+ Squad Tokens</li>
          <li>• Maintain your streak for streak bonus multipliers</li>
          <li>• Reach week 5 to unlock your first achievement NFT</li>
          <li>• Help squad reach monthly goals for bonus rewards</li>
          <li>• Invite friends to earn referral bonuses</li>
        </ul>
      </div>
    </div>
  )
}
