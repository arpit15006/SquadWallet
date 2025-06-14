import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Name } from './Identity';

interface SmartWalletProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

// Smart Wallet Component with Real Basename Integration
export const SmartWallet: React.FC<SmartWalletProps> = ({
  onConnect,
  onDisconnect
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Check if already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          onConnect?.(accounts[0]);
        }
      }
    } catch (error) {
      console.log('No wallet connected');
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please check your wallet.');
      }

      const userAddress = accounts[0];
      setAddress(userAddress);
      setIsConnected(true);
      onConnect?.(userAddress);

      // Switch to Base Sepolia if not already
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14A34' }], // Base Sepolia
        });
      } catch (switchError: any) {
        // If the chain doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x14A34',
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    setError('');
    setShowDropdown(false);
    onDisconnect?.();
  };

  if (isConnected) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 glass rounded-xl px-4 py-2 border border-green-500/30 hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Avatar address={address} className="w-6 h-6" />
          <Name address={address} className="text-white text-sm font-semibold" />
          <Sparkles className="w-3 h-3 text-yellow-400" />
        </motion.button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-64 glass rounded-xl border border-white/10 p-4 z-50"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Avatar address={address} className="w-8 h-8" />
                <div>
                  <Name address={address} className="text-white font-semibold" />
                  <div className="text-gray-400 text-xs">Connected to Base Sepolia</div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => window.open('https://wallet.coinbase.com', '_blank')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Wallet</span>
                </button>

                <button
                  onClick={disconnectWallet}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <motion.button
        onClick={connectWallet}
        disabled={isConnecting}
        className="btn-gradient flex items-center space-x-2 relative overflow-hidden group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={isConnecting ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 1, repeat: isConnecting ? Infinity : 0, ease: "linear" }}
        >
          <Wallet className="w-5 h-5" />
        </motion.div>
        <span className="font-semibold">
          {isConnecting ? 'Connecting...' : 'Connect Smart Wallet'}
        </span>
        {!isConnecting && (
          <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.div
            className="flex items-center space-x-2 text-red-400 text-sm max-w-xs glass p-3 rounded-lg border border-red-500/30"
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
