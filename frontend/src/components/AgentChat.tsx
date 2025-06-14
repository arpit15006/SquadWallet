import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Send, Bot, User, Zap, AlertCircle, CheckCircle, Sparkles, GamepadIcon, Wallet, TrendingUp } from 'lucide-react';
import { Avatar, Name } from './OnchainKitIdentity';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  type?: 'text' | 'command' | 'result' | 'interactive';
  metadata?: any;
}

interface AgentChatProps {
  onCommandExecuted?: (command: string, result: any) => void;
}

// Interactive command cards
const InteractiveCommands = [
  {
    category: 'Wallet',
    icon: Wallet,
    color: 'blue',
    commands: [
      { cmd: '/create-wallet MySquad', desc: 'Create squad wallet', icon: '🏦' },
      { cmd: '/balance', desc: 'Check balance', icon: '💰' },
      { cmd: '/deposit 0.01', desc: 'Deposit ETH', icon: '📥' },
      { cmd: '/wallets', desc: 'List wallets', icon: '📋' },
    ]
  },
  {
    category: 'Games',
    icon: GamepadIcon,
    color: 'purple',
    commands: [
      { cmd: '/play dice 0.001', desc: 'Play dice game', icon: '🎲' },
      { cmd: '/play coin 0.001', desc: 'Play coin flip', icon: '🪙' },
      { cmd: '/games', desc: 'Active games', icon: '🎮' },
      { cmd: '/xp', desc: 'Check XP', icon: '⭐' },
    ]
  },
  {
    category: 'DeFi',
    icon: TrendingUp,
    color: 'green',
    commands: [
      { cmd: '/price ETH', desc: 'Get ETH price', icon: '📈' },
      { cmd: '/swap ETH USDC 0.1', desc: 'Swap tokens', icon: '🔄' },
      { cmd: '/tip @user.base 0.01', desc: 'Tip friend', icon: '💸' },
      { cmd: '/mintbadge', desc: 'Mint badge', icon: '🏅' },
    ]
  }
];

export const AgentChat: React.FC<AgentChatProps> = ({ onCommandExecuted }) => {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [showCommands, setShowCommands] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isConnected && messages.length === 0) {
      setMessages([
        {
          id: '1',
          content: `🤖 **Welcome to SquadWallet Agent!**

I'm your AI assistant powered by **Coinbase AgentKit** and **XMTP**.

**🚀 What I can do:**
• Create and manage squad wallets
• Play mini-games and earn XP
• Execute DeFi operations & swaps
• Mint NFT badges with Basenames
• Real-time price tracking
• Social features & tipping

**🎯 Quick Start:**
Click any command card below or type \`/help\` for the full list.

Ready to build your squad? Let's go! 🔥`,
          sender: 'agent',
          timestamp: new Date(),
          status: 'sent',
          type: 'result'
        }
      ]);
    }
  }, [isConnected, messages.length]);

  // Connect to agent
  const connectToAgent = async () => {
    try {
      const response = await fetch('http://localhost:3001/status');
      if (response.ok) {
        const status = await response.json();
        setIsAgentConnected(true);
        addMessage({
          content: `✅ **Connected to SquadWallet Agent!**

🤖 **Agent**: ${status.agentAddress}
⛓️ **Network**: Base Sepolia
📡 **Status**: Real XMTP agent active
🎮 **Games**: Live on blockchain
💰 **Wallets**: Real squad wallet creation

All systems operational! 🚀`,
          sender: 'agent',
          type: 'result'
        });
      }
    } catch (error) {
      console.log('Agent not available, using local mode');
    }
  };

  useEffect(() => {
    if (isConnected) {
      connectToAgent();
    }
  }, [isConnected]);

  // Add message helper
  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
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
      status: 'sent',
      type: userMessage.startsWith('/') ? 'command' : 'text'
    });

    // Hide command cards after first interaction
    setShowCommands(false);

    try {
      if (userMessage.startsWith('/')) {
        // Process command
        const thinkingId = Date.now().toString();
        setMessages(prev => [...prev, {
          id: thinkingId,
          content: '🤖 Processing command with AgentKit...',
          sender: 'agent',
          timestamp: new Date(),
          status: 'sending',
          type: 'text'
        }]);

        try {
          let response: string;

          if (isAgentConnected) {
            // Send to real agent
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
            // Simulate response for demo
            response = await simulateAgentResponse(userMessage);
          }

          setMessages(prev => prev.filter(m => m.id !== thinkingId));
          addMessage({
            content: response,
            sender: 'agent',
            status: 'sent',
            type: 'result'
          });

          // Trigger callback
          onCommandExecuted?.(userMessage, response);

        } catch (error) {
          console.error('Command processing failed:', error);
          setMessages(prev => prev.filter(m => m.id !== thinkingId));
          addMessage({
            content: `❌ Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            sender: 'agent',
            status: 'error',
            type: 'result'
          });
        }
      } else {
        // Regular chat response
        setTimeout(() => {
          addMessage({
            content: `I understand you said: "${userMessage}"\n\nI'm designed to handle commands that start with \`/\`. Try clicking one of the command cards or type \`/help\` to see what I can do! 🤖`,
            sender: 'agent',
            status: 'sent',
            type: 'text'
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        content: '❌ Failed to send message. Please try again.',
        sender: 'agent',
        status: 'error',
        type: 'result'
      });
    }
  };

  // Simulate agent response for demo
  const simulateAgentResponse = async (command: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cmd = command.toLowerCase();
    
    if (cmd === '/help') {
      return `🤖 **Available Commands:**

**Wallet Management:**
• \`/create-wallet <name>\` - Create squad wallet
• \`/balance\` - Check your balance
• \`/deposit <amount>\` - Deposit ETH
• \`/wallets\` - List your wallets

**Games & XP:**
• \`/play dice <wager>\` - Play dice game
• \`/play coin <wager>\` - Play coin flip
• \`/xp\` - Check XP points
• \`/games\` - View active games

**DeFi & Social:**
• \`/price <token>\` - Get token price
• \`/swap <from> <to> <amount>\` - Swap tokens
• \`/tip @user.base <amount>\` - Tip friend
• \`/mintbadge\` - Mint XP badge

All powered by **Coinbase AgentKit** and **OnchainKit**! 🚀`;
    }
    
    if (cmd.startsWith('/create-wallet')) {
      const name = cmd.split(' ').slice(1).join(' ') || 'MySquad';
      return `✅ **Squad Wallet Created!**

🏦 **Name**: ${name}
📍 **Address**: 0x${Math.random().toString(16).substring(2, 10)}...
👥 **Members**: 1 (you)
⛓️ **Network**: Base Sepolia

Your squad wallet is ready! Use \`/deposit <amount>\` to add funds.`;
    }
    
    return `✅ Command processed successfully! This is a demo response.`;
  };

  // Handle command card click
  const handleCommandClick = (command: string) => {
    setInputMessage(command);
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet</h3>
        <p className="text-gray-300">
          Connect your wallet to start chatting with the SquadWallet agent.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 h-[700px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bot className="w-8 h-8 text-blue-400" />
            {isAgentConnected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">SquadWallet Agent</h3>
            <p className="text-sm text-gray-400">
              {isAgentConnected ? '🟢 AgentKit Connected' : '🟡 Demo Mode'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
          >
            {showCommands ? 'Hide' : 'Show'} Commands
          </button>
        </div>
      </div>

      {/* Interactive Command Cards */}
      {showCommands && (
        <div className="mb-4 space-y-3">
          <p className="text-sm text-gray-400">Quick commands:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {InteractiveCommands.map((category, idx) => (
              <div key={idx} className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <category.icon className={`w-4 h-4 text-${category.color}-400`} />
                  <span className="text-sm font-medium text-white">{category.category}</span>
                </div>
                <div className="space-y-1">
                  {category.commands.slice(0, 2).map((cmd, cmdIdx) => (
                    <button
                      key={cmdIdx}
                      onClick={() => handleCommandClick(cmd.cmd)}
                      className="w-full text-left bg-gray-600/50 hover:bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded transition-colors duration-200 flex items-center space-x-2"
                    >
                      <span>{cmd.icon}</span>
                      <span className="truncate">{cmd.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'result'
                  ? 'bg-green-600/20 border border-green-500/30 text-white'
                  : message.type === 'command'
                  ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                  : 'bg-gray-700 text-white'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.sender === 'agent' && <Bot className="w-4 h-4 mt-1 text-blue-400 flex-shrink-0" />}
                  {message.sender === 'user' && address && (
                    <Avatar address={address} className="w-4 h-4 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="whitespace-pre-wrap text-sm break-words">{message.content}</div>
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
            </motion.div>
          ))}
        </AnimatePresence>
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
          className="flex-1 bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
