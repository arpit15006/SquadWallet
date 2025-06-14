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
  totalPot: string;
  createdAt: number;
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
}

export interface BadgeInfo {
  tokenId: number;
  badgeType: string;
  level: number;
  name: string;
  description: string;
  imageUrl?: string;
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

export interface TokenBalance {
  symbol: string;
  balance: string;
  value: string;
  address: string;
}

export interface PortfolioData {
  totalValue: string;
  tokens: TokenBalance[];
  pnl24h: number;
  pnlPercent24h: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'user' | 'agent' | 'system';
}
