import { useState } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Plus, Users, Target, Clock } from 'lucide-react'

import { CONTRACTS, MIN_DEPOSIT, DEMO_MODE } from '../utils/constants'

export default function CreateSquad() {
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  
  const [formData, setFormData] = useState({
    name: '',
    weeklyTarget: '0.005',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAccount && !DEMO_MODE) return

    setLoading(true)
    
    try {
      if (DEMO_MODE) {
        // Demo mode: simulate squad creation
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate network delay
        console.log('Demo: Squad created successfully:', {
          name: formData.name,
          weeklyTarget: formData.weeklyTarget,
          description: formData.description
        })
        
        // Reset form and show success
        setFormData({ name: '', weeklyTarget: '0.005', description: '' })
        setSuccess(true)
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
        return
      }
      
      const tx = new Transaction()
      
      // Convert weekly target to MIST (SUI's smallest unit)
      const weeklyTargetMist = BigInt(parseFloat(formData.weeklyTarget) * 1_000_000_000)
      
      tx.moveCall({
        package: CONTRACTS.PACKAGE_ID,
        module: CONTRACTS.SQUAD_MODULE,
        function: 'create_squad',
        arguments: [
          tx.pure.string(formData.name),
          tx.pure.u64(weeklyTargetMist),
          tx.object('0x6'), // Clock object
        ],
      })

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Squad created successfully:', result)
            // Reset form
            setFormData({ name: '', weeklyTarget: '0.005', description: '' })
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
          },
          onError: (error) => {
            console.error('Error creating squad:', error)
          },
        }
      )
    } catch (error) {
      console.error('Transaction error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const weeklyTargetInMist = BigInt(parseFloat(formData.weeklyTarget || '0') * 1_000_000_000)
  const isValidTarget = weeklyTargetInMist >= MIN_DEPOSIT

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Squad</h2>
        <p className="text-gray-600">Start a savings group and invite friends to join your financial journey</p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Build Community</h3>
          <p className="text-sm text-gray-600">Save together with up to 10 members</p>
        </div>
        
        <div className="card p-4 text-center">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Set Goals</h3>
          <p className="text-sm text-gray-600">Define weekly targets that work for everyone</p>
        </div>
        
        <div className="card p-4 text-center">
          <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Build Streaks</h3>
          <p className="text-sm text-gray-600">Maintain consistency and earn rewards</p>
        </div>
      </div>

      {/* Form */}
      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Squad Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Study Buddies, Future Millionaires"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose a fun, memorable name for your squad
            </p>
          </div>

          <div>
            <label htmlFor="weeklyTarget" className="block text-sm font-medium text-gray-700 mb-2">
              Weekly Target (SUI) *
            </label>
            <input
              type="number"
              id="weeklyTarget"
              name="weeklyTarget"
              required
              min="0.001"
              step="0.001"
              value={formData.weeklyTarget}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="flex justify-between text-xs mt-1">
              <p className={`${isValidTarget ? 'text-gray-500' : 'text-red-500'}`}>
                Minimum: 0.001 SUI per week
              </p>
              <p className="text-gray-500">
                ~${(parseFloat(formData.weeklyTarget || '0') * 52 * 100).toFixed(2)} USD/year
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tell potential members about your squad's goals and vibe..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/200 characters
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Squad Preview:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{formData.name || 'Your Squad Name'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weekly Target:</span>
                <span className="font-medium">{formData.weeklyTarget} SUI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Members:</span>
                <span className="font-medium">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Creator Rewards:</span>
                <span className="font-medium">10% bonus tokens</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formData.name.trim() || !isValidTarget}
            className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Squad...</span>
              </div>
            ) : (
              'Create Squad'
            )}
          </button>
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-green-800 font-semibold mb-1">🎉 Squad Created Successfully!</div>
              <p className="text-green-600 text-sm">Your new squad is ready for members to join.</p>
            </div>
          )}
        </form>
      </div>

      {/* Tips */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Tips for Success:</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Set realistic weekly targets that all members can afford</li>
          <li>• Choose friends who are committed to saving consistently</li>
          <li>• Use social pressure positively to motivate each other</li>
          <li>• Celebrate milestones and achievements together</li>
          <li>• Consider your squad's long-term savings goals</li>
        </ul>
      </div>
    </div>
  )
}
