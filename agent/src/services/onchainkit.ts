import { ethers } from 'ethers';
import logger from '../utils/logger';

/**
 * Enhanced OnchainKit integration for rich UI components, frames, and Web3 interactions
 */
export class OnchainKitService {
  private baseUrl: string;
  private frameCache: Map<string, any> = new Map();
  private componentRegistry: Map<string, any> = new Map();

  constructor() {
    this.baseUrl = process.env.ONCHAINKIT_BASE_URL || 'https://onchainkit.xyz';
    this.initializeComponents();

    logger.info('Enhanced OnchainKit service initialized', {
      baseUrl: this.baseUrl,
      features: ['frames', 'identity', 'wallet', 'transactions', 'swap']
    });
  }

  /**
   * Initialize OnchainKit components registry
   */
  private initializeComponents(): void {
    this.componentRegistry.set('identity', {
      name: 'Identity',
      description: 'Display user identity with avatar, name, and address',
      props: ['address', 'chain', 'hasCopyAddressOnClick']
    });

    this.componentRegistry.set('avatar', {
      name: 'Avatar',
      description: 'Display user avatar from Basenames or ENS',
      props: ['address', 'chain', 'size']
    });

    this.componentRegistry.set('name', {
      name: 'Name',
      description: 'Display user basename or ENS name',
      props: ['address', 'chain']
    });

    this.componentRegistry.set('wallet', {
      name: 'Wallet',
      description: 'Wallet connection and management',
      props: ['className']
    });

    this.componentRegistry.set('swap', {
      name: 'Swap',
      description: 'Token swap interface',
      props: ['fromToken', 'toToken', 'amount']
    });
  }

  /**
   * Generate game result frame
   */
  generateGameResultFrame(gameData: {
    gameType: string;
    result: number | string;
    isWin: boolean;
    betAmount: string;
    payout?: string;
    xpEarned: number;
    newLevel: number;
    playerAddress: string;
  }): string {
    const { gameType, result, isWin, betAmount, payout, xpEarned, newLevel } = gameData;
    
    return `🎮 **${gameType.toUpperCase()} GAME RESULT**

${this.getGameEmoji(gameType)} **Result**: ${result} ${this.getResultEmoji(result, isWin)}
💰 **Bet**: ${betAmount} ETH
${isWin ? '🎉 **WIN!** 🎉' : '💔 **Better luck next time!**'}
${isWin && payout ? `💵 **Payout**: ${payout} ETH` : ''}

⭐ **XP Earned**: +${xpEarned}
🏆 **New Level**: ${newLevel} ${this.getLevelBadge(newLevel)}

${this.generateProgressBar(xpEarned, newLevel)}

🎮 **Play Again**: \`/play ${gameType} ${betAmount}\`
📊 **Check Stats**: \`/stats\`
🏅 **Leaderboard**: \`/leaderboard\``;
  }

  /**
   * Generate NFT badge preview frame
   */
  generateBadgeFrame(badgeData: {
    tokenId: string;
    level: number;
    xp: number;
    imageUrl: string;
    mintTimestamp: number;
    playerAddress: string;
  }): string {
    const { tokenId, level, xp, imageUrl, mintTimestamp } = badgeData;
    
    return `🏅 **XP BADGE NFT MINTED!**

🆔 **Token ID**: #${tokenId}
🏆 **Level**: ${level} ${this.getLevelBadge(level)}
⭐ **Total XP**: ${xp.toLocaleString()}
🖼️ **Image**: ${imageUrl}
⏰ **Minted**: ${new Date(mintTimestamp * 1000).toLocaleDateString()}

✨ **Badge Rarity**: ${this.getBadgeRarity(level)}
🎯 **Next Milestone**: ${this.getNextMilestone(level)} XP

🔗 **View on OpenSea**: \`/badge view ${tokenId}\`
📤 **Share Badge**: \`/share-badge ${tokenId}\`
🎮 **Earn More XP**: \`/play dice 0.01\``;
  }

  /**
   * Generate wallet balance frame
   */
  generateWalletFrame(walletData: {
    address: string;
    ethBalance: string;
    usdValue: string;
    tokens: Array<{symbol: string, balance: string, usdValue: string}>;
    recentTx: Array<{hash: string, type: string, amount: string}>;
  }): string {
    const { address, ethBalance, usdValue, tokens, recentTx } = walletData;
    
    let frame = `💰 **SQUAD WALLET**

👤 **Address**: \`${address.slice(0, 6)}...${address.slice(-4)}\`
💎 **ETH Balance**: ${parseFloat(ethBalance).toFixed(4)} ETH
💵 **USD Value**: ~$${usdValue}

📊 **Token Holdings**:`;

    tokens.slice(0, 5).forEach(token => {
      frame += `\n• **${token.symbol}**: ${parseFloat(token.balance).toFixed(4)} (~$${token.usdValue})`;
    });

    frame += `\n\n🔄 **Recent Activity**:`;
    recentTx.slice(0, 3).forEach(tx => {
      frame += `\n• ${tx.type}: ${tx.amount} ETH (\`${tx.hash.slice(0, 8)}...\`)`;
    });

    frame += `\n\n💡 **Quick Actions**:
🔄 **Swap**: \`/swap ETH USDC 0.1\`
📤 **Send**: \`/send @friend 0.01\`
🎮 **Play**: \`/play dice 0.01\`
📈 **Price**: \`/price ETH\``;

    return frame;
  }

  /**
   * Generate leaderboard frame
   */
  generateLeaderboardFrame(leaderboardData: {
    players: Array<{
      address: string;
      basename?: string;
      level: number;
      xp: number;
      gamesWon: number;
      rank: number;
    }>;
    currentPlayer?: {
      rank: number;
      level: number;
      xp: number;
    };
  }): string {
    const { players, currentPlayer } = leaderboardData;
    
    let frame = `🏆 **SQUAD LEADERBOARD**

👑 **Top Players**:`;

    players.slice(0, 10).forEach(player => {
      const name = player.basename || `${player.address.slice(0, 6)}...${player.address.slice(-4)}`;
      const medal = this.getRankMedal(player.rank);
      frame += `\n${medal} **${player.rank}.** ${name}`;
      frame += `\n   🏆 Level ${player.level} | ⭐ ${player.xp.toLocaleString()} XP | 🎮 ${player.gamesWon} wins\n`;
    });

    if (currentPlayer) {
      frame += `\n📍 **Your Rank**: #${currentPlayer.rank}`;
      frame += `\n🏆 **Your Level**: ${currentPlayer.level} ${this.getLevelBadge(currentPlayer.level)}`;
      frame += `\n⭐ **Your XP**: ${currentPlayer.xp.toLocaleString()}`;
    }

    frame += `\n\n🎯 **Climb the Ranks**:
🎮 **Play Games**: \`/play dice 0.01\`
🏅 **Check XP**: \`/xp\`
🎖️ **Mint Badge**: \`/mintbadge\``;

    return frame;
  }

  /**
   * Generate tournament frame
   */
  generateTournamentFrame(tournamentData: {
    name: string;
    entryFee: string;
    prizePool: string;
    participants: number;
    maxParticipants: number;
    startTime: number;
    endTime: number;
    status: 'upcoming' | 'active' | 'ended';
    winner?: string;
  }): string {
    const { name, entryFee, prizePool, participants, maxParticipants, startTime, endTime, status, winner } = tournamentData;
    
    let frame = `🏆 **TOURNAMENT: ${name}**

💰 **Entry Fee**: ${entryFee} ETH
🎁 **Prize Pool**: ${prizePool} ETH
👥 **Participants**: ${participants}/${maxParticipants}
📅 **Start**: ${new Date(startTime * 1000).toLocaleDateString()}
⏰ **End**: ${new Date(endTime * 1000).toLocaleDateString()}
🔥 **Status**: ${status.toUpperCase()}`;

    if (status === 'upcoming') {
      frame += `\n\n🎯 **Join Tournament**:
✅ **Entry**: \`/tournament join ${name.toLowerCase().replace(/\s+/g, '-')}\`
📊 **Details**: \`/tournament info ${name.toLowerCase().replace(/\s+/g, '-')}\``;
    } else if (status === 'active') {
      frame += `\n\n🎮 **Tournament Active!**
🎲 **Play**: \`/play dice ${entryFee}\`
📊 **Standings**: \`/tournament leaderboard\``;
    } else if (status === 'ended' && winner) {
      frame += `\n\n🎉 **Tournament Complete!**
👑 **Winner**: ${winner}
🏆 **Prize**: ${prizePool} ETH`;
    }

    return frame;
  }

  /**
   * Helper methods for UI elements
   */
  private getGameEmoji(gameType: string): string {
    const emojis: Record<string, string> = {
      'dice': '🎲',
      'coinflip': '🪙',
      'roulette': '🎰',
      'blackjack': '🃏'
    };
    return emojis[gameType] || '🎮';
  }

  private getResultEmoji(result: number | string, isWin: boolean): string {
    if (isWin) return '🎉';
    return '💔';
  }

  private getLevelBadge(level: number): string {
    if (level >= 100) return '👑';
    if (level >= 50) return '💎';
    if (level >= 25) return '🥇';
    if (level >= 10) return '🥈';
    if (level >= 5) return '🥉';
    return '🏅';
  }

  private getBadgeRarity(level: number): string {
    if (level >= 100) return 'Legendary 👑';
    if (level >= 50) return 'Epic 💎';
    if (level >= 25) return 'Rare 🥇';
    if (level >= 10) return 'Uncommon 🥈';
    return 'Common 🥉';
  }

  private getNextMilestone(level: number): number {
    const milestones = [5, 10, 25, 50, 100];
    return milestones.find(m => m > level) || (level + 50);
  }

  private generateProgressBar(xpEarned: number, level: number): string {
    const xpForNextLevel = level * 100; // Simple formula
    const currentXP = (level - 1) * 100 + xpEarned;
    const progress = Math.min((currentXP % 100) / 100, 1);
    const filledBars = Math.floor(progress * 10);
    const emptyBars = 10 - filledBars;
    
    return `📊 **Progress to Level ${level + 1}**: ${'█'.repeat(filledBars)}${'░'.repeat(emptyBars)} ${Math.floor(progress * 100)}%`;
  }

  private getRankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    return '🎖️';
  }

  /**
   * Generate swap interface frame
   */
  generateSwapFrame(swapData: {
    fromToken: string;
    toToken: string;
    fromAmount: string;
    toAmount: string;
    priceImpact: string;
    gasEstimate: string;
    slippage: string;
  }): string {
    const { fromToken, toToken, fromAmount, toAmount, priceImpact, gasEstimate, slippage } = swapData;

    return `🔄 **TOKEN SWAP**

📤 **From**: ${fromAmount} ${fromToken}
📥 **To**: ${toAmount} ${toToken}
📊 **Price Impact**: ${priceImpact}%
⛽ **Gas**: ~${gasEstimate} ETH
🎯 **Slippage**: ${slippage}%

💡 **Swap Rate**: 1 ${fromToken} = ${(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} ${toToken}

🔧 **Actions**:
✅ **Confirm**: \`/swap confirm\`
❌ **Cancel**: \`/swap cancel\`
⚙️ **Settings**: \`/swap settings\``;
  }

  /**
   * Generate portfolio overview frame
   */
  generatePortfolioFrame(portfolioData: {
    totalValue: string;
    pnl24h: string;
    pnlPercent: string;
    tokens: Array<{
      symbol: string;
      balance: string;
      value: string;
      change24h: string;
    }>;
  }): string {
    const { totalValue, pnl24h, pnlPercent, tokens } = portfolioData;
    const isPositive = parseFloat(pnl24h) >= 0;

    let frame = `📊 **PORTFOLIO OVERVIEW**

💰 **Total Value**: $${totalValue}
${isPositive ? '📈' : '📉'} **24h P&L**: ${isPositive ? '+' : ''}$${pnl24h} (${pnlPercent}%)

🪙 **Holdings**:`;

    tokens.forEach(token => {
      const changeEmoji = parseFloat(token.change24h) >= 0 ? '📈' : '📉';
      frame += `\n• **${token.symbol}**: ${token.balance} (~$${token.value}) ${changeEmoji}`;
    });

    frame += `\n\n🔧 **Portfolio Actions**:
🔄 **Rebalance**: \`/rebalance\`
📈 **Analytics**: \`/analytics\`
🎯 **Set Alerts**: \`/alerts\``;

    return frame;
  }

  /**
   * Generate identity frame with Basenames
   */
  generateIdentityFrame(identityData: {
    address: string;
    basename?: string;
    avatar?: string;
    level: number;
    xp: number;
    joinedDate: number;
    gamesPlayed: number;
    achievements: string[];
  }): string {
    const { address, basename, avatar, level, xp, joinedDate, gamesPlayed, achievements } = identityData;

    return `👤 **PLAYER IDENTITY**

🏷️ **Name**: ${basename || `${address.slice(0, 6)}...${address.slice(-4)}`}
📍 **Address**: \`${address}\`
${avatar ? `🖼️ **Avatar**: ${avatar}` : ''}
🏆 **Level**: ${level} ${this.getLevelBadge(level)}
⭐ **XP**: ${xp.toLocaleString()}
📅 **Joined**: ${new Date(joinedDate).toLocaleDateString()}
🎮 **Games Played**: ${gamesPlayed}

🏅 **Achievements**: ${achievements.length > 0 ? achievements.join(', ') : 'None yet'}

🔧 **Profile Actions**:
🎖️ **Mint Badge**: \`/mintbadge\`
📊 **Full Stats**: \`/stats\`
🎮 **Play Game**: \`/play dice 0.01\``;
  }

  /**
   * Get random game tip
   */
  private getRandomGameTip(): string {
    const tips = [
      "Start with small bets to learn the games!",
      "Check the leaderboard to see top players!",
      "Mint NFT badges to show off your achievements!",
      "Join tournaments for bigger prizes!",
      "Invite friends to earn bonus XP!",
      "Use /stats to track your progress!",
      "Set price alerts with /price alerts!",
      "Try different games to maximize XP!"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  /**
   * Get network name from chain ID
   */
  private getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      8453: 'Base Mainnet',
      84532: 'Base Sepolia',
      137: 'Polygon',
      10: 'Optimism'
    };
    return networks[chainId] || `Chain ${chainId}`;
  }

  /**
   * Get component info
   */
  getComponentInfo(componentName: string): any {
    return this.componentRegistry.get(componentName);
  }

  /**
   * List available components
   */
  listComponents(): string[] {
    return Array.from(this.componentRegistry.keys());
  }
}
