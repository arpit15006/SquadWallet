/**
 * Type definitions for SquadWallet Agent
 */

export interface AgentConfig {
  xmtpPrivateKey: string;
  xmtpEnv: 'dev' | 'production';
  cdpApiKeyName: string;
  cdpApiKeyPrivateKey: string;
  baseRpcUrl: string;
  contracts: ContractAddresses;
}

export interface ContractAddresses {
  squadWalletFactory: string;
  gameManager: string;
  xpBadges: string;
}

export interface Command {
  name: string;
  args: string[];
  sender: string;
  conversationId: string;
  timestamp: Date;
}

export interface WalletInfo {
  address: string;
  name: string;
  members: string[];
  totalMembers: number;
  createdAt: number;
  balance: string;
}

export interface GameInfo {
  id: number;
  type: 'dice' | 'coinflip';
  creator: string;
  wager: string;
  players: string[];
  state: 'pending' | 'active' | 'completed' | 'cancelled';
  winner?: string;
}

export interface UserStats {
  totalXP: number;
  gamesPlayed: number;
  gamesWon: number;
  totalDeposited: string;
  proposalsVoted: number;
  walletsCreated: number;
  streakDays: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h?: number;
  marketCap?: number;
  lastUpdated?: string;
}

export interface CommandHandler {
  name: string;
  description: string;
  usage: string;
  handler: (command: Command) => Promise<string>;
}

export interface XMTPMessage {
  content: string;
  senderAddress: string;
  conversationId: string;
  timestamp: Date;
}

export interface AgentResponse {
  message: string;
  success: boolean;
  data?: any;
  txHash?: string;
}

export interface LeaderboardEntry {
  address: string;
  name?: string;
  xp: number;
  rank: number;
}

export interface BadgeInfo {
  tokenId: number;
  badgeType: string;
  level: number;
  name: string;
  description: string;
}

export interface ProposalInfo {
  id: number;
  proposer: string;
  description: string;
  target: string;
  value: string;
  votesFor: number;
  votesAgainst: number;
  deadline: number;
  executed: boolean;
}

export interface PortfolioData {
  totalValue: string;
  tokens: TokenBalance[];
  pnl24h: number;
  pnlPercent24h: number;
}

export interface TokenBalance {
  symbol: string;
  balance: string;
  value: string;
  address: string;
}
