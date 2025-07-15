import { useState, useEffect } from 'react'
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Search, Users, TrendingUp, Coins, UserPlus } from 'lucide-react'

import { cn, formatAddress } from '../utils'
import { CONTRACTS, DEMO_MODE } from '../utils/constants'
import { MOCK_SQUADS } from '../utils/mockData'

interface Squad {
  id: string
  name: string
  creator: string
  members: number
  totalPool: string
  weeklyTarget: string
  isActive: boolean
  userIsMember: boolean
}

export default function SquadList() {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const [squads, setSquads] = useState<Squad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [joiningSquad, setJoiningSquad] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSquads() {
      if (DEMO_MODE) {
        // Use demo data for immediate functionality
        console.log('Demo mode: Using mock squad data')
        const demoSquads = MOCK_SQUADS.map(squad => ({
          id: squad.id,
          name: squad.name,
          creator: squad.creator,
          members: squad.members,
          totalPool: squad.totalPool,
          weeklyTarget: squad.weeklyTarget,
          isActive: squad.isActive,
          userIsMember: squad.userIsMember,
        })) as Squad[]
        
        setSquads(demoSquads)
        setLoading(false)
        return
      }

      if (!currentAccount || !suiClient) {
        setLoading(false)
        return
      }

      // Check if contracts are deployed
      if (CONTRACTS.PACKAGE_ID === '0x0') {
        console.warn('Contracts not deployed yet')
        setSquads([])
        setLoading(false)
        return
      }

      try {        
        // Query by event to find all created squads
        const events = await suiClient.queryEvents({
          query: {
            MoveEventType: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.SQUAD_MODULE}::SquadCreated`
          },
          limit: 50,
          order: 'descending'
        })
        
        if (events.data.length === 0) {
          console.log('No squads found on blockchain. You can create the first one!')
          setSquads([])
          setLoading(false)
          return
        }

        // Convert events to squad objects and fetch their current state
        const squadPromises = events.data.map(async (event) => {          
          if (event.parsedJson) {
            const squadData = event.parsedJson as any
            try {
              // Fetch the actual squad object
              const squadObject = await suiClient.getObject({
                id: squadData.squad_id,
                options: {
                  showContent: true,
                  showType: true,
                }
              })

              if (squadObject.data?.content && 'fields' in squadObject.data.content) {
                const fields = squadObject.data.content.fields as any
                const membersList = fields.members || []
                const isUserMember = currentAccount ? membersList.includes(currentAccount.address) : false
                
                const squad = {
                  id: squadData.squad_id,
                  name: new TextDecoder().decode(new Uint8Array(fields.name)),
                  creator: fields.creator,
                  members: membersList.length,
                  totalPool: (parseInt(fields.total_pool || '0') / 1_000_000_000).toString(),
                  weeklyTarget: (parseInt(fields.weekly_target) / 1_000_000_000).toString(),
                  isActive: fields.is_active,
                  userIsMember: isUserMember,
                } as Squad
                
                return squad
              }
            } catch (error) {
              console.error('Error fetching squad details:', error)
            }
          }
          return null
        })

        const resolvedSquads = await Promise.all(squadPromises)
        const validSquads = resolvedSquads.filter((squad): squad is Squad => squad !== null)
        
        setSquads(validSquads)
      } catch (error) {
        console.error('Error fetching squads:', error)
        // Fallback to demo data if blockchain fails
        console.log('Falling back to demo data due to blockchain error')
        const demoSquads = MOCK_SQUADS.map(squad => ({
          id: squad.id,
          name: squad.name,
          creator: squad.creator,
          members: squad.members,
          totalPool: squad.totalPool,
          weeklyTarget: squad.weeklyTarget,
          isActive: squad.isActive,
          userIsMember: squad.userIsMember,
        })) as Squad[]
        setSquads(demoSquads)
      }
      
      setLoading(false)
    }

    fetchSquads()
  }, [currentAccount, suiClient])

  const filteredSquads = squads.filter(squad =>
    squad.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleJoinSquad = async (squadId: string) => {
    if (!currentAccount || joiningSquad) return

    setJoiningSquad(squadId)
    
    if (DEMO_MODE) {
      // Demo mode: Simulate joining
      console.log('Demo mode: Simulating squad join for', squadId)
      setTimeout(() => {
        setSquads(prev => prev.map(squad => 
          squad.id === squadId 
            ? { ...squad, userIsMember: true, members: squad.members + 1 }
            : squad
        ))
        setJoiningSquad(null)
        alert('Successfully joined squad! (Demo Mode)')
      }, 1500)
      return
    }

    try {
      // Check if contracts are deployed
      if (CONTRACTS.PACKAGE_ID === '0x0') {
        alert('Contracts not deployed yet. Please deploy contracts first.')
        setJoiningSquad(null)
        return
      }

      const tx = new Transaction()
      tx.moveCall({
        target: `${CONTRACTS.PACKAGE_ID}::${CONTRACTS.SQUAD_MODULE}::join_squad`,
        arguments: [tx.object(squadId)]
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: () => {
            console.log('Successfully joined squad')
            // Refresh squad list
            window.location.reload()
          },
          onError: (error) => {
            console.error('Failed to join squad:', error)
            alert('Failed to join squad. Please try again.')
          }
        }
      )
    } catch (error) {
      console.error('Error joining squad:', error)
      alert('Error joining squad. Please try again.')
    } finally {
      setJoiningSquad(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {DEMO_MODE && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-blue-800 font-medium">Demo Mode</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            You're viewing demo data. All interactions are simulated for preview purposes.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Squads</h2>
          <p className="text-gray-600">Join a squad to start saving together</p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search squads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Squads</p>
              <p className="text-2xl font-bold text-gray-900">{squads.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {squads.reduce((sum, squad) => sum + squad.members, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <Coins className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pool</p>
              <p className="text-2xl font-bold text-gray-900">
                {squads.reduce((sum, squad) => sum + parseFloat(squad.totalPool), 0).toFixed(3)} SUI
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSquads.map((squad) => (
          <div key={squad.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{squad.name}</h3>
                <p className="text-sm text-gray-600">
                  Created by {formatAddress(squad.creator)}
                </p>
              </div>
              <div className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                squad.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              )}>
                {squad.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Members:</span>
                <span className="font-medium">{squad.members}/10</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Pool:</span>
                <span className="font-medium">{squad.totalPool} SUI</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Weekly Target:</span>
                <span className="font-medium">{squad.weeklyTarget} SUI</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${(squad.members / 10) * 100}%` }}
              />
            </div>
            
            {squad.userIsMember ? (
              <div className="flex items-center justify-center space-x-2 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-green-700">Member</span>
              </div>
            ) : (
              <button
                onClick={() => handleJoinSquad(squad.id)}
                className={cn(
                  "btn w-full",
                  joiningSquad === squad.id 
                    ? "btn-secondary opacity-75 cursor-not-allowed" 
                    : "btn-primary"
                )}
                disabled={squad.members >= 10 || !squad.isActive || joiningSquad === squad.id}
              >
                {joiningSquad === squad.id ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </div>
                ) : squad.members >= 10 ? (
                  'Squad Full'
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Join Squad</span>
                  </div>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredSquads.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No squads found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search term' : 'Be the first to create a squad!'}
          </p>
          <button className="btn btn-primary">Create New Squad</button>
        </div>
      )}
    </div>
  )
}
