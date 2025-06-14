import React from 'react';
// Wallet components disabled due to wagmi dependency issues
/*
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownFundLink,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
*/
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
// Theme import not available in this version
import { base } from 'viem/chains';

export function OnchainWalletConnect() {
  return (
    <div className="flex justify-end">
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">OnchainKit Wallet temporarily disabled</p>
        <p className="text-sm text-gray-500">Use SimpleWalletConnect instead</p>
      </div>
    </div>
  );
}

// Enhanced wallet component with additional features (disabled - requires wagmi)
/*
export function EnhancedWalletConnect() {
  const { address, isConnected } = useAccount();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Wallet</h3>
        <OnchainWalletConnect />
      </div>

      {isConnected && address && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
            <Avatar address={address} className="h-10 w-10" />
            <div className="flex-1">
              <Name address={address} className="text-white font-medium" />
              <Address 
                address={address} 
                className="text-gray-400 text-sm"
                isSliced
              />
            </div>
          </div>

          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Balance</span>
              <EthBalance 
                address={address} 
                className="text-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Send
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Receive
            </button>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Connect your wallet to get started</p>
          <OnchainWalletConnect />
        </div>
      )}
    </div>
  );
}
*/
