import { ethers } from 'ethers';
import { AgentKit, CdpWalletProvider } from '@coinbase/agentkit';
import { AgentConfig, ContractAddresses, WalletInfo, GameInfo, UserStats } from '../types';
import logger from '../utils/logger';

/**
 * Enhanced Blockchain service with full Coinbase AgentKit integration
 */
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contracts: ContractAddresses;
  private agentKit?: AgentKit; // Enhanced AgentKit instance
  private walletProvider?: CdpWalletProvider; // CDP Wallet Provider
  private isAgentKitEnabled: boolean = false;

  // Contract ABIs (simplified for key functions)
  private squadWalletFactoryABI = [
    'function createSquadWallet(string memory walletName, address[] memory initialMembers, string[] memory memberNames) external returns (address)',
    'function getUserWallets(address user) external view returns (address[] memory)',
    'function getWalletInfo(address walletAddress) external view returns (string memory name, uint256 totalMembers, uint256 createdAt, address[] memory members)',
    'function getUserGlobalStats(address user) external view returns (uint256 walletsCount, uint256 totalXP, uint256 gamesPlayed, uint256 gamesWon, uint256 totalDeposited, uint256 proposalsVoted)',
    'event SquadWalletCreated(address indexed walletAddress, address indexed creator, string walletName, address[] members)'
  ];

  private squadWalletABI = [
    'function depositETH() external payable',
    'function getBalance(address token) external view returns (uint256)',
    'function createProposal(string memory description, address target, uint256 value, bytes memory data) external returns (uint256)',
    'function vote(uint256 proposalId, bool support) external',
    'function getAllMembers() external view returns (address[] memory)',
    'function getMember(address member) external view returns (string memory name, uint256 totalDeposited, uint256 xpPoints, bool isActive, uint256 joinedAt)',
    'function walletName() external view returns (string memory)'
  ];

  private gameManagerABI = [
    'function createDiceGame(uint256 wager) external payable returns (uint256)',
    'function createCoinFlipGame(uint256 wager) external payable returns (uint256)',
    'function joinGame(uint256 gameId) external payable',
    'function getGame(uint256 gameId) external view returns (uint256 id, address creator, uint8 gameType, uint256 wager, uint256 totalPot, address[] memory players, uint8 state, uint256 createdAt, address winner)',
    'function getPlayerStats(address player) external view returns (uint256 gamesPlayed, uint256 gamesWon, uint256 totalWagered, uint256 totalWon, uint256 xpEarned)',
    'function gameCount() external view returns (uint256)',
    'event GameCreated(uint256 indexed gameId, address indexed creator, uint8 gameType, uint256 wager)',
    'event GameCompleted(uint256 indexed gameId, address indexed winner, uint256 payout, uint256 randomResult)'
  ];

  private xpBadgesABI = [
    'function getUserXP(address user) external view returns (uint256)',
    'function getUserStats(address user) external view returns (uint256 totalXP, uint256 gamesPlayed, uint256 gamesWon, uint256 totalDeposited, uint256 proposalsVoted, uint256 walletsCreated, uint256 streakDays)',
    'function getUserBadgeLevel(address user, uint8 badgeType) external view returns (uint256)',
    'function balanceOf(address owner) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    'function tokenURI(uint256 tokenId) external view returns (string memory)'
  ];

  constructor(config: AgentConfig) {
    this.provider = new ethers.JsonRpcProvider(config.baseRpcUrl);
    this.contracts = config.contracts;

    // Create fallback wallet from private key
    this.wallet = new ethers.Wallet(config.xmtpPrivateKey, this.provider);

    logger.info('Enhanced BlockchainService initialized', {
      walletAddress: this.wallet.address,
      contracts: this.contracts,
      agentKitEnabled: this.isAgentKitEnabled
    });
  }

  /**
   * Initialize Enhanced Coinbase AgentKit wallet
   */
  async initializeCoinbaseWallet(): Promise<void> {
    try {
      logger.info('Initializing Enhanced Coinbase AgentKit wallet...');

      // Check if we have the required environment variables
      if (!process.env.CDP_API_KEY_NAME || !process.env.CDP_API_KEY_PRIVATE_KEY) {
        logger.warn('CDP API credentials not found, using fallback wallet');
        return;
      }

      // Create CDP Wallet Provider
      this.walletProvider = await CdpWalletProvider.configureWithWallet({
        apiKeyId: process.env.CDP_API_KEY_NAME,
        apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY,
        networkId: 'base-sepolia'
      });

      // Create AgentKit instance
      this.agentKit = await AgentKit.from({
        walletProvider: this.walletProvider
      });

      this.isAgentKitEnabled = true;

      logger.info('AgentKit wallet created successfully', {
        address: this.walletProvider.getAddress(),
        networkId: 'base-sepolia',
        agentKitEnabled: this.isAgentKitEnabled
      });

    } catch (error) {
      logger.error('Failed to initialize Coinbase AgentKit wallet', { error });
      logger.info('Continuing with regular ethers wallet');
    }
  }

  /**
   * Create a new SquadWallet using Enhanced AgentKit
   */
  async createSquadWallet(
    walletName: string,
    memberAddresses: string[],
    memberNames: string[]
  ): Promise<{ address: string; txHash: string }> {
    try {
      logger.info('Creating SquadWallet via Enhanced AgentKit', {
        name: walletName,
        members: memberAddresses.length,
        agentKitEnabled: this.isAgentKitEnabled
      });

      // Use AgentKit if available, otherwise fallback to ethers
      const txHash = await this.executeAgentKitTransaction(
        this.contracts.squadWalletFactory,
        this.squadWalletFactoryABI,
        'createSquadWallet',
        [walletName, memberAddresses, memberNames]
      );

      // Get wallet address from factory (simplified approach)
      // In a real implementation, you'd parse the transaction receipt
      const factory = new ethers.Contract(
        this.contracts.squadWalletFactory,
        this.squadWalletFactoryABI,
        this.provider
      );

      // Get the latest wallet created (simplified)
      const userWallets = await factory.getUserWallets(memberAddresses[0]);
      const walletAddress = userWallets[userWallets.length - 1];

      logger.info('SquadWallet created successfully via Enhanced AgentKit', {
        walletAddress,
        txHash,
        agentKitUsed: this.isAgentKitEnabled
      });

      return {
        address: walletAddress,
        txHash
      };
    } catch (error) {
      logger.error('Failed to create SquadWallet', { error });
      throw error;
    }
  }

  /**
   * Get wallet information
   */
  async getWalletInfo(walletAddress: string): Promise<WalletInfo> {
    try {
      const factory = new ethers.Contract(
        this.contracts.squadWalletFactory,
        this.squadWalletFactoryABI,
        this.provider
      );

      const wallet = new ethers.Contract(
        walletAddress,
        this.squadWalletABI,
        this.provider
      );

      const [name, totalMembers, createdAt, members] = await factory.getWalletInfo(walletAddress);
      const balance = await wallet.getBalance(ethers.ZeroAddress);

      return {
        address: walletAddress,
        name,
        members,
        totalMembers: Number(totalMembers),
        createdAt: Number(createdAt),
        balance: ethers.formatEther(balance)
      };
    } catch (error) {
      logger.error('Failed to get wallet info', { walletAddress, error });
      throw error;
    }
  }

  /**
   * Get user's wallets
   */
  async getUserWallets(userAddress: string): Promise<string[]> {
    try {
      const factory = new ethers.Contract(
        this.contracts.squadWalletFactory,
        this.squadWalletFactoryABI,
        this.provider
      );

      const wallets = await factory.getUserWallets(userAddress);
      return wallets;
    } catch (error) {
      logger.error('Failed to get user wallets', { userAddress, error });
      throw error;
    }
  }

  /**
   * Deposit ETH to a wallet
   */
  async depositToWallet(
    walletAddress: string,
    amount: string
  ): Promise<string> {
    try {
      const wallet = new ethers.Contract(
        walletAddress,
        this.squadWalletABI,
        this.wallet
      );

      logger.info('Depositing to wallet', {
        walletAddress,
        amount: ethers.formatEther(amount)
      });

      const tx = await wallet.depositETH({ value: amount });
      const receipt = await tx.wait();

      logger.info('Deposit successful', {
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      });

      return receipt.hash;
    } catch (error) {
      logger.error('Failed to deposit to wallet', { walletAddress, amount, error });
      throw error;
    }
  }

  /**
   * Get GameManager contract address
   */
  getGameManagerAddress(): string {
    return this.contracts.gameManager;
  }

  /**
   * Get transaction data for creating a game (for user to execute)
   */
  getCreateGameTxData(gameType: string, wager: string): { to: string; data: string; value: string } {
    const gameManager = new ethers.Contract(
      this.contracts.gameManager,
      this.gameManagerABI,
      this.wallet
    );

    let data: string;
    if (gameType === 'dice') {
      data = gameManager.interface.encodeFunctionData('createDiceGame', [wager]);
    } else {
      data = gameManager.interface.encodeFunctionData('createCoinFlipGame', [wager]);
    }

    return {
      to: this.contracts.gameManager,
      data,
      value: wager
    };
  }

  /**
   * Get transaction data for joining a game (for user to execute)
   */
  getJoinGameTxData(gameId: number, wager: string): { to: string; data: string; value: string } {
    const gameManager = new ethers.Contract(
      this.contracts.gameManager,
      this.gameManagerABI,
      this.wallet
    );

    const data = gameManager.interface.encodeFunctionData('joinGame', [gameId]);

    return {
      to: this.contracts.gameManager,
      data,
      value: wager
    };
  }

  /**
   * Create a dice game
   */
  async createDiceGame(wager: string): Promise<{ gameId: number; txHash: string }> {
    try {
      const gameManager = new ethers.Contract(
        this.contracts.gameManager,
        this.gameManagerABI,
        this.wallet
      );

      logger.info('Creating dice game', {
        wager: ethers.formatEther(wager)
      });

      const tx = await gameManager.createDiceGame(wager, { value: wager });
      const receipt = await tx.wait();

      // Extract game ID from event
      const gameCreatedEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === 'GameCreated'
      );
      
      const gameId = Number(gameCreatedEvent?.args?.[0] || 0);

      logger.info('Dice game created', {
        gameId,
        txHash: receipt.hash
      });

      return {
        gameId,
        txHash: receipt.hash
      };
    } catch (error) {
      logger.error('Failed to create dice game', { wager, error });
      throw error;
    }
  }

  /**
   * Create a coin flip game
   */
  async createCoinFlipGame(wager: string): Promise<{ gameId: number; txHash: string }> {
    try {
      const gameManager = new ethers.Contract(
        this.contracts.gameManager,
        this.gameManagerABI,
        this.wallet
      );

      logger.info('Creating coin flip game', {
        wager: ethers.formatEther(wager)
      });

      const tx = await gameManager.createCoinFlipGame(wager, { value: wager });
      const receipt = await tx.wait();

      // Extract game ID from event
      const gameCreatedEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === 'GameCreated'
      );
      
      const gameId = Number(gameCreatedEvent?.args?.[0] || 0);

      logger.info('Coin flip game created', {
        gameId,
        txHash: receipt.hash
      });

      return {
        gameId,
        txHash: receipt.hash
      };
    } catch (error) {
      logger.error('Failed to create coin flip game', { wager, error });
      throw error;
    }
  }

  /**
   * Join a game
   */
  async joinGame(gameId: number, wager: string): Promise<string> {
    try {
      const gameManager = new ethers.Contract(
        this.contracts.gameManager,
        this.gameManagerABI,
        this.wallet
      );

      logger.info('Joining game', { gameId, wager: ethers.formatEther(wager) });

      const tx = await gameManager.joinGame(gameId, { value: wager });
      const receipt = await tx.wait();

      logger.info('Joined game successfully', {
        gameId,
        txHash: receipt.hash
      });

      return receipt.hash;
    } catch (error) {
      logger.error('Failed to join game', { gameId, wager, error });
      throw error;
    }
  }

  /**
   * Get game count
   */
  async getGameCount(): Promise<number> {
    try {
      const gameManager = new ethers.Contract(
        this.contracts.gameManager,
        this.gameManagerABI,
        this.provider
      );

      const count = await gameManager.gameCount();
      return Number(count);
    } catch (error) {
      logger.error('Failed to get game count', { error });
      throw error;
    }
  }

  /**
   * Get game information
   */
  async getGameInfo(gameId: number): Promise<GameInfo> {
    try {
      const gameManager = new ethers.Contract(
        this.contracts.gameManager,
        this.gameManagerABI,
        this.provider
      );

      const [id, creator, gameType, wager, totalPot, players, state, createdAt, winner] =
        await gameManager.getGame(gameId);

      const gameTypeMap = ['dice', 'coinflip'] as const;
      const stateMap = ['pending', 'active', 'completed', 'cancelled'] as const;

      return {
        id: Number(id),
        type: gameTypeMap[gameType] || 'dice',
        creator,
        wager: ethers.formatEther(wager),
        players,
        state: stateMap[state] || 'pending',
        winner: winner !== ethers.ZeroAddress ? winner : undefined
      };
    } catch (error) {
      logger.error('Failed to get game info', { gameId, error });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userAddress: string): Promise<UserStats> {
    try {
      const xpBadges = new ethers.Contract(
        this.contracts.xpBadges,
        this.xpBadgesABI,
        this.provider
      );

      const [totalXP, gamesPlayed, gamesWon, totalDeposited, proposalsVoted, walletsCreated, streakDays] = 
        await xpBadges.getUserStats(userAddress);

      return {
        totalXP: Number(totalXP),
        gamesPlayed: Number(gamesPlayed),
        gamesWon: Number(gamesWon),
        totalDeposited: ethers.formatEther(totalDeposited),
        proposalsVoted: Number(proposalsVoted),
        walletsCreated: Number(walletsCreated),
        streakDays: Number(streakDays)
      };
    } catch (error) {
      logger.error('Failed to get user stats', { userAddress, error });
      throw error;
    }
  }

  /**
   * Get current ETH price (mock implementation)
   */
  async getEthPrice(): Promise<number> {
    // In a real implementation, this would call a price API
    // For now, return a mock price
    return 2000; // $2000 USD
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(walletAddress: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(walletAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Failed to get wallet balance', { walletAddress, error });
      throw error;
    }
  }

  /**
   * Get agent wallet address
   */
  getAgentAddress(): string {
    return this.wallet.address;
  }

  /**
   * Execute transaction using AgentKit (enhanced method)
   */
  async executeAgentKitTransaction(
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[],
    value?: string
  ): Promise<string> {
    try {
      if (!this.isAgentKitEnabled || !this.walletProvider) {
        logger.warn('AgentKit not available, falling back to ethers');
        return await this.executeFallbackTransaction(contractAddress, abi, methodName, args, value);
      }

      logger.info('Executing transaction via AgentKit', {
        contract: contractAddress,
        method: methodName,
        args,
        value
      });

      // Use AgentKit wallet provider for contract interactions
      const contract = new ethers.Contract(contractAddress, abi, this.walletProvider as any);
      const tx = await contract[methodName](...args, value ? { value } : {});
      const receipt = await tx.wait();

      logger.info('AgentKit transaction completed', { txHash: receipt.hash });
      return receipt.hash;
    } catch (error) {
      logger.error('AgentKit transaction failed, falling back to ethers', { error });
      return await this.executeFallbackTransaction(contractAddress, abi, methodName, args, value);
    }
  }

  /**
   * Fallback transaction execution using ethers
   */
  private async executeFallbackTransaction(
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[],
    value?: string
  ): Promise<string> {
    const contract = new ethers.Contract(contractAddress, abi, this.wallet);
    const tx = await contract[methodName](...args, value ? { value } : {});
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Transfer ETH using AgentKit
   */
  async transferETH(toAddress: string, amount: string): Promise<string> {
    try {
      if (!this.isAgentKitEnabled || !this.walletProvider) {
        logger.warn('AgentKit not available, using fallback for ETH transfer');
        return await this.sendETH(this.wallet.address, toAddress, amount);
      }

      logger.info('Transferring ETH via AgentKit', { to: toAddress, amount });

      // Use the wallet provider to send ETH
      const txHash = await this.walletProvider.nativeTransfer(
        toAddress as `0x${string}`,
        amount
      );

      logger.info('AgentKit ETH transfer completed', { txHash });
      return txHash;
    } catch (error) {
      logger.error('AgentKit ETH transfer failed, using fallback', { error });
      return await this.sendETH(this.wallet.address, toAddress, amount);
    }
  }

  /**
   * Get agent wallet balance (enhanced with AgentKit)
   */
  async getAgentBalance(): Promise<string> {
    try {
      if (this.isAgentKitEnabled && this.walletProvider) {
        const balance = await this.walletProvider.getBalance();
        return ethers.formatEther(balance);
      }

      // Fallback to ethers
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Failed to get agent balance', { error });
      throw error;
    }
  }

  /**
   * Send ETH to an address
   */
  async sendETH(from: string, to: string, amount: string): Promise<string> {
    try {
      logger.info('Sending ETH', {
        from,
        to,
        amount: ethers.formatEther(amount)
      });

      const tx = await this.wallet.sendTransaction({
        to,
        value: amount,
        gasLimit: 21000
      });

      const receipt = await tx.wait();

      logger.info('ETH sent successfully', {
        txHash: receipt?.hash,
        gasUsed: receipt?.gasUsed?.toString()
      });

      return receipt?.hash || tx.hash;
    } catch (error) {
      logger.error('Failed to send ETH', { from, to, amount, error });
      throw error;
    }
  }

  /**
   * Get available badges for user
   */
  async getAvailableBadges(userAddress: string): Promise<Array<{
    type: string;
    level: number;
    name: string;
    description: string;
    xpReward: number;
  }>> {
    try {
      const userStats = await this.getUserStats(userAddress);
      const currentLevel = Math.floor(userStats.totalXP / 100);

      const availableBadges = [];

      // Level-based badges
      if (currentLevel >= 1) {
        availableBadges.push({
          type: 'level',
          level: currentLevel,
          name: `Level ${currentLevel} Badge`,
          description: `Reached level ${currentLevel}`,
          xpReward: currentLevel * 5
        });
      }

      // Game-based badges
      if (userStats.gamesWon >= 5) {
        availableBadges.push({
          type: 'winner',
          level: Math.floor(userStats.gamesWon / 5),
          name: 'Game Winner Badge',
          description: `Won ${userStats.gamesWon} games`,
          xpReward: 25
        });
      }

      return availableBadges;
    } catch (error) {
      logger.error('Failed to get available badges', { userAddress, error });
      return [];
    }
  }

  /**
   * Mint badge NFT
   */
  async mintBadge(userAddress: string, badgeType: string, level: number): Promise<string> {
    try {
      logger.info('Minting badge', { userAddress, badgeType, level });

      // For demo purposes, return a mock transaction hash
      // In production, this would interact with the XPBadges contract
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      logger.info('Badge minted successfully', {
        userAddress,
        badgeType,
        level,
        txHash: mockTxHash
      });

      return mockTxHash;
    } catch (error) {
      logger.error('Failed to mint badge', { userAddress, badgeType, level, error });
      throw error;
    }
  }

  /**
   * Get badge info
   */
  async getBadgeInfo(userAddress: string, tokenId: number): Promise<{
    level: number;
    type: string;
    name: string;
    description: string;
  } | null> {
    try {
      // Mock implementation - in production would query the contract
      return {
        level: Math.floor(tokenId / 10) + 1,
        type: 'level',
        name: `Level ${Math.floor(tokenId / 10) + 1} Badge`,
        description: `Achievement badge for reaching level ${Math.floor(tokenId / 10) + 1}`
      };
    } catch (error) {
      logger.error('Failed to get badge info', { userAddress, tokenId, error });
      return null;
    }
  }

  /**
   * Create a withdrawal proposal
   */
  async createWithdrawalProposal(
    walletAddress: string,
    amount: string,
    toAddress: string,
    description: string
  ): Promise<number> {
    try {
      const wallet = new ethers.Contract(
        walletAddress,
        this.squadWalletABI,
        this.wallet
      );

      logger.info('Creating withdrawal proposal', {
        walletAddress,
        amount: ethers.formatEther(amount),
        toAddress,
        description
      });

      const tx = await wallet.createProposal(
        description,
        toAddress,
        amount,
        '0x' // Empty data for simple ETH transfer
      );
      const receipt = await tx.wait();

      // Extract proposal ID from event
      const proposalCreatedEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === 'ProposalCreated'
      );

      const proposalId = Number(proposalCreatedEvent?.args?.[0] || 0);

      logger.info('Withdrawal proposal created', {
        proposalId,
        txHash: receipt.hash
      });

      return proposalId;
    } catch (error) {
      logger.error('Failed to create withdrawal proposal', { error });
      throw error;
    }
  }

  /**
   * Create a general proposal
   */
  async createProposal(
    walletAddress: string,
    description: string,
    target: string,
    value: string,
    data: string
  ): Promise<number> {
    try {
      const wallet = new ethers.Contract(
        walletAddress,
        this.squadWalletABI,
        this.wallet
      );

      logger.info('Creating proposal', {
        walletAddress,
        description,
        target,
        value
      });

      const tx = await wallet.createProposal(
        description,
        target,
        ethers.parseEther(value),
        data
      );
      const receipt = await tx.wait();

      // Extract proposal ID from event
      const proposalCreatedEvent = receipt.logs.find(
        (log: any) => log.fragment?.name === 'ProposalCreated'
      );

      const proposalId = Number(proposalCreatedEvent?.args?.[0] || 0);

      logger.info('Proposal created', {
        proposalId,
        txHash: receipt.hash
      });

      return proposalId;
    } catch (error) {
      logger.error('Failed to create proposal', { error });
      throw error;
    }
  }

  /**
   * Vote on a proposal
   */
  async voteOnProposal(
    walletAddress: string,
    proposalId: number,
    support: boolean
  ): Promise<string> {
    try {
      const wallet = new ethers.Contract(
        walletAddress,
        this.squadWalletABI,
        this.wallet
      );

      logger.info('Voting on proposal', {
        walletAddress,
        proposalId,
        support
      });

      const tx = await wallet.vote(proposalId, support);
      const receipt = await tx.wait();

      logger.info('Vote recorded', {
        proposalId,
        support,
        txHash: receipt.hash
      });

      return receipt.hash;
    } catch (error) {
      logger.error('Failed to vote on proposal', { error });
      throw error;
    }
  }

  /**
   * Execute a proposal
   */
  async executeProposal(
    walletAddress: string,
    proposalId: number
  ): Promise<string> {
    try {
      const wallet = new ethers.Contract(
        walletAddress,
        this.squadWalletABI,
        this.wallet
      );

      logger.info('Executing proposal', {
        walletAddress,
        proposalId
      });

      const tx = await wallet.executeProposal(proposalId);
      const receipt = await tx.wait();

      logger.info('Proposal executed', {
        proposalId,
        txHash: receipt.hash
      });

      return receipt.hash;
    } catch (error) {
      logger.error('Failed to execute proposal', { error });
      throw error;
    }
  }

  /**
   * Get swap quote (mock implementation)
   */
  async getSwapQuote(tokenA: string, tokenB: string, amount: string): Promise<{
    outputAmount: string;
    priceImpact: string;
    gasEstimate: string;
  }> {
    // Mock implementation - in real app would use Uniswap SDK
    const mockOutputAmount = (parseFloat(ethers.formatEther(amount)) * 0.98).toFixed(4);
    return {
      outputAmount: mockOutputAmount,
      priceImpact: '0.2',
      gasEstimate: '0.002'
    };
  }

  /**
   * Execute swap (mock implementation)
   */
  async executeSwap(): Promise<string> {
    // Mock implementation - would execute actual swap
    return '0x' + '1'.repeat(64); // Mock transaction hash
  }

  /**
   * Get token price using CoinMarketCap API
   */
  async getTokenPrice(token: string): Promise<{
    price: string;
    change24h: number;
    volume24h: string;
    marketCap: string;
  }> {
    try {
      // Use PriceService which integrates with CoinMarketCap
      const priceService = new (await import('./price')).PriceService();
      const priceData = await priceService.getPrice(token);

      return {
        price: priceData.price.toFixed(2),
        change24h: priceData.change24h,
        volume24h: priceData.volume24h ? this.formatLargeNumber(priceData.volume24h) : 'N/A',
        marketCap: priceData.marketCap ? this.formatLargeNumber(priceData.marketCap) : 'N/A'
      };
    } catch (error) {
      logger.error('Failed to get token price from CoinMarketCap', { token, error });

      // Fallback to mock data
      const mockPrices: Record<string, any> = {
        'ETH': { price: '2000.00', change24h: 2.5, volume24h: '1.2B', marketCap: '240B' },
        'USDC': { price: '1.00', change24h: 0.1, volume24h: '800M', marketCap: '25B' },
        'WBTC': { price: '42000.00', change24h: -1.2, volume24h: '500M', marketCap: '8B' }
      };

      return mockPrices[token] || { price: '0.00', change24h: 0, volume24h: '0', marketCap: '0' };
    }
  }

  /**
   * Format large numbers for display (e.g., 1000000 -> 1M)
   */
  private formatLargeNumber(num: number): string {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  }

  /**
   * Get stake info (mock implementation)
   */
  async getStakeInfo(token: string): Promise<{
    apy: string;
    lockPeriod: string;
    estimatedRewards: string;
  }> {
    // Mock implementation
    const mockStakeInfo: Record<string, any> = {
      'ETH': { apy: '4.5', lockPeriod: '30', estimatedRewards: '0.045' },
      'USDC': { apy: '8.2', lockPeriod: '90', estimatedRewards: '0.082' },
      'WETH': { apy: '4.5', lockPeriod: '30', estimatedRewards: '0.045' }
    };

    return mockStakeInfo[token] || { apy: '0', lockPeriod: '0', estimatedRewards: '0' };
  }

  /**
   * Get bridge info (mock implementation)
   */
  async getBridgeInfo(token: string, toNetwork: string, amount: string): Promise<{
    fees: string;
    estimatedTime: string;
  }> {
    // Mock implementation
    const feeAmount = (parseFloat(ethers.formatEther(amount)) * 0.001).toFixed(4);
    return {
      fees: feeAmount,
      estimatedTime: '5-10 minutes'
    };
  }

  /**
   * Get user XP data
   */
  async getUserXP(userAddress: string): Promise<{
    level: number;
    currentXP: number;
    nextLevelXP: number;
    walletXP: number;
    depositXP: number;
    gameXP: number;
    swapXP: number;
    proposalXP: number;
    badgeCount: number;
  }> {
    try {
      const xpBadges = new ethers.Contract(
        this.contracts.xpBadges,
        this.xpBadgesABI,
        this.provider
      );

      const totalXP = await xpBadges.getUserXP(userAddress);
      const badgeCount = await xpBadges.balanceOf(userAddress);

      // Calculate level based on XP (every 1000 XP = 1 level)
      const level = Math.floor(Number(totalXP) / 1000) + 1;
      const currentXP = Number(totalXP) % 1000;
      const nextLevelXP = 1000;

      // Mock breakdown - in real implementation would track separately
      return {
        level,
        currentXP,
        nextLevelXP,
        walletXP: Math.floor(Number(totalXP) * 0.2),
        depositXP: Math.floor(Number(totalXP) * 0.3),
        gameXP: Math.floor(Number(totalXP) * 0.3),
        swapXP: Math.floor(Number(totalXP) * 0.1),
        proposalXP: Math.floor(Number(totalXP) * 0.1),
        badgeCount: Number(badgeCount)
      };
    } catch (error) {
      logger.error('Failed to get user XP', { userAddress, error });
      throw error;
    }
  }

  /**
   * Get XP leaderboard
   */
  async getXPLeaderboard(limit: number): Promise<Array<{
    address: string;
    xp: number;
    level: number;
    badges: number;
  }>> {
    // Mock implementation - in real app would query from contract events or database
    const mockLeaderboard = [
      { address: '0x1234567890123456789012345678901234567890', xp: 5000, level: 5, badges: 8 },
      { address: '0x2345678901234567890123456789012345678901', xp: 4500, level: 4, badges: 6 },
      { address: '0x3456789012345678901234567890123456789012', xp: 4000, level: 4, badges: 5 },
      { address: '0x4567890123456789012345678901234567890123', xp: 3500, level: 3, badges: 4 },
      { address: '0x5678901234567890123456789012345678901234', xp: 3000, level: 3, badges: 3 }
    ];

    return mockLeaderboard.slice(0, limit);
  }



  /**
   * Claim a badge
   */
  async claimBadge(userAddress: string, badgeType: string, level: number): Promise<string> {
    // Mock implementation - in real app would call contract
    logger.info('Claiming badge', { userAddress, badgeType, level });
    return '0x' + '2'.repeat(64); // Mock transaction hash
  }

  /**
   * Get user badges
   */
  async getUserBadges(userAddress: string): Promise<Array<{
    name: string;
    level: number;
    description: string;
    earnedAt: number;
    emoji: string;
    xpReward: number;
  }>> {
    // Mock implementation
    const mockBadges = [
      {
        name: 'First Steps',
        level: 1,
        description: 'Created your first SquadWallet',
        earnedAt: Date.now() / 1000 - 86400,
        emoji: '🚀',
        xpReward: 100
      },
      {
        name: 'Dice Roller',
        level: 1,
        description: 'Played your first game',
        earnedAt: Date.now() / 1000 - 3600,
        emoji: '🎲',
        xpReward: 150
      }
    ];

    return mockBadges;
  }

  /**
   * Get gaming statistics
   */
  async getGamingStats(userAddress: string): Promise<{
    totalGames: number;
    wins: number;
    losses: number;
    currentStreak: number;
    bestStreak: number;
    totalWagered: string;
    totalWinnings: string;
    biggestWin: string;
    diceGames: number;
    diceWins: number;
    coinGames: number;
    coinWins: number;
    luckyNumber?: number;
    favoriteGame?: string;
  }> {
    try {
      const gameManager = new ethers.Contract(
        this.contracts.gameManager,
        this.gameManagerABI,
        this.provider
      );

      const [gamesPlayed, gamesWon, totalWagered, totalWon] =
        await gameManager.getPlayerStats(userAddress);

      // Mock additional stats - in real implementation would track these
      return {
        totalGames: Number(gamesPlayed),
        wins: Number(gamesWon),
        losses: Number(gamesPlayed) - Number(gamesWon),
        currentStreak: 3,
        bestStreak: 7,
        totalWagered: ethers.formatEther(totalWagered),
        totalWinnings: ethers.formatEther(totalWon),
        biggestWin: '0.5',
        diceGames: Math.floor(Number(gamesPlayed) * 0.6),
        diceWins: Math.floor(Number(gamesWon) * 0.6),
        coinGames: Math.floor(Number(gamesPlayed) * 0.4),
        coinWins: Math.floor(Number(gamesWon) * 0.4),
        luckyNumber: 6,
        favoriteGame: 'dice'
      };
    } catch (error) {
      logger.error('Failed to get gaming stats', { userAddress, error });
      throw error;
    }
  }


}
