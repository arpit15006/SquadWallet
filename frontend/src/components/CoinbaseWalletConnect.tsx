import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  Power, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import coinbaseWalletService, { WalletState } from '../services/coinbaseWallet';

export const CoinbaseWalletConnect: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState>(coinbaseWalletService.getState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to wallet state changes
    const unsubscribe = coinbaseWalletService.subscribe((state) => {
      setWalletState(state);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const handleConnect = async () => {
    if (!coinbaseWalletService.isWalletAvailable()) {
      setError('Coinbase Wallet is not available. Please install the Coinbase Wallet extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await coinbaseWalletService.connect();
    } catch (error: any) {
      console.error('Connection failed:', error);
      setError(error.message || 'Failed to connect to Coinbase Wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await coinbaseWalletService.disconnect();
      setShowDropdown(false);
    } catch (error: any) {
      console.error('Disconnect failed:', error);
      setError(error.message || 'Failed to disconnect');
    }
  };

  const handleSwitchToBaseSepolia = async () => {
    try {
      await coinbaseWalletService.switchChain(84532); // Base Sepolia
    } catch (error: any) {
      console.error('Chain switch failed:', error);
      setError(error.message || 'Failed to switch chain');
    }
  };

  const copyAddress = async () => {
    if (walletState.accounts[0]) {
      await navigator.clipboard.writeText(walletState.accounts[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case 8453:
        return 'Base Mainnet';
      case 84532:
        return 'Base Sepolia';
      case 1:
        return 'Ethereum';
      default:
        return chainId ? `Chain ${chainId}` : 'Unknown';
    }
  };

  const getChainColor = (chainId: number | null) => {
    switch (chainId) {
      case 8453:
        return 'bg-blue-500';
      case 84532:
        return 'bg-orange-500';
      case 1:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!walletState.isConnected) {
    return (
      <div className="relative">
        <motion.button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isConnecting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          <span>{isConnecting ? 'Connecting...' : 'Connect Coinbase Wallet'}</span>
        </motion.button>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 left-0 right-0 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Chain Indicator */}
        <div className={`w-3 h-3 rounded-full ${getChainColor(walletState.chainId)}`} />
        
        {/* Account Info */}
        <div className="flex flex-col items-start">
          <span className="text-white font-medium text-sm">
            {formatAddress(walletState.accounts[0])}
          </span>
          <span className="text-gray-400 text-xs">
            {parseFloat(walletState.balance).toFixed(4)} ETH
          </span>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 w-80 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl z-50"
          >
            <div className="p-4">
              {/* Account Section */}
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2">Account</h3>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Address</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono text-sm">
                        {formatAddress(walletState.accounts[0])}
                      </span>
                      <button
                        onClick={copyAddress}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copy address"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Balance</span>
                    <span className="text-white font-semibold">
                      {parseFloat(walletState.balance).toFixed(6)} ETH
                    </span>
                  </div>
                </div>
              </div>

              {/* Network Section */}
              <div className="mb-4">
                <h3 className="text-white font-semibold mb-2">Network</h3>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getChainColor(walletState.chainId)}`} />
                      <span className="text-white">
                        {getChainName(walletState.chainId)}
                      </span>
                    </div>
                    {walletState.chainId !== 84532 && (
                      <button
                        onClick={handleSwitchToBaseSepolia}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        Switch to Base Sepolia
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => window.open(`https://sepolia.basescan.org/address/${walletState.accounts[0]}`, '_blank')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on BaseScan</span>
                </button>
                
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                >
                  <Power className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoinbaseWalletConnect;
