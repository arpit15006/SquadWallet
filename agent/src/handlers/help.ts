import { Command, CommandHandler } from '../types';
import { XMTPService } from '../services/xmtp';
import { validateCommand } from '../utils/parser';
import logger from '../utils/logger';

/**
 * Enhanced help command handlers
 */
export class HelpHandlers {
  constructor(private xmtpService: XMTPService) {}

  /**
   * Main help command
   */
  help: CommandHandler = {
    name: 'help',
    description: 'Show available commands and help information',
    usage: '/help [command]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [0, 1]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.help.usage}`;
        }

        const specificCommand = command.args[0];

        if (specificCommand) {
          return this.getSpecificHelp(specificCommand);
        }

        const helpMessage = `🤖 **SquadWallet Agent - Complete Command Guide**

💰 **Wallet Commands:**
• \`/balance\` - Check your ETH balance
• \`/send <address> <amount>\` - Send ETH to another address
• \`/create-wallet\` - Create a new squad wallet

🎮 **Game Commands:**
• \`/dice <amount>\` - Quick dice game with instant results
• \`/coinflip <amount> <heads|tails>\` - Quick coin flip game
• \`/play <dice|coin> <amount>\` - Start multiplayer game
• \`/join <gameId>\` - Join an existing game
• \`/games\` - List active games
• \`/stats [address]\` - View gaming statistics

🏆 **XP & Badges:**
• \`/xp\` - Check your XP and level
• \`/leaderboard\` - View XP leaderboard
• \`/mintbadge\` - Mint an XP badge NFT
• \`/share-badge <tokenId>\` - Share your badge achievement

🏟️ **Tournament Commands:**
• \`/tournament create <name> <type> <fee> <max> <hours>\` - Create tournament
• \`/tournament join <id>\` - Join a tournament
• \`/tournament list\` - List active tournaments
• \`/tournament leaderboard <id>\` - View tournament rankings

👥 **Social Commands:**
• \`/invite <address>\` - Invite a friend (both get bonus XP)
• \`/challenge <address> <game> <amount>\` - Challenge friend to game

💱 **DeFi Commands:**
• \`/swap <from> <to> <amount>\` - Swap tokens
• \`/price <token>\` - Get token price
• \`/portfolio\` - View your token portfolio

📊 **Info Commands:**
• \`/help [command]\` - Show this help message or specific command help
• \`/about\` - About SquadWallet
• \`/status\` - Agent status

💡 **Quick Start Examples:**
• \`/dice 0.01\` - Play instant dice game
• \`/coinflip 0.005 heads\` - Flip coin for heads
• \`/tournament create "Daily Dice" dice 0.01 10 24\` - Create tournament
• \`/invite 0x123...\` - Invite friend for bonus XP
• \`/challenge 0x123... dice 0.01\` - Challenge friend

🎯 **New Player Guide:**
1. Check balance: \`/balance\`
2. Play quick game: \`/dice 0.01\`
3. Check XP earned: \`/xp\`
4. Join tournament: \`/tournament list\`
5. Invite friends: \`/invite <address>\`

🔥 **Pro Tips:**
• Win games to earn XP and level up
• Higher levels unlock rare NFT badges
• Tournament winners get bigger prizes
• Invite friends for bonus XP rewards

💬 **Get Specific Help:**
• \`/help dice\` - Learn about dice games
• \`/help tournament\` - Tournament system guide
• \`/help xp\` - XP and badge system

Need help with a specific command? Just ask! 🚀`;

        await this.xmtpService.sendResponse(command.conversationId, helpMessage, true);
        return helpMessage;
      } catch (error) {
        logger.error('Failed to show help', { error, command });
        const errorMessage = '❌ Failed to show help. Please try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * About command
   */
  about: CommandHandler = {
    name: 'about',
    description: 'Learn about SquadWallet',
    usage: '/about',
    handler: async (command: Command): Promise<string> => {
      try {
        const aboutMessage = `🚀 **About SquadWallet**

🎯 **What is SquadWallet?**
SquadWallet is an AI-powered group chat wallet that brings gaming, DeFi, and social features directly into your XMTP conversations.

🔥 **Key Features:**
• **Instant Games** - Play dice and coin flip games with immediate results
• **XP System** - Earn experience points and level up by playing games
• **NFT Badges** - Mint dynamic NFT badges that represent your achievements
• **Tournaments** - Compete in organized tournaments with prize pools
• **Social Gaming** - Challenge friends and invite new players
• **DeFi Tools** - Swap tokens and check prices without leaving chat
• **Group Wallets** - Shared wallets for squad activities

🛠️ **Built With:**
• **XMTP** - Decentralized messaging protocol
• **Base** - Fast, low-cost Ethereum L2
• **Coinbase AgentKit** - Wallet and transaction management
• **OnchainKit** - Rich UI components and frames
• **Basenames** - ENS-style naming on Base
• **Chainlink VRF** - Provably fair randomness for games

🎮 **Game Mechanics:**
• Win games to earn XP
• Level up to unlock rare NFT badges
• Compete in tournaments for bigger prizes
• Invite friends for bonus rewards

🏆 **Achievement System:**
• **Level 1-4**: Common badges 🥉
• **Level 5-9**: Uncommon badges 🥈
• **Level 10-24**: Rare badges 🥇
• **Level 25-49**: Epic badges 💎
• **Level 50+**: Legendary badges 👑

💡 **Getting Started:**
1. Check your balance: \`/balance\`
2. Play your first game: \`/dice 0.01\`
3. Check your XP: \`/xp\`
4. Join a tournament: \`/tournament list\`
5. Invite friends: \`/invite <address>\`

🌐 **Learn More:**
• GitHub: github.com/squadwallet
• Docs: docs.squadwallet.xyz
• Discord: discord.gg/squadwallet

Ready to start your SquadWallet journey? 🎯`;

        await this.xmtpService.sendResponse(command.conversationId, aboutMessage, true);
        return aboutMessage;
      } catch (error) {
        logger.error('Failed to show about', { error, command });
        const errorMessage = '❌ Failed to show about information. Please try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Get specific help for a command
   */
  private getSpecificHelp(commandName: string): string {
    const helpTexts: Record<string, string> = {
      'dice': `🎲 **Dice Game Help**

**Quick Dice Game:**
• \`/dice <amount>\` - Play instant dice game
• Example: \`/dice 0.01\`

**How it works:**
• You roll a dice (1-6)
• House rolls a dice (1-6)
• Higher roll wins!
• Win = 1.8x payout + XP
• Lose = Keep trying!

**Multiplayer Dice:**
• \`/play dice <amount>\` - Create multiplayer game
• Up to 6 players can join
• Highest roll wins the pot

**Tips:**
• Start with small amounts (0.001 ETH minimum)
• Higher bets = more XP when you win
• Tournament games count for extra points`,

      'tournament': `🏟️ **Tournament System Help**

**Create Tournament:**
\`/tournament create <name> <type> <fee> <max> <hours>\`
• **name**: Tournament name (in quotes)
• **type**: dice, coinflip, or mixed
• **fee**: Entry fee in ETH
• **max**: Maximum participants (2-100)
• **hours**: Duration in hours (1-168)

**Join Tournament:**
• \`/tournament join <id>\` - Join with entry fee
• \`/tournament list\` - See active tournaments
• \`/tournament leaderboard <id>\` - View rankings

**How Scoring Works:**
• Win games = earn tournament points
• Higher bets = more points
• Final ranking determines prizes

**Prize Distribution:**
• 1st place: 50% of prize pool
• 2nd place: 30% of prize pool
• 3rd place: 20% of prize pool

**Example:**
\`/tournament create "Daily Dice Championship" dice 0.01 20 24\``,

      'xp': `🏆 **XP & Badge System Help**

**Earning XP:**
• Win dice games: Base XP + bet bonus
• Win coin flips: Base XP + bet bonus
• Tournament wins: Extra multiplier
• Invite friends: +100 XP bonus
• Friend's first win: +50 XP bonus

**Level System:**
• Level = Total XP ÷ 100
• Each level unlocks new badge designs
• Higher levels = rarer badge NFTs

**Badge Rarity:**
• **Common** (Level 1-4): 🥉
• **Uncommon** (Level 5-9): 🥈
• **Rare** (Level 10-24): 🥇
• **Epic** (Level 25-49): 💎
• **Legendary** (Level 50+): 👑

**Commands:**
• \`/xp\` - Check your level and XP
• \`/mintbadge\` - Mint NFT badge for current level
• \`/share-badge <id>\` - Share your achievement
• \`/leaderboard\` - See top players

**Pro Tip:** Badges are dynamic NFTs that update with your progress!`,

      'social': `👥 **Social Features Help**

**Invite Friends:**
• \`/invite <address>\` - Send invitation
• Both get +100 XP when they join
• Get +50 XP when they play first game
• Get +25 XP for their first 10 wins

**Challenge Friends:**
• \`/challenge <address> <game> <amount>\` - Send challenge
• Head-to-head competition
• Winner takes the pot
• 24-hour expiration

**Share Achievements:**
• \`/share-badge <tokenId>\` - Share your NFT badge
• Show off your level and rarity
• Inspire others to play

**Benefits:**
• Referral bonuses for both players
• Competitive challenges
• Social proof through achievements
• Build your gaming community

**Example:**
\`/invite 0x123...\` - Invite friend
\`/challenge 0x123... dice 0.01\` - Challenge to dice game`
    };

    return helpTexts[commandName] || `❌ No specific help available for "${commandName}". Use \`/help\` to see all commands.`;
  }

  /**
   * Get all help handlers
   */
  getAllHandlers(): CommandHandler[] {
    return [
      this.help,
      this.about
    ];
  }
}
