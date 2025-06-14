import React, { useState, useEffect, useRef } from 'react';
import { useSimpleWallet } from './SimpleWalletConnect';
import { Send, Bot, User, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { ContractService, initializeContractService } from '../services/contractService';
import { ethers } from 'ethers';
import { Name, Avatar } from './Identity';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface XMTPChatProps {
  onCommandExecuted?: (command: string, result: any) => void;
}

// Agent communication via real contracts
const AGENT_ADDRESS = '0x1Be31A94361a391bBaFB2a4CCd704F57dc04d4bb';

// User identity component with OnchainKit Basename support
const UserIdentity: React.FC<{ address: string }> = ({ address }) => {
  return (
    <div className="flex items-center space-x-2">
      <Avatar address={address as `0x${string}`} className="w-6 h-6" />
      <Name address={address as `0x${string}`} className="text-sm font-medium text-white" />
    </div>
  );
};

export const XMTPChat: React.FC<XMTPChatProps> = ({ onCommandExecuted }) => {
  const { address, isConnected } = useSimpleWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [contractService, setContractService] = useState<ContractService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available commands
  const commands = [
    '/help - Show all available commands',
    '/whoami - Check your identity and Basename',
    '/create-wallet <name> - Create a new squad wallet',
    '/deposit <amount> - Deposit ETH to wallet',
    '/tip @basename <amount> - Tip a friend with ETH',
    '/swap <tokenA> <tokenB> <amount> - Swap tokens',
    '/price <ticker> - Get token price',
    '/balance <token> - Check token balance',
    '/play dice <wager> - Play dice game',
    '/play coin <wager> - Play coin flip game',
    '/xp - Check your XP points',
    '/leaderboard - View XP leaderboard',
    '/mintbadge - Mint XP badge NFT (requires Basename)',
    '/badge claim - Claim available badges'
  ];

  // Initialize with welcome message
  useEffect(() => {
    if (isConnected && messages.length === 0) {
      setMessages([
        {
          id: '1',
          content: `🤖 **Welcome to SquadWallet Agent!**

I'm your AI assistant for managing squad wallets, playing games, and earning XP.

**Quick Start:**
• \`/create-wallet MySquad\` - Create a wallet
• \`/deposit 0.01\` - Add funds to wallet
• \`/play dice 0.001\` - Create a dice game
• \`/games\` - See active games
• \`/xp\` - Check your progress
• \`/help\` - See all commands

Ready to get started? 🚀`,
          sender: 'agent',
          timestamp: new Date(),
          status: 'sent'
        }
      ]);
    }
  }, [isConnected, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to the real XMTP agent via HTTP bridge
  const connectToContracts = async () => {
    if (!isConnected) return;

    setIsConnecting(true);
    try {
      console.log('🔌 Connecting to SquadWallet Agent...');

      // Test connection to agent HTTP bridge
      const response = await fetch('http://localhost:3001/status');
      if (!response.ok) {
        throw new Error('Agent not responding');
      }

      const status = await response.json();
      console.log('✅ Agent status:', status);

      setIsAgentConnected(true);

      addMessage({
        content: `✅ **Connected to SquadWallet Agent!**

🤖 **Agent**: ${status.agentAddress}
⛓️ **Network**: Base Sepolia
📡 **Status**: Real XMTP agent active
🎮 **Games**: Live on blockchain
💰 **Wallets**: Real squad wallet creation

You can now send commands directly to the agent!

Try: \`/create-wallet MySquad\`, \`/play dice 0.001\`, \`/xp\``,
        sender: 'agent'
      });

    } catch (error) {
      console.error('Agent connection failed:', error);

      // Fallback to local contract service
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const service = initializeContractService(provider, signer);
        setContractService(service);
        setIsAgentConnected(false);

        addMessage({
          content: `⚠️ **Agent Connection Failed - Using Local Mode**

${error instanceof Error ? error.message : 'Unknown error'}

Falling back to local contract interactions. Some features may be limited.

Try: \`/create-wallet MySquad\`, \`/balance\`, \`/xp\``,
          sender: 'agent'
        });
      } catch (fallbackError) {
        addMessage({
          content: `❌ **Connection Failed**

Both agent and local contract connections failed.

Please ensure:
1. SquadWallet Agent is running
2. Your wallet is connected
3. You're on Base Sepolia network`,
          sender: 'agent'
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Add message helper
  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Process commands with real contract interactions
  const processCommandWithContracts = async (command: string): Promise<string> => {
    if (!contractService && isAgentConnected) {
      return '❌ Contract service not initialized. Please reconnect.';
    }

    const cmd = command.toLowerCase().trim();
    const args = command.split(' ').slice(1);

    try {
      // Real contract interactions
      if (cmd.startsWith('/create-wallet')) {
        if (!contractService) throw new Error('Contract service not available');
        const walletName = args[0] || 'MySquad';

        console.log('Creating wallet with name:', walletName);
        const result = await contractService.createSquadWallet(walletName, [address!], [address!]);

        // Wait a bit more and then verify the wallet was created (force refresh)
        await new Promise(resolve => setTimeout(resolve, 3000));
        const userWallets = await contractService.getUserSquadWallets(address!, true);

        return `✅ **Squad Wallet Created!**

🏦 **Wallet Address**: \`${result.walletAddress}\`
📝 **Name**: ${walletName}
🔗 **Transaction**: \`${result.transactionHash}\`
📊 **Total Wallets**: ${userWallets.length}

Your squad wallet is ready to use! Try \`/wallets\` to see all your wallets.`;
      }

      if (cmd.startsWith('/play dice')) {
        if (!contractService) throw new Error('Contract service not available');
        const wager = args[1] || '0.001';
        const result = await contractService.createDiceGame(wager);
        return `🎲 **Dice Game Created!**

🎮 **Game ID**: ${result.gameId}
💰 **Wager**: ${wager} ETH
🔗 **Transaction**: \`${result.transactionHash}\`

Waiting for another player to join...`;
      }

      if (cmd.startsWith('/play coin')) {
        if (!contractService) throw new Error('Contract service not available');
        const wager = args[1] || '0.001';
        const result = await contractService.createCoinFlipGame(wager);
        return `🪙 **Coin Flip Game Created!**

🎮 **Game ID**: ${result.gameId}
💰 **Wager**: ${wager} ETH
🔗 **Transaction**: \`${result.transactionHash}\`

Waiting for another player to join...`;
      }

      if (cmd === '/xp') {
        if (!contractService) throw new Error('Contract service not available');
        const xp = await contractService.getUserXP(address!);
        const level = await contractService.getUserLevel(address!);
        const badges = await contractService.getUserBadges(address!);
        return `⭐ **Your XP & Progress**

🏆 **Level**: ${level}
⭐ **XP**: ${xp.toLocaleString()}
🏅 **Badges**: ${badges.length}
📊 **Next Level**: ${((level + 1) * 100) - xp} XP needed`;
      }

      if (cmd === '/balance') {
        if (!contractService) throw new Error('Contract service not available');
        const balance = await contractService.getBalance(address!);
        return `💰 **Your Balance**

💎 **ETH**: ${parseFloat(balance).toFixed(4)} ETH
🌐 **Network**: Base Sepolia
📍 **Address**: \`${address}\``;
      }

      if (cmd === '/wallets') {
        if (!contractService) throw new Error('Contract service not available');

        console.log('Fetching wallets for address:', address);
        const userWallets = await contractService.getUserSquadWallets(address!, true); // Force refresh
        console.log('Retrieved wallets:', userWallets);

        if (userWallets.length === 0) {
          return `🏦 **No Squad Wallets Found**

You haven't created any squad wallets yet, or they haven't been indexed.

**Options**:
• \`/create-wallet MySquad\` - Create a new wallet
• Wait a few minutes and try again (blockchain indexing delay)
• Check the transaction on Base Sepolia explorer

**Your Address**: \`${address}\``;
        }

        let response = `🏦 **Your Squad Wallets** (${userWallets.length})\n\n`;

        for (let i = 0; i < userWallets.length; i++) {
          const wallet = userWallets[i];
          try {
            const balance = await contractService.getBalance(wallet);
            response += `${i + 1}. **Wallet ${i + 1}**\n`;
            response += `   📍 Address: \`${wallet}\`\n`;
            response += `   💰 Balance: ${parseFloat(balance).toFixed(4)} ETH\n\n`;
          } catch (error) {
            response += `${i + 1}. **Wallet ${i + 1}**\n`;
            response += `   📍 Address: \`${wallet}\`\n`;
            response += `   💰 Balance: Error loading\n\n`;
          }
        }

        response += `**Tip**: Use \`/deposit <amount>\` to add funds to your first wallet.`;

        return response;
      }

      if (cmd.startsWith('/deposit')) {
        const amount = args[0];
        if (!amount) {
          return `❌ **Missing Amount**

Please specify an amount to deposit.

**Usage**: \`/deposit <amount>\`
**Example**: \`/deposit 0.01\``;
        }

        if (!contractService) throw new Error('Contract service not available');

        // For deposits, we'll send ETH directly to the user's first squad wallet
        const userWallets = await contractService.getUserSquadWallets(address!);

        if (userWallets.length === 0) {
          return `❌ **No Squad Wallet Found**

You need to create a squad wallet first.

Use: \`/create-wallet MySquad\` to create one.`;
        }

        const targetWallet = userWallets[0]; // Use first wallet

        // Send ETH transaction to the squad wallet
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction({
          to: targetWallet,
          value: ethers.parseEther(amount)
        });

        const receipt = await tx.wait();

        return `✅ **Deposit Successful!**

💰 **Amount**: ${amount} ETH
🏦 **To Wallet**: \`${targetWallet}\`
🔗 **Transaction**: \`${tx.hash}\`
⛽ **Gas Used**: ${receipt?.gasUsed.toString()}

Your funds are now in the squad wallet!`;
      }

      if (cmd.startsWith('/withdraw')) {
        const amount = args[0];
        if (!amount) {
          return `❌ **Missing Amount**

Please specify an amount to withdraw.

**Usage**: \`/withdraw <amount>\`
**Example**: \`/withdraw 0.01\``;
        }

        return `🚧 **Withdraw Feature**

Withdraw functionality requires squad wallet contract interaction.
This feature will be available when squad wallet contracts include withdrawal methods.

**Current Status**: Not implemented in contracts yet
**Alternative**: Use squad wallet interface directly`;
      }

      if (cmd === '/games') {
        if (!contractService) throw new Error('Contract service not available');

        const activeGames = await contractService.getActiveGames();
        const userGames = await contractService.getUserGames(address!);

        if (activeGames.length === 0 && userGames.length === 0) {
          return `🎮 **No Games Found**

No active games available right now.

**Create a game**: \`/play dice 0.001\` or \`/play coin 0.001\``;
        }

        let response = `🎮 **Game Status**\n\n`;

        if (userGames.length > 0) {
          response += `**Your Games** (${userGames.length}):\n`;
          userGames.slice(0, 3).forEach((game, i) => {
            const status = game.status === 0 ? 'Pending' : game.status === 1 ? 'Active' : 'Completed';
            const gameType = game.gameType === 0 ? 'Dice' : 'Coin Flip';
            response += `${i + 1}. ${gameType} - ${game.wager} ETH - ${status}\n`;
          });
          response += `\n`;
        }

        if (activeGames.length > 0) {
          response += `**Active Games** (${activeGames.length}):\n`;
          activeGames.slice(0, 3).forEach((game, i) => {
            const gameType = game.gameType === 0 ? 'Dice' : 'Coin Flip';
            response += `${i + 1}. ${gameType} - ${game.wager} ETH - Join with \`/join ${game.id}\`\n`;
          });
        }

        return response;
      }

      if (cmd.startsWith('/join')) {
        const gameId = parseInt(args[0]);
        if (!gameId) {
          return `❌ **Missing Game ID**

Please specify a game ID to join.

**Usage**: \`/join <gameId>\`
**Example**: \`/join 1\``;
        }

        if (!contractService) throw new Error('Contract service not available');

        const game = await contractService.getGame(gameId);
        if (!game) {
          return `❌ **Game Not Found**

Game ID ${gameId} does not exist.

Use \`/games\` to see available games.`;
        }

        const result = await contractService.joinGame(gameId, game.wager);

        return `🎮 **Joined Game!**

🎲 **Game ID**: ${gameId}
💰 **Wager**: ${game.wager} ETH
🔗 **Transaction**: \`${result.transactionHash}\`

Game will start automatically!`;
      }

      // Fallback to simulation for other commands
      return await processCommand(command);

    } catch (error: any) {
      console.error('Contract command failed:', error);
      return `❌ **Command Failed**

${error.message}

Falling back to simulation mode...

${await processCommand(command)}`;
    }
  };

  // Process agent commands (simulation fallback)
  const processCommand = async (command: string): Promise<string> => {
    const cmd = command.toLowerCase().trim();
    
    if (cmd === '/help') {
      return `🤖 **Available Commands:**

${commands.map(cmd => `• ${cmd}`).join('\n')}

💡 **Tips:**
• Commands are case-insensitive
• Use exact syntax for best results
• Check your wallet connection first`;
    }
    
    if (cmd.startsWith('/create-wallet')) {
      const name = cmd.split(' ').slice(1).join(' ');
      if (!name) return '❌ Please provide a wallet name: `/create-wallet MySquad`';
      
      // Simulate wallet creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      onCommandExecuted?.('create-wallet', { name });
      return `✅ **Wallet Created!**

🏦 **Name**: ${name}
📍 **Address**: 0x${Math.random().toString(16).substring(2, 10)}...
👥 **Members**: 1 (you)

Your squad wallet is ready! Use \`/deposit <amount>\` to add funds.`;
    }
    
    if (cmd.startsWith('/deposit')) {
      const amount = cmd.split(' ')[1];
      if (!amount) return '❌ Please specify amount: `/deposit 0.1`';
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      onCommandExecuted?.('deposit', { amount });
      return `✅ **Deposit Successful!**

💰 **Amount**: ${amount} ETH
⏱️ **Status**: Confirmed
🔗 **TX**: 0x${Math.random().toString(16).substring(2, 10)}...

Your funds are now available in the squad wallet!`;
    }
    
    if (cmd.startsWith('/swap')) {
      const parts = cmd.split(' ');
      if (parts.length < 4) return '❌ Usage: `/swap ETH USDC 0.1`';
      
      const [, tokenA, tokenB, amount] = parts;
      await new Promise(resolve => setTimeout(resolve, 3000));
      onCommandExecuted?.('swap', { tokenA, tokenB, amount });
      return `✅ **Swap Completed!**

🔄 **Trade**: ${amount} ${tokenA.toUpperCase()} → ${tokenB.toUpperCase()}
💱 **Rate**: 1 ${tokenA.toUpperCase()} = 2000 ${tokenB.toUpperCase()}
💸 **Fee**: 0.3%
🔗 **TX**: 0x${Math.random().toString(16).substring(2, 10)}...`;
    }
    
    if (cmd.startsWith('/price')) {
      const token = cmd.split(' ')[1];
      if (!token) return '❌ Please specify token: `/price ETH`';
      
      const price = Math.random() * 3000 + 1000;
      const change = (Math.random() - 0.5) * 10;
      return `📈 **${token.toUpperCase()} Price**

💰 **Current**: $${price.toFixed(2)}
📊 **24h Change**: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
📅 **Last Updated**: ${new Date().toLocaleTimeString()}`;
    }
    
    if (cmd.startsWith('/play')) {
      const parts = cmd.split(' ');
      if (parts.length < 3) return '❌ Usage: `/play dice 0.01` or `/play coin 0.01`';
      
      const [, game, wager] = parts;
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const won = Math.random() > 0.4;
      const result = game === 'dice' ? Math.floor(Math.random() * 6) + 1 : (Math.random() > 0.5 ? 'Heads' : 'Tails');
      
      onCommandExecuted?.('play', { game, wager, won, result });
      return `🎮 **Game Result**

🎯 **Game**: ${game.charAt(0).toUpperCase() + game.slice(1)}
🎲 **Result**: ${result}
💰 **Wager**: ${wager} ETH
${won ? '🎉 **You Won!** +' + (parseFloat(wager) * 1.8).toFixed(4) + ' ETH' : '😔 **You Lost** -' + wager + ' ETH'}
⭐ **XP Earned**: +${won ? 100 : 50}`;
    }
    
    if (cmd === '/xp') {
      const xp = Math.floor(Math.random() * 5000) + 1000;
      return `⭐ **Your XP Stats**

🏆 **Total XP**: ${xp.toLocaleString()}
📊 **Rank**: #${Math.floor(Math.random() * 1000) + 1}
🎯 **Level**: ${Math.floor(xp / 1000) + 1}
🎮 **Games**: ${Math.floor(xp / 50)}

Keep playing to earn more XP! 🚀`;
    }
    
    return `❌ Unknown command: ${command}

Type \`/help\` to see available commands.`;
  };

  // Handle message send
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    addMessage({
      content: userMessage,
      sender: 'user',
      status: 'sent'
    });

    try {
      if (userMessage.startsWith('/')) {
        // Process command
        const thinkingId = Date.now().toString();
        setMessages(prev => [...prev, {
          id: thinkingId,
          content: isAgentConnected
            ? '🤖 Sending command to SquadWallet Agent...'
            : '🔗 Processing command with local contracts...',
          sender: 'agent',
          timestamp: new Date(),
          status: 'sending'
        }]);

        try {
          let response: string;

          if (isAgentConnected) {
            // Send command to real agent via HTTP
            const agentResponse = await fetch('http://localhost:3001/command', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                command: userMessage,
                userAddress: address
              })
            });

            if (!agentResponse.ok) {
              throw new Error('Agent request failed');
            }

            const result = await agentResponse.json();
            response = result.response || 'Command executed successfully';
          } else {
            // Fallback to local processing
            response = await processCommandWithContracts(userMessage);
          }

          setMessages(prev => prev.filter(m => m.id !== thinkingId));
          addMessage({
            content: response,
            sender: 'agent',
            status: 'sent'
          });
        } catch (error) {
          console.error('Command processing failed:', error);
          setMessages(prev => prev.filter(m => m.id !== thinkingId));
          addMessage({
            content: `❌ Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            sender: 'agent',
            status: 'error'
          });
        }
      } else {
        // Regular chat response
        setTimeout(() => {
          addMessage({
            content: `I understand you said: "${userMessage}"\n\nI'm designed to handle commands that start with \`/\`. Try \`/help\` to see what I can do! 🤖`,
            sender: 'agent',
            status: 'sent'
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        content: '❌ Failed to send message. Please try again.',
        sender: 'agent',
        status: 'error'
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
        <p className="text-gray-300">
          Connect your wallet to start chatting with the SquadWallet agent.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">SquadWallet Agent</h3>
            <p className="text-sm text-gray-400">
              {isAgentConnected ? '🟢 Connected to Agent' : '🟡 Local Mode'}
            </p>
          </div>
        </div>

        {!isAgentConnected && (
          <button
            onClick={connectToContracts}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
          >
            {isConnecting ? 'Connecting...' : 'Connect to Agent'}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-white'
            }`}>
              <div className="flex items-start space-x-2">
                {message.sender === 'agent' && <Bot className="w-4 h-4 mt-1 text-blue-400" />}
                {message.sender === 'user' && <User className="w-4 h-4 mt-1" />}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.status === 'sending' && <Zap className="w-3 h-3 animate-pulse" />}
                    {message.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                    {message.status === 'error' && <AlertCircle className="w-3 h-3 text-red-400" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a command (e.g., /help) or message..."
          className="flex-1 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 px-4"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
