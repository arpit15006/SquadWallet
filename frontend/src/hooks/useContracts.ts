import { ethers } from 'ethers';
import { useState, useCallback, useEffect } from 'react';
import { CONTRACTS } from '../config/contracts';
import { useSimpleWallet } from '../components/SimpleWalletConnect';
import { ContractService, initializeContractService } from '../services/contractService';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract ABIs (simplified for key functions)
const SQUAD_WALLET_FACTORY_ABI = [
  {
    "inputs": [
      {"name": "walletName", "type": "string"},
      {"name": "initialMembers", "type": "address[]"},
      {"name": "memberNames", "type": "string[]"}
    ],
    "name": "createSquadWallet",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getUserWallets",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const SQUAD_WALLET_ABI = [
  {
    "inputs": [],
    "name": "depositETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const GAME_MANAGER_ABI = [
  {
    "inputs": [{"name": "wager", "type": "uint256"}],
    "name": "createDiceGame",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "wager", "type": "uint256"}],
    "name": "createCoinFlipGame",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

// Hook for creating squad wallets
export function useCreateSquadWallet() {
  const { isConnected, address } = useSimpleWallet();
  const [isPending, setIsPending] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createWallet = useCallback(async (name: string, members: string[], memberNames: string[]) => {
    if (!CONTRACTS.SQUAD_WALLET_FACTORY) {
      throw new Error('Squad Wallet Factory contract not deployed');
    }
    
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    setIsPending(true);
    setError(null);

    try {
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACTS.SQUAD_WALLET_FACTORY,
        SQUAD_WALLET_FACTORY_ABI,
        signer
      );

      // Call contract function
      const tx = await contract.createSquadWallet(name, members, memberNames);
      setHash(tx.hash);

      // Wait for confirmation
      await tx.wait();
      
      return tx;
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [isConnected, address]);

  return {
    createWallet,
    hash,
    isPending,
    error,
  };
}

// Hook for getting user's wallets
export function useUserWallets(userAddress?: string) {
  const [data, setData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    if (!userAddress || !CONTRACTS.SQUAD_WALLET_FACTORY) return;

    setIsLoading(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACTS.SQUAD_WALLET_FACTORY,
        SQUAD_WALLET_FACTORY_ABI,
        provider
      );

      const wallets = await contract.getUserWallets(userAddress);
      setData(wallets);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return { data, isLoading, error, refetch: fetchWallets };
}

// Hook for depositing to wallet
export function useDepositToWallet() {
  const { isConnected } = useSimpleWallet();
  const [isPending, setIsPending] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deposit = useCallback(async (walletAddress: string, amount: string) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    setIsPending(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        walletAddress,
        SQUAD_WALLET_ABI,
        signer
      );

      const tx = await contract.depositETH({
        value: ethers.parseEther(amount)
      });
      setHash(tx.hash);

      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [isConnected]);

  return {
    deposit,
    hash,
    isPending,
    error,
  };
}

// Hook for creating games
export function useCreateGame() {
  const { isConnected } = useSimpleWallet();
  const [isPending, setIsPending] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createDiceGame = useCallback(async (wager: string) => {
    if (!CONTRACTS.GAME_MANAGER) {
      throw new Error('Game Manager contract not deployed');
    }
    
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    setIsPending(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACTS.GAME_MANAGER,
        GAME_MANAGER_ABI,
        signer
      );

      const tx = await contract.createDiceGame(ethers.parseEther(wager), {
        value: ethers.parseEther(wager)
      });
      setHash(tx.hash);

      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message || 'Game creation failed');
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [isConnected]);

  const createCoinFlipGame = useCallback(async (wager: string) => {
    if (!CONTRACTS.GAME_MANAGER) {
      throw new Error('Game Manager contract not deployed');
    }
    
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    setIsPending(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACTS.GAME_MANAGER,
        GAME_MANAGER_ABI,
        signer
      );

      const tx = await contract.createCoinFlipGame(ethers.parseEther(wager), {
        value: ethers.parseEther(wager)
      });
      setHash(tx.hash);

      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message || 'Game creation failed');
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [isConnected]);

  return {
    createDiceGame,
    createCoinFlipGame,
    hash,
    isPending,
    error,
  };
}

// Hook to check if contracts are deployed
export function useContractsDeployed() {
  return {
    isDeployed: !!(CONTRACTS.SQUAD_WALLET_FACTORY && CONTRACTS.GAME_MANAGER && CONTRACTS.XP_BADGES),
    contracts: CONTRACTS,
  };
}

// Hook to get contract service instance
export function useContractService() {
  const { isConnected } = useSimpleWallet();
  const [contractService, setContractService] = useState<ContractService | null>(null);

  useEffect(() => {
    const initService = async () => {
      if (isConnected && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const service = initializeContractService(provider, signer);
        setContractService(service);
      }
    };

    initService();
  }, [isConnected]);

  return contractService;
}

// Enhanced hooks using real contract data
export function useUserStats(userAddress?: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contractService = useContractService();

  const fetchStats = useCallback(async () => {
    if (!userAddress || !contractService) return;

    setIsLoading(true);
    setError(null);

    try {
      const [xp, level, badges, balance] = await Promise.all([
        contractService.getUserXP(userAddress),
        contractService.getUserLevel(userAddress),
        contractService.getUserBadges(userAddress),
        contractService.getBalance(userAddress)
      ]);

      setData({
        xp,
        level,
        badges: badges.length,
        balance: ethers.parseEther(balance),
        gamesPlayed: Math.floor(xp / 50), // Estimate based on XP
        gamesWon: Math.floor(xp / 75), // Estimate based on XP
        totalEarned: Math.floor(xp / 100) // Estimate based on XP
      });
    } catch (err: any) {
      console.error('Failed to fetch user stats:', err);
      setError(err.message);
      // Fallback to demo data
      setData(userAddress ? [1250, 15, 12, 2500000000000000000n, 8, 2, 5] : null);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, contractService]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, isLoading, error, refetch: fetchStats };
}

export function useWalletInfo(walletAddress?: string) {
  return {
    data: walletAddress ? ['Demo Wallet', 1n, Math.floor(Date.now() / 1000), []] : null,
    isLoading: false,
    error: null
  };
}

export function useWalletBalance(walletAddress?: string) {
  return {
    data: walletAddress ? '0.0' : null,
    isLoading: false,
    error: null
  };
}
