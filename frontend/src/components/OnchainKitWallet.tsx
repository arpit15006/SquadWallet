import React from 'react';
// Wallet components disabled due to wagmi dependency issues
/*
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
*/
import {
  Address,
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';
// Theme import not available in this version

interface OnchainKitWalletProps {
  className?: string;
}

export const OnchainKitWallet: React.FC<OnchainKitWalletProps> = ({
  className = ""
}) => {
  return (
    <div className={`${className}`}>
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Wallet components temporarily disabled</p>
        <p className="text-sm text-gray-500">Use SimpleWalletConnect instead</p>
      </div>
    </div>
  );
};

export default OnchainKitWallet;
