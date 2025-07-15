import { useState, useEffect } from 'react'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'

import ClaimPage from './ClaimPage'

interface RewardData {
  squadTokensBalance: string
  currentStreak: number
  canClaimReward: boolean
}

export default function RewardsPanel({ squadId = '0x1234567890' }: { squadId?: string }) {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const [rewardData, setRewardData] = useState<RewardData>({
    squadTokensBalance: '0.00',
    currentStreak: 0,
    canClaimReward: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRewardData()
  }, [currentAccount, suiClient])

  const loadRewardData = async () => {
    if (!currentAccount || !suiClient) return
    
    setLoading(true)
    try {
      // TODO: Replace with actual contract calls once deployed
      // For now, using placeholder data
      const mockData = {
        squadTokensBalance: '15.50',
        currentStreak: 3,
        canClaimReward: true,
      }
      setRewardData(mockData)
    } catch (error) {
      console.error('Error loading reward data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimComplete = () => {
    loadRewardData() // Refresh data after claim
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <ClaimPage
      currentStreak={rewardData.currentStreak}
      squadTokensBalance={rewardData.squadTokensBalance}
      canClaimReward={rewardData.canClaimReward}
      squadId={squadId}
      onClaimComplete={handleClaimComplete}
    />
  )
}

