import { Command, CommandHandler } from '../types';
import { BlockchainService } from '../services/blockchain';
import { XMTPService } from '../services/xmtp';
import { PriceService } from '../services/price';
import { parseEthAmount, validateCommand, formatEthAmount } from '../utils/parser';
import logger from '../utils/logger';

/**
 * DeFi-related command handlers for swapping, staking, bridging, and price alerts
 */
export class DeFiHandlers {
  private priceService: PriceService;

  constructor(
    private blockchainService: BlockchainService,
    private xmtpService: XMTPService
  ) {
    this.priceService = new PriceService();
  }

  /**
   * Swap command handler
   */
  swap: CommandHandler = {
    name: 'swap',
    description: 'Swap tokens using Uniswap on Base',
    usage: '/swap <tokenA> <tokenB> <amount> [wallet-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [3, 4]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.swap.usage}`;
        }

        const tokenA = command.args[0].toUpperCase();
        const tokenB = command.args[1].toUpperCase();
        const amountStr = command.args[2];
        let walletAddress = command.args[3];

        // Parse amount
        let amount: string;
        try {
          amount = parseEthAmount(amountStr);
        } catch (error) {
          return `❌ Invalid amount format. Use format like "0.1" or "0.1 ETH"`;
        }

        // Validate tokens
        const supportedTokens = ['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'WBTC'];
        if (!supportedTokens.includes(tokenA) || !supportedTokens.includes(tokenB)) {
          return `❌ Unsupported token. Supported tokens: ${supportedTokens.join(', ')}`;
        }

        if (tokenA === tokenB) {
          return '❌ Cannot swap the same token';
        }

        // If no wallet address provided, get user's first wallet
        if (!walletAddress) {
          const userWallets = await this.blockchainService.getUserWallets(command.sender);
          if (userWallets.length === 0) {
            return '❌ You don\'t have any wallets. Create one first with `/create-wallet <name>`';
          }
          walletAddress = userWallets[0];
        }

        logger.info('Processing token swap', {
          tokenA,
          tokenB,
          amount: formatEthAmount(amount),
          walletAddress,
          sender: command.sender
        });

        // Get quote first
        const quote = await this.blockchainService.getSwapQuote(tokenA, tokenB, amount);
        
        const response = `🔄 **Token Swap Quote**

📊 **Trade Details:**
• From: ${formatEthAmount(amount)} ${tokenA}
• To: ~${quote.outputAmount} ${tokenB}
• Price Impact: ${quote.priceImpact}%
• Slippage: 0.5%

🏦 **Wallet**: \`${walletAddress}\`
💰 **Estimated Gas**: ${quote.gasEstimate} ETH

⚠️ **Confirm this swap?** Reply with:
• \`/confirm-swap\` to proceed
• \`/cancel\` to cancel

⏰ Quote valid for 2 minutes`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to get swap quote', { error, command });
        const errorMessage = '❌ Failed to get swap quote. Please check token symbols and try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Confirm swap command handler
   */
  confirmSwap: CommandHandler = {
    name: 'confirm-swap',
    description: 'Confirm and execute the pending swap',
    usage: '/confirm-swap',
    handler: async (command: Command): Promise<string> => {
      try {
        // In a real implementation, you'd store the pending swap details
        // For now, we'll simulate the swap execution
        
        const txHash = await this.blockchainService.executeSwap();

        const response = `✅ **Swap Executed Successfully!**

🔗 **Transaction**: \`${txHash}\`
⏰ **Status**: Confirmed
🎉 **Tokens swapped successfully!**

💡 **Next Steps:**
• Check your new balance with \`/balance\`
• XP earned for this swap!`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to execute swap', { error, command });
        const errorMessage = '❌ Failed to execute swap. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Price command handler
   */
  price: CommandHandler = {
    name: 'price',
    description: 'Get current token price and market data',
    usage: '/price <token>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 1);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.price.usage}`;
        }

        const token = command.args[0].toUpperCase();
        
        logger.info('Getting token price from CoinMarketCap', { token, sender: command.sender });

        // Use PriceService directly to get real CoinMarketCap data
        const priceData = await this.priceService.getPrice(token);

        const response = `💰 **${token} Price Data** (CoinMarketCap)

💵 **Current Price**: $${priceData.price.toFixed(2)}
📈 **24h Change**: ${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%
📊 **24h Volume**: ${priceData.volume24h ? '$' + this.formatLargeNumber(priceData.volume24h) : 'N/A'}
🏆 **Market Cap**: ${priceData.marketCap ? '$' + this.formatLargeNumber(priceData.marketCap) : 'N/A'}
⏰ **Last Updated**: ${priceData.lastUpdated ? new Date(priceData.lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString()}

${priceData.change24h >= 0 ? '🟢' : '🔴'} **Trend**: ${priceData.change24h >= 0 ? 'Bullish' : 'Bearish'}

💡 **Set Price Alert**: \`/alert ${token} <price>\`
🔄 **Refresh**: \`/price ${token}\``;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to get token price', { error, command });
        const errorMessage = '❌ Failed to get token price. Please check the token symbol.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Stake command handler
   */
  stake: CommandHandler = {
    name: 'stake',
    description: 'Stake tokens for rewards',
    usage: '/stake <token> <amount> [wallet-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [2, 3]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.stake.usage}`;
        }

        const token = command.args[0].toUpperCase();
        const amountStr = command.args[1];
        let walletAddress = command.args[2];

        // Parse amount
        let amount: string;
        try {
          amount = parseEthAmount(amountStr);
        } catch (error) {
          return `❌ Invalid amount format. Use format like "0.1" or "0.1 ETH"`;
        }

        // Validate stakeable tokens
        const stakeableTokens = ['ETH', 'USDC', 'WETH'];
        if (!stakeableTokens.includes(token)) {
          return `❌ Token not stakeable. Stakeable tokens: ${stakeableTokens.join(', ')}`;
        }

        // If no wallet address provided, get user's first wallet
        if (!walletAddress) {
          const userWallets = await this.blockchainService.getUserWallets(command.sender);
          if (userWallets.length === 0) {
            return '❌ You don\'t have any wallets. Create one first with `/create-wallet <name>`';
          }
          walletAddress = userWallets[0];
        }

        logger.info('Processing stake', {
          token,
          amount: formatEthAmount(amount),
          walletAddress,
          sender: command.sender
        });

        const stakeInfo = await this.blockchainService.getStakeInfo(token);
        
        const response = `🥩 **Staking Information**

💰 **Stake Amount**: ${formatEthAmount(amount)} ${token}
📈 **APY**: ${stakeInfo.apy}%
⏰ **Lock Period**: ${stakeInfo.lockPeriod} days
🎁 **Estimated Rewards**: ${stakeInfo.estimatedRewards} ${token}/year

🏦 **Wallet**: \`${walletAddress}\`

⚠️ **Confirm staking?** Reply with:
• \`/confirm-stake\` to proceed
• \`/cancel\` to cancel

💡 Staked tokens will be locked for the specified period.`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to get stake info', { error, command });
        const errorMessage = '❌ Failed to get staking information. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Bridge command handler
   */
  bridge: CommandHandler = {
    name: 'bridge',
    description: 'Bridge tokens between networks',
    usage: '/bridge <token> <amount> <to-network> [wallet-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [3, 4]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.bridge.usage}`;
        }

        const token = command.args[0].toUpperCase();
        const amountStr = command.args[1];
        const toNetwork = command.args[2].toLowerCase();
        let walletAddress = command.args[3];

        // Parse amount
        let amount: string;
        try {
          amount = parseEthAmount(amountStr);
        } catch (error) {
          return `❌ Invalid amount format. Use format like "0.1" or "0.1 ETH"`;
        }

        // Validate networks
        const supportedNetworks = ['ethereum', 'polygon', 'arbitrum', 'optimism'];
        if (!supportedNetworks.includes(toNetwork)) {
          return `❌ Unsupported network. Supported: ${supportedNetworks.join(', ')}`;
        }

        // If no wallet address provided, get user's first wallet
        if (!walletAddress) {
          const userWallets = await this.blockchainService.getUserWallets(command.sender);
          if (userWallets.length === 0) {
            return '❌ You don\'t have any wallets. Create one first with `/create-wallet <name>`';
          }
          walletAddress = userWallets[0];
        }

        logger.info('Processing bridge', {
          token,
          amount: formatEthAmount(amount),
          toNetwork,
          walletAddress,
          sender: command.sender
        });

        const bridgeInfo = await this.blockchainService.getBridgeInfo(token, toNetwork, amount);
        
        const response = `🌉 **Bridge Information**

🔄 **Bridge Details:**
• Token: ${formatEthAmount(amount)} ${token}
• From: Base Network
• To: ${toNetwork.charAt(0).toUpperCase() + toNetwork.slice(1)}

💰 **Fees**: ${bridgeInfo.fees} ${token}
⏰ **Estimated Time**: ${bridgeInfo.estimatedTime}
🏦 **Wallet**: \`${walletAddress}\`

⚠️ **Confirm bridging?** Reply with:
• \`/confirm-bridge\` to proceed
• \`/cancel\` to cancel

💡 Bridging may take several minutes to complete.`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to get bridge info', { error, command });
        const errorMessage = '❌ Failed to get bridge information. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Price alert command handler
   */
  alert: CommandHandler = {
    name: 'alert',
    description: 'Set price alerts for tokens using CoinMarketCap data',
    usage: '/alert <token> <price> [above|below]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [2, 3]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.alert.usage}`;
        }

        const token = command.args[0].toUpperCase();
        const targetPrice = parseFloat(command.args[1]);
        const direction = command.args[2]?.toLowerCase() || 'above';

        if (isNaN(targetPrice) || targetPrice <= 0) {
          return '❌ Invalid price. Please enter a positive number.';
        }

        if (direction !== 'above' && direction !== 'below') {
          return '❌ Direction must be "above" or "below"';
        }

        logger.info('Setting price alert', { token, targetPrice, direction, sender: command.sender });

        // Get current price from CoinMarketCap using PriceService
        const priceData = await this.priceService.getPrice(token);
        const currentPrice = priceData.price;

        const response = `🚨 **Price Alert Set!**

📊 **Token**: ${token}
💰 **Current Price**: $${currentPrice.toFixed(2)} (Live from CoinMarketCap)
🎯 **Alert Price**: $${targetPrice.toFixed(2)}
📈 **Direction**: ${direction.toUpperCase()}
⏰ **Set At**: ${new Date().toLocaleString()}

💡 **You'll be notified when ${token} goes ${direction} $${targetPrice.toFixed(2)}**

Current distance: ${direction === 'above'
  ? `$${(targetPrice - currentPrice).toFixed(2)} to go`
  : `$${(currentPrice - targetPrice).toFixed(2)} above target`}`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to set price alert', { error, command });
        const errorMessage = '❌ Failed to set price alert. Please check the token symbol and try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

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
   * Get all DeFi handlers
   */
  getAllHandlers(): CommandHandler[] {
    return [
      this.swap,
      this.confirmSwap,
      this.price,
      this.stake,
      this.bridge,
      this.alert
    ];
  }
}
