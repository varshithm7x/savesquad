import { useEffect, useState } from 'react'
import { useWallets, useCurrentAccount, useConnectWallet, useDisconnectWallet } from '@mysten/dapp-kit'

export default function WalletDebug() {
  const wallets = useWallets()
  const currentAccount = useCurrentAccount()
  const { mutate: connectWallet } = useConnectWallet()
  const { mutate: disconnectWallet } = useDisconnectWallet()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    setDebugInfo({
      walletsCount: wallets.length,
      walletNames: wallets.map(w => w.name),
      currentAccount: currentAccount?.address,
      hasWallets: wallets.length > 0,
      walletFeatures: wallets.map(w => ({
        name: w.name,
        icon: w.icon,
        chains: w.chains
      }))
    })
  }, [wallets, currentAccount])

  const handleManualConnect = () => {
    if (wallets.length > 0) {
      connectWallet(
        { wallet: wallets[0] },
        {
          onSuccess: () => console.log('Connected successfully'),
          onError: (error) => console.error('Connection failed:', error)
        }
      )
    }
  }

  return (
    <div className="card p-6 m-4 max-w-2xl">
      <h2 className="text-xl font-bold mb-4">🔍 Wallet Debug Information</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Current Status</h3>
          <p>Connected: {currentAccount ? '✅ Yes' : '❌ No'}</p>
          {currentAccount && (
            <p className="text-sm text-gray-600 mt-1">
              Address: {currentAccount.address}
            </p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Available Wallets</h3>
          <p>Count: {wallets.length}</p>
          {wallets.length === 0 ? (
            <div className="text-yellow-600 mt-2">
              <p>⚠️ No wallets detected!</p>
              <p className="text-sm mt-1">
                This usually means:
                <br />• No Sui wallet extension is installed
                <br />• Extension is disabled
                <br />• Extension hasn't loaded yet
              </p>
            </div>
          ) : (
            <div className="mt-2">
              {wallets.map((wallet, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                  <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                  <span>{wallet.name}</span>
                  <span className="text-xs text-gray-500">
                    ({wallet.chains.length} chains)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Browser Extensions</h3>
          <div className="text-sm space-y-1">
            <p>User Agent: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'}</p>
            <p>Extensions API: {typeof window.navigator !== 'undefined' ? '✅' : '❌'}</p>
            <p>Sui Provider: {typeof (window as any).suiWallet !== 'undefined' ? '✅' : '❌'}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Actions</h3>
          <div className="space-y-2">1
            <button
              onClick={handleManualConnect}
              disabled={wallets.length === 0}
              className="btn btn-primary disabled:opacity-50"
            >
              Manual Connect ({wallets.length > 0 ? wallets[0].name : 'No Wallet'})
            </button>
            
            {currentAccount && (
              <button
                onClick={() => disconnectWallet()}
                className="btn btn-secondary ml-2"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Data</h3>
          <pre className="text-xs overflow-auto bg-white p-2 rounded border">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
