import { useState } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Coins, TrendingUp, Calendar, CheckCircle, AlertCircle } from 'lucide-react'

import { CONTRACTS, DEMO_MODE } from '../utils/constants'
import { MOCK_SQUADS } from '../utils/mockData'

export default function WeeklyDeposit() {
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  
  const [selectedSquad, setSelectedSquad] = useState('')
  const [depositAmount, setDepositAmount] = useState('0.005')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Get user's squads (mock data for now)
  const userSquads = DEMO_MODE ? 
    MOCK_SQUADS.filter(squad => squad.userIsMember) :
    [] // Will be replaced with actual squad data

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSquad || !depositAmount) return
    if (!currentAccount && !DEMO_MODE) return

    setLoading(true)
    
    try {
      if (DEMO_MODE) {
        // Demo mode: simulate deposit
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('Demo: Deposit successful:', {
          squad: selectedSquad,
          amount: depositAmount
        })
        
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        return
      }
      
      const tx = new Transaction()
      
      // Convert deposit amount to MIST (SUI's smallest unit)
      const depositMist = BigInt(parseFloat(depositAmount) * 1_000_000_000)
      
      // Add coin to transaction
      const [coin] = tx.splitCoins(tx.gas, [depositMist])
      
      tx.moveCall({
        package: CONTRACTS.PACKAGE_ID,
        module: CONTRACTS.SQUAD_MODULE,
        function: 'make_weekly_deposit',
        arguments: [
          tx.object(selectedSquad), // Squad object ID
          coin,
          tx.object('0x6'), // Clock object
        ],
      })

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Deposit successful:', result)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
          },
          onError: (error) => {
            console.error('Error making deposit:', error)
          },
        }
      )
    } catch (error) {
      console.error('Transaction error:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedSquadData = userSquads.find(squad => squad.id === selectedSquad)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Coins className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Weekly Deposit</h2>
        <p className="text-gray-600">Make your weekly contribution to stay on track with your savings goals</p>
      </div>

      {userSquads.length === 0 ? (
        /* No Squads State */
        <div className="card p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Squads</h3>
          <p className="text-gray-600 mb-4">You need to join or create a squad before making deposits.</p>
          <div className="flex justify-center space-x-4">
            <button className="btn btn-primary">
              Create Squad
            </button>
            <button className="btn btn-secondary">
              Browse Squads
            </button>
          </div>
        </div>
      ) : (
        /* Deposit Form */
        <div className="card p-8">
          <form onSubmit={handleDeposit} className="space-y-6">
            {/* Squad Selection */}
            <div>
              <label htmlFor="squad" className="block text-sm font-medium text-gray-700 mb-2">
                Select Squad *
              </label>
              <select
                id="squad"
                value={selectedSquad}
                onChange={(e) => setSelectedSquad(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Choose a squad...</option>
                {userSquads.map((squad) => (
                  <option key={squad.id} value={squad.id}>
                    {squad.name} (Target: {squad.weeklyTarget} SUI)
                  </option>
                ))}
              </select>
            </div>

            {/* Squad Info */}
            {selectedSquadData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">{selectedSquadData.name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Weekly Target:</span>
                    <div className="font-medium text-blue-900">{selectedSquadData.weeklyTarget} SUI</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Total Pool:</span>
                    <div className="font-medium text-blue-900">{selectedSquadData.totalPool} SUI</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Members:</span>
                    <div className="font-medium text-blue-900">{selectedSquadData.members} people</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Status:</span>
                    <div className="font-medium text-green-900">Active</div>
                  </div>
                </div>
              </div>
            )}

            {/* Deposit Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount (SUI) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="0.001"
                  step="0.001"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.005"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">SUI</span>
                </div>
              </div>
              {selectedSquadData && (
                <p className="text-xs text-gray-500 mt-1">
                  Squad target: {selectedSquadData.weeklyTarget} SUI per week
                </p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            {selectedSquadData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Select:</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setDepositAmount(selectedSquadData.weeklyTarget)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Target ({selectedSquadData.weeklyTarget} SUI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositAmount((parseFloat(selectedSquadData.weeklyTarget) * 1.5).toFixed(3))}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    1.5x Target
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositAmount((parseFloat(selectedSquadData.weeklyTarget) * 2).toFixed(3))}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    2x Target
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedSquad || !depositAmount}
              className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Deposit...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Coins className="w-5 h-5" />
                  <span>Make Deposit</span>
                </div>
              )}
            </button>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-green-800 font-semibold mb-1">Deposit Successful! 🎉</div>
                <p className="text-green-600 text-sm">Your weekly contribution has been recorded.</p>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Benefits Reminder */}
      <div className="card p-6 bg-green-50 border-green-200">
        <h4 className="font-semibold text-green-900 mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Benefits of Regular Deposits:
        </h4>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• Earn Squad Tokens for every successful deposit</li>
          <li>• Build your weekly streak and unlock bonus rewards</li>
          <li>• Support your squad's collective savings goals</li>
          <li>• Qualify for exclusive NFT rewards</li>
          <li>• Create positive social accountability</li>
        </ul>
      </div>

      {/* Timeline */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Deposit Timeline:
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Every Monday - New week begins</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Monday-Sunday - Make your weekly deposit</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
            <span className="text-gray-700">Sunday 11:59 PM - Week deadline</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
            <span className="text-gray-700">After deadline - Rewards distributed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
