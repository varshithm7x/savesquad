// Mock data for demo purposes when blockchain interactions fail or in demo mode

export interface MockSquad {
  id: string
  name: string
  creator: string
  members: number
  totalPool: string
  weeklyTarget: string
  isActive: boolean
  userIsMember: boolean
}

export interface MockUserStats {
  totalDeposited: string
  currentStreak: number
  squadTokensBalance: string
  nftsEarned: number
  squadCount: number
  weeklyStreakCount: number
  totalSquadTokens: string
}

export const MOCK_SQUADS: MockSquad[] = [
  {
    id: 'demo-squad-1',
    name: 'College Savings Squad',
    creator: '0x1234...5678',
    members: 6,
    totalPool: '1.25',
    weeklyTarget: '0.005',
    isActive: true,
    userIsMember: true,
  },
  {
    id: 'demo-squad-2', 
    name: 'Emergency Fund Warriors',
    creator: '0x9876...4321',
    members: 4,
    totalPool: '0.87',
    weeklyTarget: '0.01',
    isActive: true,
    userIsMember: false,
  },
  {
    id: 'demo-squad-3',
    name: 'Vacation Savers',
    creator: '0xabcd...efgh',
    members: 8,
    totalPool: '2.15',
    weeklyTarget: '0.008',
    isActive: true,
    userIsMember: false,
  },
  {
    id: 'demo-squad-4',
    name: 'Crypto Builders',
    creator: '0xfeed...beef',
    members: 3,
    totalPool: '0.45',
    weeklyTarget: '0.003',
    isActive: true,
    userIsMember: true,
  }
]

export const MOCK_USER_STATS: MockUserStats = {
  totalDeposited: '0.125',
  currentStreak: 7,
  squadTokensBalance: '45.50',
  nftsEarned: 2,
  squadCount: 2,
  weeklyStreakCount: 7,
  totalSquadTokens: '45.50',
}

export const MOCK_RECENT_ACTIVITY = [
  {
    id: '1',
    type: 'deposit',
    amount: '0.005',
    squad: 'College Savings Squad',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: '2', 
    type: 'reward',
    amount: '10.0',
    squad: 'College Savings Squad',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: '3',
    type: 'nft',
    amount: '1',
    squad: 'Crypto Builders',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
  }
]

export const MOCK_MILESTONES = [
  {
    type: 'Bronze',
    requirement: 4,
    name: 'Bronze Streak Badge',
    description: 'Complete 4 weeks of consistent deposits',
    isUnlocked: true,
    isClaimed: true,
  },
  {
    type: 'Silver',
    requirement: 8,
    name: 'Silver Streak Badge', 
    description: 'Complete 8 weeks of consistent deposits',
    isUnlocked: false,
    isClaimed: false,
  },
  {
    type: 'Gold',
    requirement: 12,
    name: 'Gold Streak Badge',
    description: 'Complete 12 weeks of consistent deposits',
    isUnlocked: false,
    isClaimed: false,
  },
  {
    type: 'Diamond',
    requirement: 24,
    name: 'Diamond Streak Badge',
    description: 'Complete 24 weeks of consistent deposits',
    isUnlocked: false,
    isClaimed: false,
  }
]