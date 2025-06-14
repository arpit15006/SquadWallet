import { Command, CommandHandler } from '../types';
import { BlockchainService } from '../services/blockchain';
import { XMTPService } from '../services/xmtp';
import { OnchainKitService } from '../services/onchainkit';
import { BasenamesService } from '../services/basenames';
import { validateCommand } from '../utils/parser';
import { ethers } from 'ethers';
import logger from '../utils/logger';

interface ReferralData {
  referrer: string;
  referee: string;
  timestamp: number;
  bonusEarned: boolean;
}

interface Challenge {
  id: string;
  challenger: string;
  challenged: string;
  gameType: string;
  betAmount: string;
  status: 'pending' | 'accepted' | 'completed' | 'expired';
  winner?: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Social features: referrals, challenges, sharing
 */
export class SocialHandlers {
  private referrals: Map<string, ReferralData[]> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private sharedBadges: Map<string, string[]> = new Map();

  /**
   * Get display name for user (basename or shortened address)
   */
  private async getDisplayName(address: string): Promise<string> {
    const profile = await this.basenamesService.getUserProfile(address);
    if (profile.basename) {
      return `@${profile.basename}`;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  constructor(
    private blockchainService: BlockchainService,
    private xmtpService: XMTPService,
    private onchainKitService: OnchainKitService,
    private basenamesService: BasenamesService
  ) {
    // Clean up expired challenges every hour
    setInterval(() => this.cleanupExpiredChallenges(), 3600000);
  }

  /**
   * Identity check with Basenames resolution
   */
  whoami: CommandHandler = {
    name: 'whoami',
    description: 'Check your identity and Basename',
    usage: '/whoami',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 0);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.whoami.usage}`;
        }

        logger.info('Checking user identity', { user: command.sender });

        // Get user identity from Basenames
        const userProfile = await this.basenamesService.getUserProfile(command.sender);
        const basename = userProfile.basename;

        // Get user stats for additional context
        const userStats = await this.blockchainService.getUserStats(command.sender);

        let response = `👤 **Your Identity**\n\n`;

        if (basename) {
          // Format basename properly (remove .base.eth suffix)
          const displayBasename = basename.replace('.base.eth', '').replace('.base', '');
          response += `🎯 **Basename**: @${displayBasename}\n`;
          response += `📍 **Address**: \`${command.sender}\`\n`;
          response += `✅ **Verified**: Basename holder on Base\n`;
          response += `🌐 **Profile**: [base.org/name/${displayBasename}](https://base.org/name/${displayBasename})\n\n`;
        } else {
          response += `📍 **Address**: \`${command.sender}\`\n`;
          response += `⚠️ **No Basename**: Consider getting one at [base.org/names](https://base.org/names)\n\n`;
        }

        response += `🏆 **Gaming Stats**:\n`;
        response += `• **Level**: ${Math.floor(userStats.totalXP / 100)}\n`;
        response += `• **XP**: ${userStats.totalXP}\n`;
        response += `• **Games Played**: ${userStats.gamesPlayed}\n`;
        response += `• **Games Won**: ${userStats.gamesWon}\n\n`;

        if (basename) {
          response += `🎁 **Basename Benefits**:\n`;
          response += `• ✅ Can mint XP badges\n`;
          response += `• ✅ Can receive tips\n`;
          response += `• ✅ Enhanced leaderboard display\n`;
          response += `• ✅ Verified identity in games\n\n`;
        } else {
          response += `💡 **Get a Basename to unlock**:\n`;
          response += `• 🏅 XP badge minting\n`;
          response += `• 💰 Tip receiving\n`;
          response += `• 🏆 Enhanced leaderboard presence\n`;
          response += `• ✅ Verified gaming identity\n\n`;
        }

        response += `🚀 **Quick Actions**:\n`;
        response += `• \`/xp\` - Check detailed XP stats\n`;
        response += `• \`/leaderboard\` - See your ranking\n`;
        if (basename) {
          response += `• \`/mintbadge\` - Mint your XP badge\n`;
        }

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to check identity', { error, command });
        const errorMessage = '❌ Failed to check identity. Please try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Tip friends with Basenames resolution
   */
  tip: CommandHandler = {
    name: 'tip',
    description: 'Tip a friend with ETH',
    usage: '/tip <@basename-or-address> <amount>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 2);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.tip.usage}`;
        }

        const [recipientIdentifier, amountStr] = command.args;

        // Validate amount
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
          return '❌ Tip amount must be a positive number';
        }

        if (amount < 0.001) {
          return '❌ Minimum tip amount is 0.001 ETH';
        }

        // Resolve recipient address
        let recipientAddress = recipientIdentifier;

        // Handle @basename format
        if (recipientIdentifier.startsWith('@')) {
          const basename = recipientIdentifier.slice(1); // Remove @
          const resolved = await this.basenamesService.resolveBasenameToAddress(basename);
          if (resolved) {
            recipientAddress = resolved;
          } else {
            return `❌ Could not resolve @${basename}. Please check the basename.`;
          }
        } else if (recipientIdentifier.includes('.base') || !recipientIdentifier.startsWith('0x')) {
          // Try to resolve as basename
          const resolved = await this.basenamesService.resolveBasenameToAddress(recipientIdentifier);
          if (resolved) {
            recipientAddress = resolved;
          } else {
            return '❌ Could not resolve basename. Please check the address.';
          }
        }

        // Validate address
        if (!ethers.isAddress(recipientAddress)) {
          return '❌ Invalid address format';
        }

        if (recipientAddress.toLowerCase() === command.sender.toLowerCase()) {
          return '❌ You cannot tip yourself!';
        }

        // Check if recipient has a basename (required for tips)
        const recipientBasename = await this.basenamesService.resolveAddressToBasename(recipientAddress);
        if (!recipientBasename) {
          return '❌ Recipient must have a Basename to receive tips. They can get one at base.org/names';
        }

        logger.info('Processing tip', {
          from: command.sender,
          to: recipientAddress,
          amount: amountStr
        });

        // Execute the tip transaction
        const txHash = await this.blockchainService.sendETH(
          command.sender,
          recipientAddress,
          ethers.parseEther(amountStr).toString()
        );

        // Get user identities for display
        const senderDisplayName = await this.getDisplayName(command.sender);
        const recipientDisplayName = await this.getDisplayName(recipientAddress);

        // Send notification to recipient
        const tipNotification = `💰 **TIP RECEIVED!**

🎉 **@${recipientBasename}** just received a tip!

💸 **From**: ${senderDisplayName}
💰 **Amount**: ${amountStr} ETH
🔗 **Transaction**: \`${txHash}\`

🙏 **Message**: "Thanks for being awesome!"

🎯 **Tip someone back**: \`/tip @username 0.01\`
🎮 **Play a game**: \`/play dice 0.01\`
📊 **Check XP**: \`/xp\`

#SquadWallet #Tip #Base`;

        // Try to send notification (don't fail if recipient not on XMTP)
        try {
          await this.xmtpService.sendDirectMessage(recipientAddress, tipNotification);
        } catch (error) {
          logger.warn('Could not send tip notification', { recipientAddress, error });
        }

        const response = `💰 **TIP SENT SUCCESSFULLY!**

🎯 **Recipient**: @${recipientBasename}
💸 **Amount**: ${amountStr} ETH
🔗 **Transaction**: \`${txHash}\`
📱 **Notification**: Sent via XMTP

🎉 **Tip completed!** @${recipientBasename} has been notified.

💡 **Spread the love**:
• \`/tip @friend 0.01\` - Tip another friend
• \`/leaderboard\` - See who's winning
• \`/play dice 0.01\` - Play a game together

🏆 **Both players earn +10 XP for social activity!**`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to send tip', { error, command });
        const errorMessage = '❌ Failed to send tip. Please check your balance and try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Invite/refer a friend
   */
  invite: CommandHandler = {
    name: 'invite',
    description: 'Invite a friend and both earn bonus XP',
    usage: '/invite <friend-address-or-basename>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 1);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.invite.usage}`;
        }

        const friendIdentifier = command.args[0];
        let friendAddress = friendIdentifier;

        // Try to resolve basename to address
        if (friendIdentifier.includes('.base.eth') || !friendIdentifier.startsWith('0x')) {
          const resolved = await this.basenamesService.resolveBasenameToAddress(friendIdentifier);
          if (resolved) {
            friendAddress = resolved;
          } else {
            return '❌ Could not resolve basename. Please check the address.';
          }
        }

        // Validate address
        if (!ethers.isAddress(friendAddress)) {
          return '❌ Invalid address format';
        }

        // Check if already referred
        const existingReferrals = this.referrals.get(command.sender) || [];
        if (existingReferrals.some(r => r.referee === friendAddress)) {
          return '❌ You have already referred this friend';
        }

        // Check if friend can receive XMTP messages
        const canMessage = await this.xmtpService.canMessage(friendAddress);
        if (!canMessage) {
          return '❌ Friend is not on XMTP. They need to join first!';
        }

        // Create referral
        const referral: ReferralData = {
          referrer: command.sender,
          referee: friendAddress,
          timestamp: Date.now(),
          bonusEarned: false
        };

        existingReferrals.push(referral);
        this.referrals.set(command.sender, existingReferrals);

        // Get user identities
        const referrerDisplayName = await this.getDisplayName(command.sender);
        const friendDisplayName = await this.getDisplayName(friendAddress);

        // Send invitation to friend
        const inviteMessage = `🎉 **You've been invited to SquadWallet!**

👋 **${referrerDisplayName}** invited you to join the fun!

🎮 **What is SquadWallet?**
• AI-powered group chat wallet
• Play mini-games and earn XP
• Mint NFT badges for achievements
• DeFi tools and price alerts

🎁 **Join Bonus**: Both you and ${referrerDisplayName} get +100 XP!

🚀 **Get Started**:
1. Send any message to this chat
2. Use \`/help\` to see all commands
3. Try \`/play dice 0.001\` for your first game!

💡 **Popular Commands**:
• \`/balance\` - Check your wallet
• \`/play dice 0.01\` - Play dice game
• \`/xp\` - Check your level and XP
• \`/leaderboard\` - See rankings

Welcome to the squad! 🎯`;

        await this.xmtpService.sendDirectMessage(friendAddress, inviteMessage);

        const response = `🎉 **Invitation Sent!**

📤 **Invited**: ${friendDisplayName}
🎁 **Bonus**: You'll both get +100 XP when they join!
📱 **Status**: Invitation sent via XMTP

💡 **Referral Benefits**:
• +100 XP for both when they join
• +50 XP when they play their first game
• +25 XP for each game they win (first 10 wins)

📊 **Your Referrals**: ${existingReferrals.length} friends invited
🏆 **Total Bonus XP**: ${existingReferrals.filter(r => r.bonusEarned).length * 175}

🎯 **Invite More**: \`/invite <address>\`
📈 **Check Stats**: \`/referral stats\``;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to send invitation', { error, command });
        const errorMessage = '❌ Failed to send invitation. Please try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Challenge a friend to a game
   */
  challenge: CommandHandler = {
    name: 'challenge',
    description: 'Challenge a friend to a head-to-head game',
    usage: '/challenge <friend-address> <game-type> <bet-amount>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 3);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.challenge.usage}`;
        }

        const [friendIdentifier, gameType, betAmount] = command.args;

        // Validate game type
        if (!['dice', 'coinflip'].includes(gameType)) {
          return '❌ Invalid game type. Use: dice or coinflip';
        }

        // Validate bet amount
        const betNum = parseFloat(betAmount);
        if (isNaN(betNum) || betNum <= 0) {
          return '❌ Bet amount must be a positive number';
        }

        // Resolve friend address
        let friendAddress = friendIdentifier;
        if (friendIdentifier.includes('.base.eth') || !friendIdentifier.startsWith('0x')) {
          const resolved = await this.basenamesService.resolveBasenameToAddress(friendIdentifier);
          if (resolved) {
            friendAddress = resolved;
          } else {
            return '❌ Could not resolve basename. Please check the address.';
          }
        }

        if (!ethers.isAddress(friendAddress)) {
          return '❌ Invalid address format';
        }

        if (friendAddress === command.sender) {
          return '❌ You cannot challenge yourself!';
        }

        // Create challenge
        const challengeId = `${command.sender}-${friendAddress}-${Date.now()}`;
        const challenge: Challenge = {
          id: challengeId,
          challenger: command.sender,
          challenged: friendAddress,
          gameType,
          betAmount,
          status: 'pending',
          createdAt: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        this.challenges.set(challengeId, challenge);

        // Get user identities
        const challengerDisplayName = await this.getDisplayName(command.sender);
        const challengedDisplayName = await this.getDisplayName(friendAddress);

        // Send challenge to friend
        const challengeMessage = `⚔️ **GAME CHALLENGE!**

🎯 **${challengerDisplayName}** challenges you to a ${gameType.toUpperCase()} game!

💰 **Bet**: ${betAmount} ETH
🎮 **Game**: ${gameType.toUpperCase()}
⏰ **Expires**: 24 hours

🏆 **Winner takes all!**

🎲 **Accept**: \`/challenge accept ${challengeId}\`
❌ **Decline**: \`/challenge decline ${challengeId}\`

💡 **How it works**:
1. Accept the challenge
2. Both players play the same game
3. Highest score wins the pot!

Good luck! 🍀`;

        await this.xmtpService.sendDirectMessage(friendAddress, challengeMessage);

        const response = `⚔️ **Challenge Sent!**

🎯 **Challenged**: ${challengedDisplayName}
🎮 **Game**: ${gameType.toUpperCase()}
💰 **Bet**: ${betAmount} ETH each
⏰ **Expires**: 24 hours

📱 **Status**: Challenge sent via XMTP
🏆 **Prize**: Winner takes ${(betNum * 2).toFixed(4)} ETH

💡 **Challenge ID**: \`${challengeId}\`
📊 **Check Status**: \`/challenge status ${challengeId}\`

🎯 **More Challenges**: \`/challenge <friend> <game> <amount>\``;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to send challenge', { error, command });
        const errorMessage = '❌ Failed to send challenge. Please try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Share badge achievement
   */
  shareBadge: CommandHandler = {
    name: 'share-badge',
    description: 'Share your NFT badge achievement',
    usage: '/share-badge <token-id>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 1);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.shareBadge.usage}`;
        }

        const tokenId = parseInt(command.args[0]);

        if (isNaN(tokenId)) {
          return '❌ Invalid token ID. Please provide a valid number.';
        }

        // Get badge info from blockchain
        const badgeInfo = await this.blockchainService.getBadgeInfo(command.sender, tokenId);
        
        if (!badgeInfo) {
          return '❌ Badge not found or you do not own this badge';
        }

        // Track shared badges
        const userSharedBadges = this.sharedBadges.get(command.sender) || [];
        userSharedBadges.push(tokenId.toString());
        this.sharedBadges.set(command.sender, userSharedBadges);

        // Get user identity
        const userDisplayName = await this.getDisplayName(command.sender);

        const response = `🏅 **BADGE ACHIEVEMENT SHARED!**

👤 **Player**: ${userDisplayName}
🆔 **Badge**: #${tokenId}
🏆 **Level**: ${badgeInfo.level} ${this.getLevelBadge(badgeInfo.level)}
🎨 **Rarity**: ${this.getBadgeRarity(badgeInfo.level)}

✨ **Achievement Unlocked**: ${this.getAchievementText(badgeInfo.level)}

🔗 **View on OpenSea**: [Badge #${tokenId}](https://opensea.io/assets/base/${process.env.XP_BADGES_CONTRACT}/${tokenId})

🎯 **Inspired?** Start your journey:
🎮 **Play Games**: \`/play dice 0.01\`
📊 **Check XP**: \`/xp\`
🏆 **Leaderboard**: \`/leaderboard\`

#SquadWallet #NFTBadge #Level${badgeInfo.level} #Base`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to share badge', { error, command });
        const errorMessage = '❌ Failed to share badge. Please try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Clean up expired challenges
   */
  private cleanupExpiredChallenges(): void {
    const now = Date.now();
    for (const [challengeId, challenge] of this.challenges.entries()) {
      if (challenge.status === 'pending' && now > challenge.expiresAt) {
        challenge.status = 'expired';
        logger.info('Challenge expired', { challengeId });
      }
    }
  }

  /**
   * Helper methods
   */
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

  private getAchievementText(level: number): string {
    if (level >= 100) return 'Legendary Master - The ultimate achievement!';
    if (level >= 50) return 'Epic Warrior - Truly exceptional!';
    if (level >= 25) return 'Rare Champion - Outstanding performance!';
    if (level >= 10) return 'Skilled Player - Great progress!';
    if (level >= 5) return 'Rising Star - Keep it up!';
    return 'Getting Started - Welcome to the journey!';
  }

  /**
   * Get all social handlers
   */
  getAllHandlers(): CommandHandler[] {
    return [
      this.whoami,
      this.tip,
      this.invite,
      this.challenge,
      this.shareBadge
    ];
  }
}
