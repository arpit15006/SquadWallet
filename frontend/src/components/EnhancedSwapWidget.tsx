import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpDown, 
  Settings, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  balance?: string;
}

interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  gasEstimate: string;
  route: string[];
  slippage: number;
}

interface EnhancedSwapWidgetProps {
  onSwapComplete?: (txHash: string) => void;
  className?: string;
  defaultFromToken?: string;
  defaultToToken?: string;
}

const POPULAR_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    logoURI: '/tokens/eth.png'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    logoURI: '/tokens/usdc.png'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    logoURI: '/tokens/weth.png'
  }
];

export const EnhancedSwapWidget: React.FC<EnhancedSwapWidgetProps> = ({
  onSwapComplete,
  className = "",
  defaultFromToken = 'ETH',
  defaultToToken = 'USDC'
}) => {
  const [fromToken, setFromToken] = useState<Token>(
    POPULAR_TOKENS.find(t => t.symbol === defaultFromToken) || POPULAR_TOKENS[0]
  );
  const [toToken, setToToken] = useState<Token>(
    POPULAR_TOKENS.find(t => t.symbol === defaultToToken) || POPULAR_TOKENS[1]
  );
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      fetchQuote();
    } else {
      setToAmount('');
      setQuote(null);
    }
  }, [fromAmount, fromToken, toToken, slippage]);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock quote - in production, this would call a real DEX aggregator
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRate = fromToken.symbol === 'ETH' && toToken.symbol === 'USDC' ? 2000 : 0.0005;
      const calculatedToAmount = (parseFloat(fromAmount) * mockRate).toFixed(6);
      
      const mockQuote: SwapQuote = {
        fromAmount,
        toAmount: calculatedToAmount,
        priceImpact: Math.random() * 2, // 0-2%
        gasEstimate: (0.001 + Math.random() * 0.002).toFixed(6),
        route: [fromToken.symbol, toToken.symbol],
        slippage
      };
      
      setQuote(mockQuote);
      setToAmount(calculatedToAmount);
    } catch (err) {
      setError('Failed to fetch quote');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!quote) return;
    
    setSwapping(true);
    try {
      // Mock swap execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      onSwapComplete?.(mockTxHash);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setQuote(null);
    } catch (err) {
      setError('Swap failed');
    } finally {
      setSwapping(false);
    }
  };

  const switchTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const getPriceImpactColor = (impact: number) => {
    if (impact < 1) return 'text-green-400';
    if (impact < 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Swap Tokens</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Settings size={20} className="text-white" />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slippage Tolerance
                </label>
                <div className="flex space-x-2">
                  {[0.1, 0.5, 1.0].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`px-3 py-1 rounded text-sm ${
                        slippage === value
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                    className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                    step="0.1"
                    min="0.1"
                    max="50"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* From Token */}
      <div className="space-y-4">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">From</span>
            <span className="text-sm text-gray-400">
              Balance: {fromToken.balance || '0.00'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
            />
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
              <img src={fromToken.logoURI} alt={fromToken.symbol} className="w-6 h-6" />
              <span className="font-medium text-white">{fromToken.symbol}</span>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={switchTokens}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowUpDown size={20} className="text-white" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">To</span>
            <span className="text-sm text-gray-400">
              Balance: {toToken.balance || '0.00'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
            />
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
              <img src={toToken.logoURI} alt={toToken.symbol} className="w-6 h-6" />
              <span className="font-medium text-white">{toToken.symbol}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Information */}
      {quote && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Rate</span>
              <span className="text-white">
                1 {fromToken.symbol} = {(parseFloat(quote.toAmount) / parseFloat(quote.fromAmount)).toFixed(6)} {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price Impact</span>
              <span className={getPriceImpactColor(quote.priceImpact)}>
                {quote.priceImpact < 0.01 ? '<0.01' : quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gas Fee</span>
              <span className="text-white">~{quote.gasEstimate} ETH</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2"
        >
          <AlertTriangle size={16} className="text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </motion.div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!quote || loading || swapping || !fromAmount}
        className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2"
      >
        {swapping ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Swapping...</span>
          </>
        ) : loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Getting Quote...</span>
          </>
        ) : !fromAmount ? (
          <span>Enter Amount</span>
        ) : !quote ? (
          <span>Get Quote</span>
        ) : (
          <span>Swap Tokens</span>
        )}
      </button>
    </div>
  );
};

export default EnhancedSwapWidget;
