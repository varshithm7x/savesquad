import { useCurrentAccount } from '@mysten/dapp-kit'
import { ConnectButton } from '@mysten/dapp-kit'

export default function WalletStatus() {
  const currentAccount = useCurrentAccount()

  return (
    <div className="card p-6 m-4">
      <h2 className="text-xl font-bold mb-4">Wallet Connection Status</h2>
      
      {currentAccount ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800">✅ Wallet Connected</h3>
            <p className="text-sm text-green-700">
              Address: {currentAccount.address}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800">⚠️ No Wallet Connected</h3>
            <p className="text-sm text-yellow-700">
              Please connect your wallet to use SaveSquad
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800">📝 Setup Instructions:</h4>
            <ol className="text-sm text-blue-700 mt-2 space-y-1">
              <li>1. Install the Sui Wallet browser extension</li>
              <li>2. Create or import a wallet</li>
              <li>3. Switch to Sui Testnet</li>
              <li>4. Click "Connect Wallet" below</li>
            </ol>
          </div>
          
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      )}
    </div>
  )
}
