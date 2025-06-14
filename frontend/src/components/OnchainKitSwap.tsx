import React from 'react';
import { 
  Swap,
  SwapAmountInput,
  SwapToggleButton,
  SwapButton,
  SwapMessage,
  SwapToast
} from '@coinbase/onchainkit/swap';
import { 
  Token,
  TokenChip,
  TokenImage,
  TokenRow,
  TokenSearch,
  TokenSelectDropdown
} from '@coinbase/onchainkit/token';

interface OnchainKitSwapProps {
  onSwapComplete?: (txHash: string) => void;
  className?: string;
}

export const OnchainKitSwap: React.FC<OnchainKitSwapProps> = ({
  onSwapComplete,
  className = ""
}) => {
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6">Token Swap</h3>
      
      <Swap>
        <div className="space-y-4">
          {/* From Token */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">From</span>
            </div>
            <div className="flex items-center space-x-3">
              <SwapAmountInput
                label="From"
                swapType="from"
                className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
              />
              <TokenSelectDropdown>
                <TokenChip />
              </TokenSelectDropdown>
            </div>
          </div>

          {/* Swap Toggle */}
          <div className="flex justify-center">
            <SwapToggleButton className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors" />
          </div>

          {/* To Token */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">To</span>
            </div>
            <div className="flex items-center space-x-3">
              <SwapAmountInput
                label="To"
                swapType="to"
                className="flex-1 bg-transparent text-2xl font-semibold text-white placeholder-gray-500 outline-none"
              />
              <TokenSelectDropdown>
                <TokenChip />
              </TokenSelectDropdown>
            </div>
          </div>

          {/* Swap Message */}
          <SwapMessage className="text-sm text-gray-300" />

          {/* Swap Button */}
          <SwapButton 
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold text-white transition-all duration-200"
            onSuccess={(txHash) => {
              console.log('Swap successful:', txHash);
              onSwapComplete?.(txHash);
            }}
          />
        </div>

        {/* Toast notifications */}
        <SwapToast />
      </Swap>
    </div>
  );
};

export default OnchainKitSwap;
