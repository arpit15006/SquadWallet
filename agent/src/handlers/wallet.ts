import { Command, CommandHandler } from '../types';
import { BlockchainService } from '../services/blockchain';
import { XMTPService } from '../services/xmtp';
import { parseEthAmount, validateCommand, formatEthAmount } from '../utils/parser';
import logger from '../utils/logger';

/**
 * Wallet-related command handlers
 */
export class WalletHandlers {
  constructor(
    private blockchainService: BlockchainService,
    private xmtpService: XMTPService
  ) {}

  /**
   * Create wallet command handler
   */
  createWallet: CommandHandler = {
    name: 'create-wallet',
    description: 'Create a new SquadWallet',
    usage: '/create-wallet <name>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [1, 10]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.createWallet.usage}`;
        }

        const walletName = command.args.join(' ').trim();
        if (!walletName) {
          return '❌ Wallet name cannot be empty';
        }

        if (walletName.length > 50) {
          return '❌ Wallet name must be 50 characters or less';
        }

        logger.info('Creating wallet', {
          name: walletName,
          creator: command.sender
        });

        // Create wallet with both the user and the agent as initial members
        // The agent needs to be included since it's sending the transaction
        const agentAddress = this.blockchainService.getAgentAddress();
        const result = await this.blockchainService.createSquadWallet(
          walletName,
          [command.sender, agentAddress],
          ['Creator', 'Agent']
        );

        const response = `🎉 **SquadWallet Created Successfully!**

📝 **Name**: ${walletName}
📍 **Address**: \`${result.address}\`
🔗 **Transaction**: \`${result.txHash}\`
👥 **Members**: 2 (You + Agent)

Your new SquadWallet is ready! You can now:
• Deposit funds with \`/deposit <amount>\`
• Invite members to join
• Start playing games with \`/play dice <wager>\`

💡 The agent is included as a member to facilitate operations.
Share the wallet address with your squad members!`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to create wallet', { error, command });
        const errorMessage = '❌ Failed to create wallet. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Deposit command handler
   */
  deposit: CommandHandler = {
    name: 'deposit',
    description: 'Deposit ETH to a SquadWallet',
    usage: '/deposit <amount> [wallet-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [1, 2]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.deposit.usage}`;
        }

        const amountStr = command.args[0];
        let walletAddress = command.args[1];

        // Parse amount
        let amount: string;
        try {
          amount = parseEthAmount(amountStr);
        } catch (error) {
          return `❌ Invalid amount format. Use format like "0.1" or "0.1 ETH"`;
        }

        // If no wallet address provided, get user's first wallet
        if (!walletAddress) {
          const userWallets = await this.blockchainService.getUserWallets(command.sender);
          if (userWallets.length === 0) {
            return '❌ You don\'t have any wallets. Create one first with `/create-wallet <name>`';
          }
          walletAddress = userWallets[0];
        }

        logger.info('Processing deposit', {
          amount: formatEthAmount(amount),
          walletAddress,
          sender: command.sender
        });

        const txHash = await this.blockchainService.depositToWallet(walletAddress, amount);

        const response = `💰 **Deposit Successful!**

💵 **Amount**: ${formatEthAmount(amount)}
🏦 **Wallet**: \`${walletAddress}\`
🔗 **Transaction**: \`${txHash}\`

Your deposit has been confirmed! 🎉
• XP earned for this deposit
• Funds are now available for games and proposals`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to process deposit', { error, command });
        const errorMessage = '❌ Failed to process deposit. Please check your wallet balance and try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Balance command handler
   */
  balance: CommandHandler = {
    name: 'balance',
    description: 'Check wallet balance',
    usage: '/balance [wallet-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [0, 1]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.balance.usage}`;
        }

        let walletAddress = command.args[0];

        // If no wallet address provided, get user's wallets
        if (!walletAddress) {
          const userWallets = await this.blockchainService.getUserWallets(command.sender);
          if (userWallets.length === 0) {
            return '❌ You don\'t have any wallets. Create one first with `/create-wallet <name>`';
          }

          // Show balances for all user wallets
          let response = '💰 **Your Wallet Balances**\n\n';
          
          for (const wallet of userWallets) {
            try {
              const walletInfo = await this.blockchainService.getWalletInfo(wallet);
              response += `🏦 **${walletInfo.name}**\n`;
              response += `   📍 \`${wallet}\`\n`;
              response += `   💵 ${walletInfo.balance} ETH\n`;
              response += `   👥 ${walletInfo.totalMembers} members\n\n`;
            } catch (error) {
              response += `🏦 **Wallet** \`${wallet}\`\n`;
              response += `   ❌ Error loading info\n\n`;
            }
          }

          await this.xmtpService.sendResponse(command.conversationId, response, true);
          return response;
        } else {
          // Show balance for specific wallet
          const walletInfo = await this.blockchainService.getWalletInfo(walletAddress);
          
          const response = `💰 **Wallet Balance**

🏦 **${walletInfo.name}**
📍 **Address**: \`${walletAddress}\`
💵 **Balance**: ${walletInfo.balance} ETH
👥 **Members**: ${walletInfo.totalMembers}
📅 **Created**: ${new Date(walletInfo.createdAt * 1000).toLocaleDateString()}`;

          await this.xmtpService.sendResponse(command.conversationId, response, true);
          return response;
        }
      } catch (error) {
        logger.error('Failed to get balance', { error, command });
        const errorMessage = '❌ Failed to get wallet balance. Please check the wallet address.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Wallets command handler
   */
  wallets: CommandHandler = {
    name: 'wallets',
    description: 'List your SquadWallets',
    usage: '/wallets',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 0);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.wallets.usage}`;
        }

        const userWallets = await this.blockchainService.getUserWallets(command.sender);
        
        if (userWallets.length === 0) {
          const response = `📭 **No Wallets Found**

You don't have any SquadWallets yet.

🚀 **Get Started:**
• Create your first wallet with \`/create-wallet <name>\`
• Join existing wallets by getting invited by other members

💡 **Tip**: SquadWallets are perfect for group expenses, gaming, and collaborative DeFi!`;

          await this.xmtpService.sendResponse(command.conversationId, response, true);
          return response;
        }

        let response = `🏦 **Your SquadWallets** (${userWallets.length})\n\n`;

        for (let i = 0; i < userWallets.length; i++) {
          try {
            const walletInfo = await this.blockchainService.getWalletInfo(userWallets[i]);
            response += `${i + 1}. **${walletInfo.name}**\n`;
            response += `   📍 \`${userWallets[i]}\`\n`;
            response += `   💵 ${walletInfo.balance} ETH\n`;
            response += `   👥 ${walletInfo.totalMembers} members\n`;
            response += `   📅 Created ${new Date(walletInfo.createdAt * 1000).toLocaleDateString()}\n\n`;
          } catch (error) {
            response += `${i + 1}. **Wallet** \`${userWallets[i]}\`\n`;
            response += `   ❌ Error loading details\n\n`;
          }
        }

        response += `💡 **Quick Actions:**
• Check balance: \`/balance\`
• Deposit funds: \`/deposit <amount>\`
• Start a game: \`/play dice <wager>\``;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to list wallets', { error, command });
        const errorMessage = '❌ Failed to list wallets. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Split command handler (show contribution breakdown)
   */
  split: CommandHandler = {
    name: 'split',
    description: 'Show wallet contribution breakdown',
    usage: '/split [wallet-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [0, 1]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.split.usage}`;
        }

        let walletAddress = command.args[0];

        // If no wallet address provided, use user's first wallet
        if (!walletAddress) {
          const userWallets = await this.blockchainService.getUserWallets(command.sender);
          if (userWallets.length === 0) {
            return '❌ You don\'t have any wallets. Create one first with `/create-wallet <name>`';
          }
          walletAddress = userWallets[0];
        }

        const walletInfo = await this.blockchainService.getWalletInfo(walletAddress);
        
        // This is a simplified implementation
        // In a real implementation, you'd track individual member contributions
        const response = `📊 **Wallet Split Analysis**

🏦 **${walletInfo.name}**
📍 \`${walletAddress}\`
💰 **Total Balance**: ${walletInfo.balance} ETH
👥 **Members**: ${walletInfo.totalMembers}

📈 **Contribution Breakdown**:
${walletInfo.members.map((member, index) => 
  `${index + 1}. \`${member}\`: Equal share (${(parseFloat(walletInfo.balance) / walletInfo.totalMembers).toFixed(4)} ETH)`
).join('\n')}

💡 **Note**: This shows equal distribution. Individual contribution tracking is coming soon!`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to show split', { error, command });
        const errorMessage = '❌ Failed to show wallet split. Please check the wallet address.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Withdraw command handler (creates proposal)
   */
  withdraw: CommandHandler = {
    name: 'withdraw',
    description: 'Create withdrawal proposal for squad wallet',
    usage: '/withdraw <amount> <to-address> [wallet-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [2, 3]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.withdraw.usage}`;
        }

        const amountStr = command.args[0];
        const toAddress = command.args[1];
        let walletAddress = command.args[2];

        // Parse amount
        let amount: string;
        try {
          amount = parseEthAmount(amountStr);
        } catch (error) {
          return `❌ Invalid amount format. Use format like "0.1" or "0.1 ETH"`;
        }

        // Validate to address
        if (!toAddress.startsWith('0x') || toAddress.length !== 42) {
          return '❌ Invalid recipient address format';
        }

        // If no wallet address provided, get user's first wallet
        if (!walletAddress) {
          const userWallets = await this.blockchainService.getUserWallets(command.sender);
          if (userWallets.length === 0) {
            return '❌ You don\'t have any wallets. Create one first with `/create-wallet <name>`';
          }
          walletAddress = userWallets[0];
        }

        logger.info('Creating withdrawal proposal', {
          amount: formatEthAmount(amount),
          toAddress,
          walletAddress,
          proposer: command.sender
        });

        const proposalId = await this.blockchainService.createWithdrawalProposal(
          walletAddress,
          amount,
          toAddress,
          `Withdraw ${formatEthAmount(amount)} to ${toAddress}`
        );

        const response = `📝 **Withdrawal Proposal Created!**

💰 **Amount**: ${formatEthAmount(amount)}
📍 **To**: \`${toAddress}\`
🏦 **From Wallet**: \`${walletAddress}\`
🆔 **Proposal ID**: ${proposalId}

⏳ **Next Steps:**
• Squad members can vote with \`/vote ${proposalId} yes\` or \`/vote ${proposalId} no\`
• Proposal needs majority approval to execute
• Voting period: 3 days

💡 Share this proposal ID with your squad members!`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to create withdrawal proposal', { error, command });
        const errorMessage = '❌ Failed to create withdrawal proposal. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Propose command handler
   */
  propose: CommandHandler = {
    name: 'propose',
    description: 'Create a new proposal for squad voting',
    usage: '/propose <description> [target] [value] [data] [wallet-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [1, 5]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.propose.usage}`;
        }

        const description = command.args[0];
        const target = command.args[1] || '0x0000000000000000000000000000000000000000';
        const value = command.args[2] || '0';
        const data = command.args[3] || '0x';
        let walletAddress = command.args[4];

        if (description.length < 10) {
          return '❌ Proposal description must be at least 10 characters long';
        }

        // If no wallet address provided, get user's first wallet
        if (!walletAddress) {
          const userWallets = await this.blockchainService.getUserWallets(command.sender);
          if (userWallets.length === 0) {
            return '❌ You don\'t have any wallets. Create one first with `/create-wallet <name>`';
          }
          walletAddress = userWallets[0];
        }

        logger.info('Creating proposal', {
          description,
          target,
          value,
          walletAddress,
          proposer: command.sender
        });

        const proposalId = await this.blockchainService.createProposal(
          walletAddress,
          description,
          target,
          value,
          data
        );

        const response = `📝 **Proposal Created Successfully!**

📋 **Description**: ${description}
🆔 **Proposal ID**: ${proposalId}
🏦 **Wallet**: \`${walletAddress}\`
🎯 **Target**: \`${target}\`
💰 **Value**: ${value} ETH

⏳ **Voting Period**: 3 days
🗳️ **How to Vote**:
• Yes: \`/vote ${proposalId} yes\`
• No: \`/vote ${proposalId} no\`

💡 Share this with your squad members to start voting!`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to create proposal', { error, command });
        const errorMessage = '❌ Failed to create proposal. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Vote command handler
   */
  vote: CommandHandler = {
    name: 'vote',
    description: 'Vote on a squad proposal',
    usage: '/vote <proposal-id> <yes|no> [wallet-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [2, 3]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.vote.usage}`;
        }

        const proposalIdStr = command.args[0];
        const voteStr = command.args[1].toLowerCase();
        let walletAddress = command.args[2];

        // Validate proposal ID
        const proposalId = parseInt(proposalIdStr);
        if (isNaN(proposalId) || proposalId < 0) {
          return '❌ Invalid proposal ID. Must be a positive number.';
        }

        // Validate vote
        if (voteStr !== 'yes' && voteStr !== 'no') {
          return '❌ Vote must be "yes" or "no"';
        }
        const support = voteStr === 'yes';

        // If no wallet address provided, get user's first wallet
        if (!walletAddress) {
          const userWallets = await this.blockchainService.getUserWallets(command.sender);
          if (userWallets.length === 0) {
            return '❌ You don\'t have any wallets. Create one first with `/create-wallet <name>`';
          }
          walletAddress = userWallets[0];
        }

        logger.info('Processing vote', {
          proposalId,
          support,
          walletAddress,
          voter: command.sender
        });

        const txHash = await this.blockchainService.voteOnProposal(
          walletAddress,
          proposalId,
          support
        );

        const response = `🗳️ **Vote Recorded Successfully!**

🆔 **Proposal ID**: ${proposalId}
✅ **Your Vote**: ${support ? 'YES' : 'NO'}
🏦 **Wallet**: \`${walletAddress}\`
🔗 **Transaction**: \`${txHash}\`

🎉 Your vote has been counted!
💡 Check proposal status with \`/proposals\``;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to process vote', { error, command });
        const errorMessage = '❌ Failed to process vote. You may have already voted or the proposal may not exist.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Execute command handler
   */
  execute: CommandHandler = {
    name: 'execute',
    description: 'Execute an approved proposal',
    usage: '/execute <proposal-id> [wallet-address]',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, [1, 2]);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.execute.usage}`;
        }

        const proposalIdStr = command.args[0];
        let walletAddress = command.args[1];

        // Validate proposal ID
        const proposalId = parseInt(proposalIdStr);
        if (isNaN(proposalId) || proposalId < 0) {
          return '❌ Invalid proposal ID. Must be a positive number.';
        }

        // If no wallet address provided, get user's first wallet
        if (!walletAddress) {
          const userWallets = await this.blockchainService.getUserWallets(command.sender);
          if (userWallets.length === 0) {
            return '❌ You don\'t have any wallets. Create one first with `/create-wallet <name>`';
          }
          walletAddress = userWallets[0];
        }

        logger.info('Executing proposal', {
          proposalId,
          walletAddress,
          executor: command.sender
        });

        const txHash = await this.blockchainService.executeProposal(walletAddress, proposalId);

        const response = `⚡ **Proposal Executed Successfully!**

🆔 **Proposal ID**: ${proposalId}
🏦 **Wallet**: \`${walletAddress}\`
🔗 **Transaction**: \`${txHash}\`

✅ The proposal has been executed and the action has been completed!
💡 Check wallet balance with \`/balance\` to see any changes.`;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to execute proposal', { error, command });
        const errorMessage = '❌ Failed to execute proposal. It may not have enough votes or the voting period may not be over.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Get all wallet handlers
   */
  getAllHandlers(): CommandHandler[] {
    return [
      this.createWallet,
      this.deposit,
      this.balance,
      this.wallets,
      this.split,
      this.withdraw,
      this.propose,
      this.vote,
      this.execute
    ];
  }
}
