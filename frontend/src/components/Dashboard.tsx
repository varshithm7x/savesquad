import { useState, useEffect } from 'react'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { TrendingUp, Users, Coins, Clock, Target } from 'lucide-react'

import { cn, getTimeUntilNextWeek, formatTimeRemaining } from '../utils'
import { DEMO_MODE } from '../utils/constants'
import { MOCK_USER_STATS } from '../utils/mockData'

interface DashboardStats {
  totalSquads: number
  totalDeposited: string
  currentStreak: number
  tokensEarned: string
  nextMilestone: { name: string, weeksRemaining: number }
}

export default function Dashboard() {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const [stats, setStats] = useState<DashboardStats>({
    totalSquads: 0,
    totalDeposited: '0.000',
    currentStreak: 0,
    tokensEarned: '0.00',
    nextMilestone: { name: 'Bronze', weeksRemaining: 4 }
  })
  const [timeUntilNextWeek, setTimeUntilNextWeek] = useState<number>(0)

  useEffect(() => {
    if (DEMO_MODE) {
      // Use mock data in demo mode
      setStats({
        totalSquads: MOCK_USER_STATS.squadCount,
        totalDeposited: MOCK_USER_STATS.totalDeposited,
        currentStreak: MOCK_USER_STATS.weeklyStreakCount,
        tokensEarned: MOCK_USER_STATS.totalSquadTokens,
        nextMilestone: { name: 'Bronze', weeksRemaining: 1 }
      })
    } else {
      // Mock data for now - replace with actual contract calls
      setStats({
        totalSquads: 2,
        totalDeposited: '0.024',
        currentStreak: 3,
        tokensEarned: '15.50',
        nextMilestone: { name: 'Bronze', weeksRemaining: 1 }
      })
    }

    // Update countdown every minute
    const interval = setInterval(() => {
      const now = Date.now()
      const squadStart = now - (3 * 7 * 24 * 60 * 60 * 1000) // 3 weeks ago
      setTimeUntilNextWeek(getTimeUntilNextWeek(squadStart, now))
    }, 60000)

    return () => clearInterval(interval)
  }, [currentAccount, suiClient])

  const statCards = [
    {
      title: 'Active Squads',
      value: stats.totalSquads,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Deposited',
      value: `${stats.totalDeposited} SUI`,
      icon: Coins,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} weeks`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'SQUAD Tokens',
      value: stats.tokensEarned,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h2>
        <p className="text-gray-600">
          Keep up your saving streak and earn more rewards with your squad.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={cn('p-3 rounded-full', stat.bgColor)}>
                <stat.icon className={cn('w-6 h-6', stat.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Progress */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Streak Progress</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress to {stats.nextMilestone.name}</span>
                <span className="font-medium">{stats.currentStreak}/4 weeks</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.currentStreak / 4) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Next milestone benefits:</p>
              <ul className="space-y-1">
                <li>• Bronze Badge NFT</li>
                <li>• 15 SQUAD token bonus</li>
                <li>• Exclusive squad features</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Deposit */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Next Deposit</h3>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 mb-1">
                {formatTimeRemaining(timeUntilNextWeek)}
              </p>
              <p className="text-sm text-gray-600">until next week</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Don't break your streak!
              </p>
              <p className="text-xs text-blue-600">
                Make sure to deposit at least 0.001 SUI before the week ends to maintain your {stats.currentStreak}-week streak.
              </p>
            </div>
            
            <button className="btn btn-primary w-full">
              Make Deposit Now
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { type: 'deposit', amount: '0.005 SUI', squad: 'Study Buddies', time: '2 hours ago' },
            { type: 'reward', amount: '2.5 SQUAD', reason: 'Week 3 streak bonus', time: '1 day ago' },
            { type: 'milestone', achievement: 'Bronze Badge NFT', time: '3 days ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  activity.type === 'deposit' ? 'bg-green-500' :
                  activity.type === 'reward' ? 'bg-blue-500' : 'bg-purple-500'
                )} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.type === 'deposit' && `Deposited ${activity.amount} to ${activity.squad}`}
                    {activity.type === 'reward' && `Earned ${activity.amount} tokens`}
                    {activity.type === 'milestone' && `Unlocked ${activity.achievement}`}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
