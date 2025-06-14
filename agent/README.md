# SquadWallet Agent

The SquadWallet Agent is an AI-powered assistant that integrates with XMTP messaging and Coinbase AgentKit to provide autonomous wallet operations, game management, and user assistance.

## Features

- **XMTP Integration**: Secure, end-to-end encrypted messaging
- **Coinbase AgentKit**: Autonomous wallet operations and transaction signing
- **Command Processing**: Natural language and slash command support
- **Game Management**: Automated game creation and result processing
- **Price Feeds**: Real-time cryptocurrency price data
- **XP & Badge System**: Automated reward distribution

## Setup

### Prerequisites

- Node.js 18+
- XMTP private key
- Coinbase Developer Platform API keys
- Base network RPC access

### Installation

```bash
cd agent
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
# XMTP Configuration
XMTP_ENV=production
XMTP_PRIVATE_KEY=your_xmtp_private_key_here

# Coinbase AgentKit Configuration
CDP_API_KEY_NAME=your_cdp_api_key_name
CDP_API_KEY_PRIVATE_KEY=your_cdp_private_key

# Base Network Configuration
BASE_RPC_URL=https://mainnet.base.org
BASE_CHAIN_ID=8453

# Contract Addresses
SQUAD_WALLET_FACTORY=0x...
GAME_MANAGER_CONTRACT=0x...
XP_BADGES_CONTRACT=0x...

# External APIs
COINMARKETCAP_API_KEY=your_cmc_api_key
```

### Development

```bash
# Start in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## Commands

The agent supports the following commands:

### Wallet Management
- `/create-wallet <name>` - Create a new SquadWallet
- `/deposit <amount>` - Deposit ETH to wallet
- `/balance [wallet-address]` - Check wallet balance
- `/wallets` - List user's wallets
- `/split [wallet-address]` - Show contribution breakdown

### Games
- `/play dice <wager>` - Start a dice game
- `/play coin <wager>` - Start a coin flip game
- `/join <gameId>` - Join an existing game
- `/games` - List active games
- `/start <gameId>` - Start a dice game (creator only)

### Information
- `/price <token>` - Get current token price
- `/stats` - View user statistics
- `/xp` - Check XP and badges
- `/leaderboard` - View XP leaderboard
- `/help` - Show all commands
- `/agent` - Get agent information

## Architecture

### Services

- **XMTPService**: Handles messaging and conversation management
- **BlockchainService**: Manages smart contract interactions
- **PriceService**: Fetches cryptocurrency price data

### Handlers

- **WalletHandlers**: Wallet creation, deposits, balance queries
- **GameHandlers**: Game creation, joining, and management
- **InfoHandlers**: Price data, statistics, and help commands

### Utilities

- **Parser**: Command parsing and validation
- **Logger**: Structured logging with Winston

## Deployment

### Railway

1. Create a new Railway project
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard
4. Deploy automatically on push

### Fly.io

1. Install Fly CLI
2. Create `fly.toml` configuration
3. Deploy with `fly deploy`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring

The agent includes:

- Health check endpoints
- Structured logging
- Error tracking
- Performance metrics
- Scheduled task monitoring

## Security

- Private keys stored securely in environment variables
- Input validation and sanitization
- Rate limiting on commands
- Error handling without sensitive data exposure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
