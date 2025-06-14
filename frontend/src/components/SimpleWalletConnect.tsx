import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle, Sparkles, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  isEthereumAvailable,
  requestAccounts,
  getAccounts,
  switchToBaseSepolia,
  onAccountsChanged,
} from '../utils/ethereum';

interface SimpleWalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

// Enhanced OnchainKit Wallet Component with Error Handling
export const OnchainKitWallet: React.FC<SimpleWalletConnectProps> = ({
  onConnect,
  onDisconnect
}) => {
  const [hasError, setHasError] = useState(false);

  // Fallback to SimpleWalletConnect if OnchainKit has issues
  if (hasError) {
    return <SimpleWalletConnect onConnect={onConnect} onDisconnect={onDisconnect} />;
  }

  try {
    return (
      <div className="flex items-center space-x-3">
        <OnchainWallet>
          <ConnectWallet
            className="btn-gradient flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-white"
            text="Connect Smart Wallet"
          >
            <Avatar className="h-6 w-6" />
            <Name className="text-white" />
          </ConnectWallet>
          <WalletDropdown className="glass rounded-xl border border-white/10">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-8 w-8" />
                <Name className="text-white font-semibold" />
              </div>
              <WalletDropdownLink
                icon="wallet"
                href="https://wallet.coinbase.com"
                className="text-white hover:text-blue-400 transition-colors block py-2"
              >
                Open Wallet
              </WalletDropdownLink>
              <WalletDropdownDisconnect className="text-red-400 hover:text-red-300 transition-colors block py-2" />
            </div>
          </WalletDropdown>
        </OnchainWallet>
      </div>
    );
  } catch (error) {
    console.warn('OnchainKit wallet error, falling back to simple wallet:', error);
    setHasError(true);
    return <SimpleWalletConnect onConnect={onConnect} onDisconnect={onDisconnect} />;
  }
};

export const SimpleWalletConnect: React.FC<SimpleWalletConnectProps> = ({
  onConnect,
  onDisconnect
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  // Check if already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (isEthereumAvailable()) {
        const accounts = await getAccounts();
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
      // Check if Ethereum provider is available
      if (!isEthereumAvailable()) {
        throw new Error('No Ethereum wallet found. Please install MetaMask or another Web3 wallet.');
      }

      // Request account access
      const accounts = await requestAccounts();

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please check your wallet.');
      }

      const userAddress = accounts[0];
      setAddress(userAddress);
      setIsConnected(true);
      onConnect?.(userAddress);

      // Switch to Base Sepolia
      try {
        await switchToBaseSepolia();
      } catch (switchError: any) {
        console.warn('Failed to switch to Base Sepolia:', switchError);
        // Don't throw error, just warn
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
    onDisconnect?.();
  };

  if (isConnected) {
    return (
      <motion.div
        className="flex items-center space-x-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-center space-x-2 glass rounded-xl px-4 py-2 border border-green-500/30"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
          </motion.div>
          <span className="text-white text-sm font-semibold">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
        </motion.div>
        <motion.button
          onClick={disconnectWallet}
          className="glass hover:bg-red-500/20 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center space-x-2 border border-red-500/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect</span>
        </motion.button>
      </motion.div>
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
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
        {!isConnecting && (
          <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}

        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        />
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
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Global wallet state for simple management
export const useSimpleWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      try {
        if (isEthereumAvailable()) {
          const accounts = await getAccounts();
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.log('No wallet connected');
      }
    };

    checkConnection();

    // Listen for account changes
    const unsubscribe = onAccountsChanged((accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAddress('');
      } else {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    });

    return unsubscribe;
  }, []);

  const connect = (userAddress: string) => {
    setAddress(userAddress);
    setIsConnected(true);
  };

  const disconnect = () => {
    setAddress('');
    setIsConnected(false);
  };

  return {
    isConnected,
    address,
    connect,
    disconnect,
  };
};
