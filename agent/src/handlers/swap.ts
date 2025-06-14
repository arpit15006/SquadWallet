import { Command, CommandHandler } from '../types';
import { SwapService } from '../services/swap';
import { XMTPService } from '../services/xmtp';
import { validateCommand } from '../utils/parser';
import logger from '../utils/logger';

/**
 * Swap-related command handlers
 */
export class SwapHandlers {
  constructor(
    private swapService: SwapService,
    private xmtpService: XMTPService
  ) {}

  /**
   * Swap command handler
   */
  swap: CommandHandler = {
    name: 'swap',
    description: 'Swap tokens using Uniswap on Base',
    usage: '/swap <tokenIn> <tokenOut> <amount>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 3);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.swap.usage}`;
        }

        const [tokenIn, tokenOut, amountStr] = command.args;

        // Validate swap parameters
        const swapValidation = this.swapService.validateSwapParams(tokenIn, tokenOut, amountStr);
        if (!swapValidation.valid) {
          return `❌ ${swapValidation.error}`;
        }

        logger.info('Processing swap command', {
          tokenIn,
          tokenOut,
          amount: amountStr,
          sender: command.sender
        });

        // Get quote first
        await this.xmtpService.sendResponse(
          command.conversationId,
          '🔄 Getting swap quote...',
          true
        );

        const quote = await this.swapService.getSwapQuote(tokenIn, tokenOut, amountStr);

        // Show quote to user
        const quoteMessage = `💱 **Swap Quote**

📥 **Selling**: ${amountStr} ${tokenIn.toUpperCase()}
📤 **Receiving**: ~${quote.amountOut} ${tokenOut.toUpperCase()}
💰 **Price Impact**: ${quote.priceImpact.toFixed(2)}%
💸 **Fee**: ${quote.fee}%

⏳ Executing swap...`;

        await this.xmtpService.sendResponse(command.conversationId, quoteMessage, true);

        // Execute the swap
        const result = await this.swapService.executeSwap(tokenIn, tokenOut, amountStr);

        const successMessage = this.swapService.formatSwapSummary(
          tokenIn,
          tokenOut,
          amountStr,
          result.amountOut,
          result.txHash
        );

        await this.xmtpService.sendResponse(command.conversationId, successMessage, true);
        return successMessage;

      } catch (error) {
        logger.error('Failed to process swap', { error, command });
        const errorMessage = '❌ Swap failed. Please check your balance and try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Quote command handler (get swap quote without executing)
   */
  quote: CommandHandler = {
    name: 'quote',
    description: 'Get a swap quote without executing',
    usage: '/quote <tokenIn> <tokenOut> <amount>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 3);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.quote.usage}`;
        }

        const [tokenIn, tokenOut, amountStr] = command.args;

        // Validate parameters
        const swapValidation = this.swapService.validateSwapParams(tokenIn, tokenOut, amountStr);
        if (!swapValidation.valid) {
          return `❌ ${swapValidation.error}`;
        }

        logger.info('Getting swap quote', {
          tokenIn,
          tokenOut,
          amount: amountStr,
          sender: command.sender
        });

        const quote = await this.swapService.getSwapQuote(tokenIn, tokenOut, amountStr);

        const response = `💱 **Swap Quote**

📥 **Input**: ${amountStr} ${tokenIn.toUpperCase()}
📤 **Output**: ~${quote.amountOut} ${tokenOut.toUpperCase()}
💰 **Price Impact**: ${quote.priceImpact.toFixed(2)}%
💸 **Fee**: ${quote.fee}%

💡 **To execute**: \`/swap ${tokenIn} ${tokenOut} ${amountStr}\``;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;

      } catch (error) {
        logger.error('Failed to get quote', { error, command });
        const errorMessage = '❌ Failed to get quote. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Token balance command handler (check token balances)
   */
  tokenBalance: CommandHandler = {
    name: 'token-balance',
    description: 'Check token balance',
    usage: '/token-balance <token>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [0, 1]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.balance.usage}`;
        }

        const token = command.args[0] || 'ETH';

        logger.info('Checking token balance', {
          token,
          user: command.sender
        });

        if (token.toLowerCase() === 'all') {
          // Show all supported token balances
          const supportedTokens = this.swapService.getSupportedTokens();
          let response = '💰 **Your Token Balances**\n\n';

          for (const tokenSymbol of supportedTokens) {
            try {
              const balance = await this.swapService.getTokenBalance(tokenSymbol, command.sender);
              const balanceNum = parseFloat(balance);
              if (balanceNum > 0.0001) { // Only show tokens with meaningful balance
                response += `• **${tokenSymbol}**: ${parseFloat(balance).toFixed(4)}\n`;
              }
            } catch (error) {
              // Skip tokens that fail to load
            }
          }

          response += '\n💡 **Check specific token**: `/token-balance <token>`';
          response += '\n🔄 **Swap tokens**: `/swap <from> <to> <amount>`';

          await this.xmtpService.sendResponse(command.conversationId, response, true);
          return response;
        } else {
          // Show specific token balance
          const balance = await this.swapService.getTokenBalance(token, command.sender);
          const balanceNum = parseFloat(balance);

          const response = `💰 **${token.toUpperCase()} Balance**

💵 **Amount**: ${balanceNum.toFixed(6)} ${token.toUpperCase()}
💲 **USD Value**: ~$${(balanceNum * 2000).toFixed(2)} (estimated)

🔄 **Quick Actions**:
• Swap: \`/swap ${token} USDC ${(balanceNum * 0.1).toFixed(4)}\`
• Get quote: \`/quote ${token} USDC ${(balanceNum * 0.1).toFixed(4)}\``;

          await this.xmtpService.sendResponse(command.conversationId, response, true);
          return response;
        }

      } catch (error) {
        logger.error('Failed to get balance', { error, command });
        const errorMessage = '❌ Failed to get balance. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Tokens command handler (list supported tokens)
   */
  tokens: CommandHandler = {
    name: 'tokens',
    description: 'List supported tokens for swapping',
    usage: '/tokens',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 0);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.tokens.usage}`;
        }

        const supportedTokens = this.swapService.getSupportedTokens();

        const response = `🪙 **Supported Tokens**

${supportedTokens.map(token => `• **${token}** - ${this.getTokenDescription(token)}`).join('\n')}

💡 **Usage Examples**:
• \`/swap ETH USDC 0.1\` - Swap 0.1 ETH for USDC
• \`/quote USDC DAI 100\` - Get quote for 100 USDC to DAI
• \`/token-balance ETH\` - Check ETH balance

🔄 **All swaps use Uniswap V3 on Base for best rates!**`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;

      } catch (error) {
        logger.error('Failed to list tokens', { error, command });
        const errorMessage = '❌ Failed to list tokens. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Get token description
   */
  private getTokenDescription(token: string): string {
    const descriptions: Record<string, string> = {
      'WETH': 'Wrapped Ethereum',
      'USDC': 'USD Coin',
      'DAI': 'Dai Stablecoin',
      'USDT': 'Tether USD'
    };
    
    return descriptions[token] || 'Token';
  }

  /**
   * Get all swap handlers
   */
  getAllHandlers(): CommandHandler[] {
    return [
      this.swap,
      this.quote,
      this.tokenBalance,
      this.tokens
    ];
  }
}
