import { useState } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Coins, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react'

import { CONTRACTS, MIN_DEPOSIT } from '../utils/constants'
import { formatSui, formatTimeRemaining, cn } from '../utils'

interface WeeklyDepositProps {
  squadId: string
  weeklyTarget: string
  currentStreak: number
  timeUntilNextWeek: number
  hasDepositedThisWeek: boolean
  onDepositComplete: () => void
}

export default function WeeklyDeposit({
  squadId,
  weeklyTarget,
  currentStreak,
  timeUntilNextWeek,
  hasDepositedThisWeek,
  onDepositComplete
}: WeeklyDepositProps) {
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const [loading, setLoading] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleDeposit = async (amount?: string) => {
    if (!currentAccount || hasDepositedThisWeek) return

    setLoading(true)
    try {
      const depositAmount = amount || weeklyTarget
      const amountInMist = BigInt(parseFloat(depositAmount) * 1_000_000_000)

      // Check if contracts are deployed
      if (CONTRACTS.PACKAGE_ID === '0x0') {
        console.warn('Contracts not deployed yet')
        alert('Contracts not deployed yet. Please deploy contracts first.')
        setLoading(false)
        return
      }

      const tx = new Transaction()
      
      // Create coin for the deposit
      const [coin] = tx.splitCoins(tx.gas, [amountInMist])
      
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.SQUAD_MODULE}::make_deposit`,
        arguments: [
          tx.object(squadId),
          coin,
          tx.object('0x6'), // Clock object ID
        ],
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            console.log('Weekly deposit successful')
            onDepositComplete()
          },
          onError: (error) => {
            console.error('Weekly deposit failed:', error)
          }
        }
      )
    } catch (error) {
      console.error('Error making weekly deposit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomDeposit = () => {
    if (customAmount && parseFloat(customAmount) > 0) {
      handleDeposit(customAmount)
    }
  }

  const isTimeToDeposit = timeUntilNextWeek > 0
  const canDeposit = isTimeToDeposit && !hasDepositedThisWeek

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Deposit</h3>
        <div className="flex items-center space-x-2">
          {hasDepositedThisWeek ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Clock className="w-5 h-5 text-orange-600" />
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className={cn(
        "rounded-lg p-4 mb-4",
        hasDepositedThisWeek 
          ? "bg-green-50 border border-green-200" 
          : canDeposit 
            ? "bg-blue-50 border border-blue-200"
            : "bg-red-50 border border-red-200"
      )}>
        {hasDepositedThisWeek ? (
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Deposit Complete! 🎉
              </p>
              <p className="text-sm text-green-600">
                You've maintained your {currentStreak}-week streak
              </p>
            </div>
          </div>
        ) : canDeposit ? (
          <div className="flex items-center">
            <Coins className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Time to make your weekly deposit!
              </p>
              <p className="text-sm text-blue-600">
                {formatTimeRemaining(timeUntilNextWeek)} left to maintain streak
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Deposit window closed
              </p>
              <p className="text-sm text-red-600">
                Wait for next week to start a new streak
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Options */}
      {canDeposit && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Weekly Target</p>
              <p className="text-sm text-gray-600">{formatSui(BigInt(parseFloat(weeklyTarget) * 1_000_000_000))} SUI</p>
            </div>
            <button
              onClick={() => handleDeposit()}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Processing...' : 'Deposit Target'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Custom Amount
                </span>
                <span className="text-sm text-gray-500">
                  {showCustomInput ? 'Hide' : 'Show'}
                </span>
              </div>
            </button>

            {showCustomInput && (
              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount in SUI"
                    className="flex-1 input"
                  />
                  <button
                    onClick={handleCustomDeposit}
                    disabled={loading || !customAmount || parseFloat(customAmount) <= 0}
                    className="ml-2 btn btn-primary"
                  >
                    Deposit
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Minimum: {formatSui(MIN_DEPOSIT)} SUI
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Week Countdown */}
      {!canDeposit && !hasDepositedThisWeek && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600">
              Next deposit window opens in {formatTimeRemaining(timeUntilNextWeek)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
