import { useState } from 'react'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { Users, Coins, Trophy, Target } from 'lucide-react'

import SquadList from './components/SquadList'
import CreateSquad from './components/CreateSquad'
import Dashboard from './components/Dashboard'
import RewardsPanel from './components/RewardsPanel'
import WalletStatus from './components/WalletStatus'
import WalletDebug from './debug/WalletDebug'

function App() {
  const currentAccount = useCurrentAccount()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'squads' | 'create' | 'rewards'>('dashboard')

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">SaveSquad</h1>
            <p className="text-gray-600 text-lg">
              Join the student savings revolution on Sui blockchain
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your Sui wallet to start saving with your squad and earning rewards!
            </p>
            <ConnectButton className="btn btn-primary w-full" />
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="card p-4">
              <Coins className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Earn Tokens</p>
            </div>
            <div className="card p-4">
              <Trophy className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Collect NFTs</p>
            </div>
            <div className="card p-4">
              <Target className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Build Streaks</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SaveSquad</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${
                  activeTab === 'dashboard' 
                    ? 'text-primary-600 border-primary-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                } border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('squads')}
                className={`${
                  activeTab === 'squads' 
                    ? 'text-primary-600 border-primary-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                } border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
              >
                Squads
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`${
                  activeTab === 'create' 
                    ? 'text-primary-600 border-primary-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                } border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
              >
                Create Squad
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`${
                  activeTab === 'rewards' 
                    ? 'text-primary-600 border-primary-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                } border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
              >
                Rewards
              </button>
            </nav>
            
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WalletStatus />
        <WalletDebug />
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'squads' && <SquadList />}
        {activeTab === 'create' && <CreateSquad />}
        {activeTab === 'rewards' && <RewardsPanel />}
      </main>
    </div>
  )
}

export default App
