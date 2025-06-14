import { Command, CommandHandler } from '../types';
import { BlockchainService } from '../services/blockchain';
import { XMTPService } from '../services/xmtp';
import { BasenamesService } from '../services/basenames';
import { validateCommand } from '../utils/parser';
import logger from '../utils/logger';

/**
 * XP and Badge system command handlers
 */
export class XPHandlers {
  constructor(
    private blockchainService: BlockchainService,
    private xmtpService: XMTPService,
    private basenamesService: BasenamesService
  ) {}

  /**
   * XP command handler - show user's XP and level
   */
  xp: CommandHandler = {
    name: 'xp',
    description: 'Check your XP and level',
    usage: '/xp [user-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [0, 1]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.xp.usage}`;
        }

        const userAddress = command.args[0] || command.sender;

        logger.info('Getting XP info', { userAddress, requester: command.sender });

        const xpData = await this.blockchainService.getUserXP(userAddress);
        const isOwnXP = userAddress.toLowerCase() === command.sender.toLowerCase();

        const response = `⭐ **${isOwnXP ? 'Your' : 'User'} XP Status**

👤 **User**: \`${userAddress}\`
🏆 **Level**: ${xpData.level}
⭐ **XP**: ${xpData.currentXP} / ${xpData.nextLevelXP}
📈 **Progress**: ${Math.round((xpData.currentXP / xpData.nextLevelXP) * 100)}%

🎯 **XP Breakdown:**
• Wallet Creation: ${xpData.walletXP} XP
• Deposits: ${xpData.depositXP} XP
• Games Won: ${xpData.gameXP} XP
• Swaps: ${xpData.swapXP} XP
• Proposals: ${xpData.proposalXP} XP

🏅 **Badges Earned**: ${xpData.badgeCount}
🎁 **Next Reward**: Level ${xpData.level + 1} Badge

${isOwnXP ? '💡 **Earn More XP:**\n• Play games: \`/play dice 0.01\`\n• Make deposits: \`/deposit 0.1\`\n• Create proposals: \`/propose <description>\`' : ''}`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to get XP info', { error, command });
        const errorMessage = '❌ Failed to get XP information. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Leaderboard command handler
   */
  leaderboard: CommandHandler = {
    name: 'leaderboard',
    description: 'Show XP leaderboard',
    usage: '/leaderboard [limit]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [0, 1]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.leaderboard.usage}`;
        }

        const limitStr = command.args[0] || '10';
        const limit = parseInt(limitStr);
        
        if (isNaN(limit) || limit < 1 || limit > 50) {
          return '❌ Limit must be a number between 1 and 50';
        }

        logger.info('Getting leaderboard', { limit, requester: command.sender });

        const leaderboard = await this.blockchainService.getXPLeaderboard(limit);
        
        let response = `🏆 **XP Leaderboard** (Top ${limit})\n\n`;

        leaderboard.forEach((user, index) => {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
          const isCurrentUser = user.address.toLowerCase() === command.sender.toLowerCase();
          const highlight = isCurrentUser ? '**' : '';
          
          response += `${medal} ${highlight}Level ${user.level} - ${user.xp} XP${highlight}\n`;
          response += `   \`${user.address.slice(0, 6)}...${user.address.slice(-4)}\`\n`;
          if (user.badges > 0) {
            response += `   🏅 ${user.badges} badges\n`;
          }
          response += '\n';
        });

        response += `💡 **Climb the ranks by:**
• Playing games and winning
• Creating and participating in proposals
• Making deposits and swaps
• Earning badges for achievements`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to get leaderboard', { error, command });
        const errorMessage = '❌ Failed to get leaderboard. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Badge claim command handler
   */
  badgeClaim: CommandHandler = {
    name: 'badge',
    description: 'Claim available badges',
    usage: '/badge claim [badge-type]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [1, 2]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.badgeClaim.usage}`;
        }

        const action = command.args[0].toLowerCase();
        if (action !== 'claim') {
          return '❌ Invalid action. Use `/badge claim` to claim badges.';
        }

        const badgeType = command.args[1] || 'auto';

        logger.info('Processing badge claim', { 
          badgeType, 
          claimer: command.sender 
        });

        const availableBadges = await this.blockchainService.getAvailableBadges(command.sender);
        
        if (availableBadges.length === 0) {
          const response = `🏅 **No Badges Available**

You don't have any badges ready to claim yet.

🎯 **Earn Badges By:**
• Reaching Level 5: "Squad Starter" badge
• Winning 10 games: "Lucky Player" badge  
• Creating 5 wallets: "Wallet Master" badge
• Making 20 deposits: "Contributor" badge
• Winning 100 games: "Game Champion" badge

⭐ **Current XP**: Check with \`/xp\`
🏆 **Leaderboard**: Check with \`/leaderboard\``;

          await this.xmtpService.sendResponse(command.conversationId, response, true);
          return response;
        }

        // Claim the first available badge or specific badge type
        let badgeToClaim = availableBadges[0];
        if (badgeType !== 'auto') {
          const specificBadge = availableBadges.find(b => 
            b.type.toLowerCase().includes(badgeType.toLowerCase())
          );
          if (specificBadge) {
            badgeToClaim = specificBadge;
          }
        }

        const txHash = await this.blockchainService.claimBadge(
          command.sender, 
          badgeToClaim.type,
          badgeToClaim.level
        );

        const response = `🎉 **Badge Claimed Successfully!**

🏅 **Badge**: ${badgeToClaim.name}
⭐ **Level**: ${badgeToClaim.level}
📝 **Description**: ${badgeToClaim.description}
🔗 **Transaction**: \`${txHash}\`

🎁 **Rewards:**
• +${badgeToClaim.xpReward} XP bonus
• Exclusive NFT badge
• Bragging rights!

${availableBadges.length > 1 ? `💡 You have ${availableBadges.length - 1} more badges available to claim!` : ''}`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to claim badge', { error, command });
        const errorMessage = '❌ Failed to claim badge. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Badges list command handler
   */
  badges: CommandHandler = {
    name: 'badges',
    description: 'List your earned badges',
    usage: '/badges [user-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [0, 1]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.badges.usage}`;
        }

        const userAddress = command.args[0] || command.sender;
        const isOwnBadges = userAddress.toLowerCase() === command.sender.toLowerCase();

        logger.info('Getting user badges', { userAddress, requester: command.sender });

        const userBadges = await this.blockchainService.getUserBadges(userAddress);
        
        if (userBadges.length === 0) {
          const response = `🏅 **${isOwnBadges ? 'Your' : 'User'} Badge Collection**

👤 **User**: \`${userAddress}\`
📭 **No badges earned yet**

${isOwnBadges ? `🎯 **Start earning badges:**
• Play games: \`/play dice 0.01\`
• Create wallets: \`/create-wallet MySquad\`
• Make deposits: \`/deposit 0.1\`
• Check available badges: \`/badge claim\`` : ''}`;

          await this.xmtpService.sendResponse(command.conversationId, response, true);
          return response;
        }

        let response = `🏅 **${isOwnBadges ? 'Your' : 'User'} Badge Collection** (${userBadges.length})\n\n`;
        response += `👤 **User**: \`${userAddress}\`\n\n`;

        userBadges.forEach((badge, index) => {
          response += `${index + 1}. **${badge.name}** ${badge.emoji}\n`;
          response += `   Level ${badge.level} • Earned ${new Date(badge.earnedAt * 1000).toLocaleDateString()}\n`;
          response += `   ${badge.description}\n\n`;
        });

        response += `🎁 **Total XP from badges**: ${userBadges.reduce((sum, b) => sum + b.xpReward, 0)}`;

        if (isOwnBadges) {
          response += `\n\n💡 **Keep earning more badges with \`/badge claim\`!**`;
        }

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to get user badges', { error, command });
        const errorMessage = '❌ Failed to get badge information. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Mint badge command (requires Basename)
   */
  mintbadge: CommandHandler = {
    name: 'mintbadge',
    description: 'Mint an XP badge NFT (requires Basename)',
    usage: '/mintbadge [badge-type]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [0, 1]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.mintbadge.usage}`;
        }

        // Check if user has a Basename (required for badge minting)
        const basename = await this.basenamesService.resolveAddressToBasename(command.sender);
        if (!basename) {
          return `❌ **Basename Required for Badge Minting**

🏅 **Why?** Badges are exclusive to verified Basename holders
🌐 **Get yours**: [base.org/names](https://base.org/names)

✨ **Benefits of having a Basename**:
• 🏅 Mint exclusive XP badge NFTs
• 💰 Receive tips from friends
• 🏆 Enhanced leaderboard display
• ✅ Verified identity in games

💡 **Once you have a Basename, come back and use \`/mintbadge\`!**`;
        }

        const badgeType = command.args[0] || 'auto';

        logger.info('Processing badge mint', {
          badgeType,
          minter: command.sender,
          basename
        });

        // Get user XP and determine available badges
        const userStats = await this.blockchainService.getUserStats(command.sender);
        const currentLevel = Math.floor(userStats.totalXP / 100);

        if (currentLevel < 1) {
          return `❌ **Insufficient XP for Badge Minting**

⭐ **Current XP**: ${userStats.totalXP}
🏆 **Current Level**: ${currentLevel}
🎯 **Required**: Level 1 (100 XP minimum)

🎮 **Earn XP by**:
• Playing games: \`/play dice 0.01\`
• Winning tournaments
• Inviting friends: \`/invite @friend\`

📊 **Check progress**: \`/xp\``;
        }

        // Get available badges
        const availableBadges = await this.blockchainService.getAvailableBadges(command.sender);

        if (availableBadges.length === 0) {
          return `🏅 **No New Badges Available**

🎯 **@${basename}** - You've claimed all available badges for your level!

⭐ **Current Level**: ${currentLevel}
🏆 **Next Badge**: Level ${currentLevel + 1} (${(currentLevel + 1) * 100} XP)
📈 **XP Needed**: ${((currentLevel + 1) * 100) - userStats.totalXP}

🎮 **Keep playing to unlock the next badge!**
• \`/play dice 0.01\` - Earn XP through games
• \`/leaderboard\` - See your ranking
• \`/xp\` - Check detailed stats`;
        }

        // Mint the badge
        let badgeToClaim = availableBadges[0];
        if (badgeType !== 'auto') {
          const specificBadge = availableBadges.find(b =>
            b.type.toLowerCase().includes(badgeType.toLowerCase())
          );
          if (specificBadge) {
            badgeToClaim = specificBadge;
          }
        }

        const txHash = await this.blockchainService.mintBadge(
          command.sender,
          badgeToClaim.type,
          badgeToClaim.level
        );

        const rarity = this.getBadgeRarity(badgeToClaim.level);
        const rarityEmoji = this.getRarityEmoji(badgeToClaim.level);

        const response = `🎉 **BADGE MINTED SUCCESSFULLY!**

👤 **Player**: @${basename}
🏅 **Badge**: ${badgeToClaim.type} Badge
🏆 **Level**: ${badgeToClaim.level}
🎨 **Rarity**: ${rarity} ${rarityEmoji}
🔗 **Transaction**: \`${txHash}\`

✨ **Achievement Unlocked**: ${this.getAchievementText(badgeToClaim.level)}

🎁 **Badge Benefits**:
• 🏆 Permanent proof of your level
• 📈 +${badgeToClaim.level * 5} bonus XP
• 🎯 Tradeable NFT on OpenSea
• 🌟 Enhanced profile display

🚀 **Next Steps**:
• \`/share-badge <tokenId>\` - Share your achievement
• \`/badges\` - View your collection
• \`/leaderboard\` - See your enhanced ranking

🎮 **Keep playing to unlock rarer badges!**

#SquadWallet #NFTBadge #Level${badgeToClaim.level} #${basename}`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to mint badge', { error, command });
        const errorMessage = '❌ Failed to mint badge. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Helper methods for badge rarity
   */
  private getBadgeRarity(level: number): string {
    if (level >= 50) return 'Legendary';
    if (level >= 25) return 'Epic';
    if (level >= 10) return 'Rare';
    if (level >= 5) return 'Uncommon';
    return 'Common';
  }

  private getRarityEmoji(level: number): string {
    if (level >= 50) return '👑';
    if (level >= 25) return '💎';
    if (level >= 10) return '🥇';
    if (level >= 5) return '🥈';
    return '🥉';
  }

  private getAchievementText(level: number): string {
    if (level >= 50) return 'Legendary Master - The ultimate achievement!';
    if (level >= 25) return 'Epic Warrior - Truly exceptional!';
    if (level >= 10) return 'Rare Champion - Outstanding performance!';
    if (level >= 5) return 'Rising Star - Keep it up!';
    return 'Getting Started - Welcome to the journey!';
  }

  /**
   * Get all XP handlers
   */
  getAllHandlers(): CommandHandler[] {
    return [
      this.xp,
      this.leaderboard,
      this.badgeClaim,
      this.badges,
      this.mintbadge
    ];
  }
}
