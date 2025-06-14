import React from 'react';
// Transaction components disabled due to OnchainKit version compatibility
/*
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
*/

interface OnchainKitTransactionProps {
  contracts: any[];
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const OnchainKitTransaction: React.FC<OnchainKitTransactionProps> = ({
  contracts,
  onSuccess,
  onError,
  className = ""
}) => {
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-6">Transaction Component</h3>
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">OnchainKit Transaction components temporarily disabled</p>
        <p className="text-sm text-gray-500">Due to version compatibility issues</p>
        <button
          className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg opacity-50 cursor-not-allowed"
          disabled
        >
          Execute Transaction (Disabled)
        </button>
      </div>
    </div>
  );
};

export default OnchainKitTransaction;
