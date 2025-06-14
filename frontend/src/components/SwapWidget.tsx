import React, { useState, useEffect } from 'react';
import { useSimpleWallet } from './SimpleWalletConnect';
import { ArrowUpDown, Settings, Info, Zap } from 'lucide-react';

// Token list for Base
const TOKENS = {
  ETH: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    logoURI: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png'
  },
  WETH: {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    decimals: 18,
    logoURI: 'https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png'
  },
  USDC: {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://tokens.1inch.io/0xa0b86a33e6441b8db4b2b8b8b8b8b8b8b8b8b8b8.png'
  },
  DAI: {
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png'
  }
};

interface SwapWidgetProps {
  onSwapComplete?: (txHash: string) => void;
}

export const SwapWidget: React.FC<SwapWidgetProps> = ({ onSwapComplete }) => {
  const { address, isConnected } = useSimpleWallet();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Demo balances (in real app, fetch from blockchain)
  const ethBalance = { formatted: '1.5', symbol: 'ETH' };
  const tokenBalance = { formatted: '1000', symbol: fromToken };

  // Demo states
  const isPending = false;
  const isConfirming = false;
  const isSuccess = false;
  const error = null;
  const hash = null;

  // Mock price calculation (in real app, use DEX aggregator API)
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const mockRate = getMockExchangeRate(fromToken, toToken);
      const calculatedAmount = (parseFloat(fromAmount) * mockRate).toFixed(6);
      setToAmount(calculatedAmount);
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  // Handle successful swap
  useEffect(() => {
    if (isSuccess && hash) {
      onSwapComplete?.(hash);
      setFromAmount('');
      setToAmount('');
    }
  }, [isSuccess, hash, onSwapComplete]);

  const getMockExchangeRate = (from: string, to: string): number => {
    // Mock exchange rates (in real app, fetch from DEX)
    const rates: Record<string, Record<string, number>> = {
      ETH: { USDC: 2000, DAI: 2000, WETH: 1 },
      USDC: { ETH: 0.0005, DAI: 1, WETH: 0.0005 },
      DAI: { ETH: 0.0005, USDC: 1, WETH: 0.0005 },
      WETH: { ETH: 1, USDC: 2000, DAI: 2000 }
    };
    return rates[from]?.[to] || 1;
  };

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!fromAmount || !toAmount || !isConnected) return;

    setIsLoading(true);
    try {
      // In a real implementation, this would:
      // 1. Get the best route from a DEX aggregator
      // 2. Approve tokens if needed
      // 3. Execute the swap through a router contract
      
      // For demo purposes, we'll simulate a swap
      console.log('Executing swap:', {
        from: fromToken,
        to: toToken,
        amount: fromAmount
      });

      // Mock transaction (replace with actual swap contract call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = () => {
    if (fromToken === 'ETH') {
      return ethBalance ? ethBalance.formatted : '0';
    }
    return tokenBalance ? tokenBalance.formatted : '0';
  };

  const isSwapDisabled = !fromAmount || !toAmount || isLoading || isPending || isConfirming;

  if (!isConnected) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
        <div className="text-gray-400 mb-4">
          <Zap className="w-12 h-12 mx-auto mb-2" />
          <p>Connect your wallet to start swapping</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Swap Tokens</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Slippage Tolerance</span>
            <div className="flex space-x-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1 rounded text-sm ${
                    slippage === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:text-white'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* From Token */}
      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">From</span>
            <span className="text-gray-300 text-sm">
              Balance: {parseFloat(getBalance()).toFixed(4)}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="bg-gray-600 text-white rounded-lg px-3 py-2 border-none outline-none"
            >
              {Object.entries(TOKENS).map(([symbol, token]) => (
                <option key={symbol} value={symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-white text-xl outline-none"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapTokens}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">To</span>
            <span className="text-gray-300 text-sm">
              ~${(parseFloat(toAmount || '0') * 1).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="bg-gray-600 text-white rounded-lg px-3 py-2 border-none outline-none"
            >
              {Object.entries(TOKENS).map(([symbol, token]) => (
                <option key={symbol} value={symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-white text-xl outline-none"
            />
          </div>
        </div>

        {/* Swap Info */}
        {fromAmount && toAmount && (
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Info className="w-4 h-4" />
              <span>
                1 {fromToken} = {getMockExchangeRate(fromToken, toToken).toFixed(4)} {toToken}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Price impact: ~0.1% • Fee: 0.3%
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={isSwapDisabled}
          className={`w-full py-4 rounded-lg font-medium transition-colors ${
            isSwapDisabled
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading || isPending || isConfirming
            ? 'Swapping...'
            : `Swap ${fromToken} for ${toToken}`}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-600 rounded-lg p-3">
            <p className="text-red-300 text-sm">
              {error.message || 'Swap failed. Please try again.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
