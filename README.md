# 🏦 SquadWallet

**A fully on-chain, messaging-native group wallet mini-app for the Base Batches Messaging Buildathon**

SquadWallet enables groups to create shared wallets inside XMTP group DMs, with built-in DeFi operations, mini-games, and an AI agent that provides price alerts and portfolio management.

## 🎯 Features

- **Shared Group Wallets**: Create multi-sig wallets directly in XMTP group chats
- **DeFi Operations**: Deposit, swap tokens, stake, and bridge assets
- **Mini-Games**: Dice roll and coin flip games with automatic payouts
- **AI Agent**: Price alerts, PnL tracking, and rebalancing suggestions
- **XP & NFT Badges**: Gamified experience with claimable achievements
- **Zero Custody**: All state changes on Base blockchain or XMTP messages

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Messaging/Agent | XMTP SDK + Coinbase AgentKit |
| Frontend | React + Vite + Tailwind + OnchainKit |
| Smart Contracts | Solidity + Hardhat (Base mainnet) |
| Wallet Integration | Wagmi + RainbowKit |

## 📁 Project Structure

```
/agent          # TypeScript XMTP + AgentKit logic
  └─ agent.ts   # Message listener, command parser, tx signer
/contracts      # Smart contracts
  ├─ SquadWallet.sol    # Multi-sig pooled wallet
  ├─ GameManager.sol    # Dice/coin games with VRF
  └─ XPBadges.sol       # ERC-721 NFT + XP system
/frontend       # React frontend
  ├─ src/pages
  │   ├─ index.tsx      # Landing & chat simulator
  │   ├─ wallet.tsx     # Dashboard & portfolio
  │   └─ game.tsx       # Mini-game interface
  └─ components         # Reusable UI components
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- MetaMask or compatible wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/squad-wallet.git
cd squad-wallet

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your XMTP, AgentKit, and contract addresses
```

### Development

```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on http://localhost:5173
npm run dev:agent     # Agent service
```

### Deployment

```bash
# Deploy contracts to Base
npm run deploy:contracts

# Build and deploy frontend
npm run build:frontend
```

## 🎮 Agent Commands

| Command | Description |
|---------|-------------|
| `/create-wallet <name>` | Deploy new SquadWallet contract |
| `/deposit <amount>` | Deposit ETH/USDC to group wallet |
| `/split` | Show contribution breakdown |
| `/swap <tokenA> <tokenB> <amount>` | Swap tokens via Uniswap |
| `/price <ticker>` | Get current token price |
| `/play dice <wager>` | Play dice game (highest roll wins) |
| `/play coin <wager>` | Play coin flip game |
| `/xp` | Show XP leaderboard |
| `/badge claim` | Claim NFT badge if eligible |
| `/help` | Show all commands |

## 📋 Contract Addresses

### Base Mainnet
- **SquadWallet Factory**: `TBD`
- **GameManager**: `TBD`
- **XPBadges**: `TBD`

### Verified Contracts
- [SquadWallet on BaseScan](https://basescan.org/address/TBD)
- [GameManager on BaseScan](https://basescan.org/address/TBD)
- [XPBadges on BaseScan](https://basescan.org/address/TBD)

## 🏗️ Architecture

### Smart Contracts
- **SquadWallet.sol**: Multi-signature wallet with proposal/voting mechanism
- **GameManager.sol**: Provably fair games using Chainlink VRF
- **XPBadges.sol**: ERC-721 NFTs with metadata for achievements

### Agent System
- **XMTP Integration**: Listens to group messages and parses commands
- **AgentKit Wallet**: Autonomous transaction signing and execution
- **Price Feeds**: Real-time market data and portfolio tracking

### Frontend
- **OnchainKit Components**: Wallet connection and transaction UI
- **Real-time Updates**: Live portfolio and game state updates
- **Responsive Design**: Mobile-first Tailwind CSS styling

## 🧪 Testing

```bash
# Run all tests
npm test

# Test contracts
npm run test:contracts

# Test agent
npm run test:agent
```

## 📺 Demo

[Demo Video](https://youtu.be/TBD) - 90-second walkthrough of SquadWallet features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Buildathon Submission

Built for the **Base Batches Messaging Buildathon** - showcasing the power of on-chain agents and messaging-native DeFi.

### Key Achievements
- ✅ Fully on-chain group wallet functionality
- ✅ XMTP messaging integration with AI agent
- ✅ Mini-games with provable randomness
- ✅ XP system and NFT achievements
- ✅ Real-time portfolio management
- ✅ Zero custodial architecture

---

**Built with ❤️ by the SquadWallet Team**
