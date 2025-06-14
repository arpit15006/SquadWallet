import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@xmtp/xmtp-js';
import { useAccount, useWalletClient } from 'wagmi';
import { Send, Bot, User, Zap, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  type?: 'text' | 'command' | 'result';
}

interface EnhancedXMTPChatProps {
  onCommandExecuted?: (command: string, result: any) => void;
}

// Agent address for XMTP communication
const AGENT_ADDRESS = '0x1Be31A94361a391bBaFB2a4CCd704F57dc04d4bb';

export const EnhancedXMTPChat: React.FC<EnhancedXMTPChatProps> = ({ onCommandExecuted }) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isXmtpConnected, setIsXmtpConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested commands for quick access
  const suggestedCommands = [
    { command: '/help', description: 'Show all commands', icon: '❓' },
    { command: '/create-wallet MySquad', description: 'Create squad wallet', icon: '🏦' },
    { command: '/play dice 0.001', description: 'Play dice game', icon: '🎲' },
    { command: '/xp', description: 'Check XP points', icon: '⭐' },
    { command: '/balance', description: 'Check balance', icon: '💰' },
    { command: '/price ETH', description: 'Get ETH price', icon: '📈' },
  ];

  // Initialize XMTP client
  const initializeXMTP = async () => {
    if (!walletClient || !address) return;

    setIsConnecting(true);
    try {
      console.log('🔌 Initializing XMTP client...');
      
      // Create XMTP client
      const client = await Client.create(walletClient, {
        env: 'dev', // Use dev environment for testing
      });

      setXmtpClient(client);
      setIsXmtpConnected(true);

      // Start conversation with agent
      const conversation = await client.conversations.newConversation(AGENT_ADDRESS);
      
      addMessage({
        content: `🤖 **Connected to SquadWallet Agent via XMTP!**

🔗 **XMTP Client**: Initialized
🤖 **Agent**: ${AGENT_ADDRESS}
📡 **Network**: XMTP Dev Network
🎮 **Features**: Real-time messaging, command processing

Ready to help you manage your squad wallets! 🚀

Try: \`/help\` to see all available commands.`,
        sender: 'agent',
        type: 'result'
      });

      // Listen for incoming messages
      const stream = await conversation.streamMessages();
      for await (const message of stream) {
        if (message.senderAddress !== address) {
          addMessage({
            content: message.content,
            sender: 'agent',
            type: 'text'
          });
        }
      }

    } catch (error) {
      console.error('XMTP initialization failed:', error);
      addMessage({
        content: `❌ **XMTP Connection Failed**

${error instanceof Error ? error.message : 'Unknown error'}

Falling back to HTTP bridge mode. Some features may be limited.

You can still use commands, but real-time messaging won't work.`,
        sender: 'agent',
        type: 'result'
      });
    } finally {
      setIsConnecting(false);
    }
  };

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

I'm your AI assistant for managing squad wallets, playing games, and earning XP.

**Quick Start:**
• Click "Connect XMTP" for real-time messaging
• Use suggested commands below
• Type \`/help\` for full command list

**Features:**
🏦 Squad wallet management
🎮 Mini-games with XP rewards
💰 DeFi operations & swaps
🏅 NFT badge minting
📊 Leaderboards & tournaments

Ready to get started? 🚀`,
          sender: 'agent',
          timestamp: new Date(),
          status: 'sent',
          type: 'result'
        }
      ]);
    }
  }, [isConnected, messages.length]);

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

    try {
      if (userMessage.startsWith('/')) {
        // Process command
        const thinkingId = Date.now().toString();
        setMessages(prev => [...prev, {
          id: thinkingId,
          content: isXmtpConnected
            ? '🤖 Processing command via XMTP...'
            : '🔗 Processing command via HTTP bridge...',
          sender: 'agent',
          timestamp: new Date(),
          status: 'sending',
          type: 'text'
        }]);

        try {
          let response: string;

          if (isXmtpConnected && xmtpClient) {
            // Send via XMTP
            const conversation = await xmtpClient.conversations.newConversation(AGENT_ADDRESS);
            await conversation.send(userMessage);
            response = 'Command sent via XMTP. Waiting for agent response...';
          } else {
            // Send via HTTP bridge
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
            content: `I understand you said: "${userMessage}"\n\nI'm designed to handle commands that start with \`/\`. Try one of the suggested commands below or type \`/help\` to see what I can do! 🤖`,
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

  // Handle suggested command click
  const handleSuggestedCommand = (command: string) => {
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
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bot className="w-8 h-8 text-blue-400" />
            {isXmtpConnected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">SquadWallet Agent</h3>
            <p className="text-sm text-gray-400">
              {isXmtpConnected ? '🟢 XMTP Connected' : '🟡 HTTP Bridge Mode'}
            </p>
          </div>
        </div>

        {!isXmtpConnected && (
          <button
            onClick={initializeXMTP}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center space-x-2"
          >
            {isConnecting ? (
              <>
                <Zap className="w-4 h-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Connect XMTP</span>
              </>
            )}
          </button>
        )}
      </div>

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

      {/* Suggested Commands */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">Suggested commands:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedCommands.slice(0, 4).map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedCommand(cmd.command)}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs px-3 py-1 rounded-full transition-colors duration-200 flex items-center space-x-1"
            >
              <span>{cmd.icon}</span>
              <span>{cmd.command}</span>
            </button>
          ))}
        </div>
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
