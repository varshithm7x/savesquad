import { useState, useEffect } from 'react'
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Search, Users } from 'lucide-react'

import { cn, formatAddress } from '../utils'
import { CONTRACTS } from '../utils/constants'

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
      if (!currentAccount || !suiClient) return

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
        setSquads([])
      }
      
      setLoading(false)
    }

    fetchSquads()
  }, [currentAccount, suiClient])

  const handleJoinSquad = async (squadId: string) => {
    if (!currentAccount || joiningSquad) return

    setJoiningSquad(squadId)
    try {
      // Check if contracts are deployed
      if (CONTRACTS.PACKAGE_ID === '0x0') {
        alert('Contracts not deployed yet. Please deploy contracts first.')
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
          }
        }
      )
    } catch (error) {
      console.error('Error joining squad:', error)
    } finally {
      setJoiningSquad(null)
    }
  }

  const filteredSquads = squads.filter(squad =>
    squad.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discover Squads</h2>
          <p className="text-gray-600">Join a squad and start saving together</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search squads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {CONTRACTS.PACKAGE_ID === '0x0' ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contracts Not Deployed</h3>
          <p className="text-gray-600 mb-4">
            SaveSquad contracts need to be deployed to Sui testnet first.
          </p>
          <p className="text-sm text-gray-500">
            Please follow the deployment guide in REAL_BACKEND_GUIDE.md
          </p>
        </div>
      ) : filteredSquads.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Squads Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No squads match "${searchTerm}"`
              : 'Be the first to create a squad!'
            }
          </p>
          <button
            onClick={() => window.location.hash = '#create'}
            className="btn btn-primary"
          >
            Create First Squad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSquads.map((squad) => (
            <div key={squad.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{squad.name}</h3>
                  <p className="text-sm text-gray-500">by {formatAddress(squad.creator)}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {squad.members}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Pool</span>
                  <span className="text-sm font-bold text-green-600">{squad.totalPool} SUI</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Weekly Goal</span>
                  <span className="text-sm font-bold text-gray-900">{squad.weeklyTarget} SUI</span>
                </div>
              </div>
              
              <button
                onClick={() => handleJoinSquad(squad.id)}
                disabled={squad.userIsMember || joiningSquad === squad.id}
                className={cn(
                  'w-full btn',
                  squad.userIsMember 
                    ? 'btn-secondary cursor-not-allowed' 
                    : 'btn-primary'
                )}
              >
                {joiningSquad === squad.id 
                  ? 'Joining...' 
                  : squad.userIsMember 
                    ? 'Already Member' 
                    : 'Join Squad'
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
