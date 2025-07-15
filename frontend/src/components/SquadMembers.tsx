import { useState, useEffect } from 'react'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { Users, TrendingUp, Crown } from 'lucide-react'

import { formatAddress } from '../utils'
import { CONTRACTS } from '../utils/constants'

interface Member {
  address: string
  joinedAt: number
  totalDeposited: string
  currentStreak: number
  lastDepositWeek: number
  isCreator: boolean
}

interface SquadInfo {
  name: string
  totalPool: string
  weeklyTarget: string
  memberCount: number
}

interface SquadMembersProps {
  squadId: string
}

export default function SquadMembers({ squadId }: SquadMembersProps) {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  
  const [members, setMembers] = useState<Member[]>([])
  const [squadInfo, setSquadInfo] = useState<SquadInfo>({
    name: '',
    totalPool: '0.000',
    weeklyTarget: '0.005',
    memberCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSquadData() {
      if (!currentAccount) return

      try {
        // Check if contracts are deployed
        if (CONTRACTS.PACKAGE_ID === '0x0') {
          console.warn('Contracts not deployed yet')
          setSquadInfo({
            name: 'Demo Squad',
            totalPool: '0.000',
            weeklyTarget: '0.005',
            memberCount: 0
          })
          setMembers([])
          setLoading(false)
          return
        }

        // TODO: Implement real squad data fetching
        setSquadInfo({
          name: 'Loading...',
          totalPool: '0.000',
          weeklyTarget: '0.005',
          memberCount: 0
        })
        setMembers([])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching squad data:', error)
        setLoading(false)
      }
    }

    fetchSquadData()
  }, [squadId, currentAccount, suiClient])

  const formatTimeAgo = (timestamp: number) => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Squad Members</h3>
          <p className="text-sm text-gray-600">{squadInfo.name}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            {squadInfo.memberCount} members
          </div>
        </div>
      </div>

      {CONTRACTS.PACKAGE_ID === '0x0' ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Contracts Not Deployed</h4>
          <p className="text-gray-600">
            Squad member data will be available after contract deployment.
          </p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Members Yet</h4>
          <p className="text-gray-600">
            Be the first to join this squad!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member, index) => (
            <div
              key={member.address}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {index + 1}
                    </span>
                  </div>
                  {member.isCreator && (
                    <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">
                      {formatAddress(member.address)}
                    </p>
                    {member.isCreator && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Creator
                      </span>
                    )}
                    {member.address === currentAccount?.address && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Joined {formatTimeAgo(member.joinedAt)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{member.totalDeposited} SUI</p>
                    <p className="text-gray-500">Total</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="font-medium text-gray-900">{member.currentStreak}</span>
                    </div>
                    <p className="text-gray-500">Streak</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {members.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{squadInfo.totalPool} SUI</p>
              <p className="text-sm text-gray-600">Total Pool</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{squadInfo.weeklyTarget} SUI</p>
              <p className="text-sm text-gray-600">Weekly Target</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.max(...members.map(m => m.currentStreak))}
              </p>
              <p className="text-sm text-gray-600">Best Streak</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
