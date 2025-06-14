# SquadWallet Setup & Deployment Guide

## 🚀 Quick Start

### Step 1: Get Required Keys & Setup

#### 1.1 Get a Private Key for Deployment
```bash
# Option 1: Create a new wallet (recommended for testing)
# Use MetaMask or any wallet to generate a new private key
# Make sure it has some ETH on Base Sepolia for gas fees

# Option 2: Use existing wallet private key (be careful!)
# Export private key from MetaMask: Account Details > Export Private Key
```

#### 1.2 Get Base Sepolia ETH
- Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- Enter your wallet address
- Get free testnet ETH for deployment

#### 1.3 Get API Keys

**BaseScan API Key (for contract verification):**
1. Go to [BaseScan](https://basescan.org/apis)
2. Create account and get free API key

**WalletConnect Project ID (for frontend):**
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create project and get Project ID

**CoinMarketCap API Key (optional, for price data):**
1. Go to [CoinMarketCap API](https://coinmarketcap.com/api/)
2. Get free API key

**Coinbase Developer Platform (for AgentKit):**
1. Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create API key and download the JSON file

### Step 2: Configure Environment

Edit the `.env` file with your keys:

```bash
# Required for deployment
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY

# Required for frontend
VITE_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID

# Optional (can be added later)
COINMARKETCAP_API_KEY=YOUR_CMC_API_KEY
CDP_API_KEY_NAME=YOUR_CDP_API_KEY_NAME
CDP_API_KEY_PRIVATE_KEY=YOUR_CDP_PRIVATE_KEY
XMTP_PRIVATE_KEY=YOUR_XMTP_PRIVATE_KEY
```

### Step 3: Deploy to Base Sepolia

```bash
# Install dependencies
npm install

# Deploy contracts to Base Sepolia
cd contracts
npm install
npm run deploy

# The script will output contract addresses
# Copy these addresses to your .env file
```

### Step 4: Update Environment with Contract Addresses

After deployment, update `.env` with the contract addresses:

```bash
SQUAD_WALLET_FACTORY=0xYOUR_FACTORY_ADDRESS
GAME_MANAGER_CONTRACT=0xYOUR_GAME_MANAGER_ADDRESS
XP_BADGES_CONTRACT=0xYOUR_XP_BADGES_ADDRESS

# Also update frontend env
VITE_SQUAD_WALLET_FACTORY=0xYOUR_FACTORY_ADDRESS
VITE_GAME_MANAGER_CONTRACT=0xYOUR_GAME_MANAGER_ADDRESS
VITE_XP_BADGES_CONTRACT=0xYOUR_XP_BADGES_ADDRESS
```

### Step 5: Test the Frontend

```bash
# Start frontend
cd frontend
npm install
npm run dev

# Open http://localhost:5173
# Connect your wallet and test functionality
```

### Step 6: Setup Agent (Optional)

```bash
# Get XMTP private key (can be same as deployment key)
# Get Coinbase AgentKit credentials

# Start agent
cd agent
npm install
npm run dev

# Test agent commands in the chat interface
```

## 🌐 Deploy to Base Mainnet

Once everything works on Sepolia:

### Step 1: Update Environment for Mainnet

```bash
# Update .env for mainnet
BASE_RPC_URL=https://mainnet.base.org
BASE_CHAIN_ID=8453
VITE_BASE_RPC_URL=https://mainnet.base.org

# Mainnet Chainlink VRF
CHAINLINK_VRF_COORDINATOR=0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
CHAINLINK_KEY_HASH=0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
```

### Step 2: Get Mainnet ETH

- Ensure your deployment wallet has ETH on Base mainnet
- You'll need ~0.01 ETH for deployment

### Step 3: Deploy to Mainnet

```bash
cd contracts
npm run deploy
```

### Step 4: Verify Contracts

```bash
npm run verify
```

## 🔧 Troubleshooting

### Common Issues

**"Insufficient funds for gas"**
- Get more ETH from faucet (Sepolia) or buy ETH (mainnet)

**"Invalid private key"**
- Make sure private key starts with 0x
- Check that it's a valid 64-character hex string

**"Contract verification failed"**
- Check BaseScan API key is correct
- Wait a few minutes and try again

**"Frontend can't connect to contracts"**
- Make sure contract addresses are correct in .env
- Check that you're on the right network (Sepolia vs Mainnet)

### Getting Help

1. Check the console for error messages
2. Verify all environment variables are set
3. Make sure you're on the correct network
4. Check that contracts are deployed and verified

## 📋 Deployment Checklist

### Base Sepolia (Testing)
- [ ] Private key with Sepolia ETH
- [ ] BaseScan API key
- [ ] WalletConnect Project ID
- [ ] Contracts deployed successfully
- [ ] Contract addresses updated in .env
- [ ] Frontend connects and works
- [ ] Basic functionality tested

### Base Mainnet (Production)
- [ ] Private key with mainnet ETH
- [ ] Environment updated for mainnet
- [ ] Contracts deployed to mainnet
- [ ] Contracts verified on BaseScan
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Agent deployed to Railway/Fly.io
- [ ] All functionality tested
- [ ] Demo video created

## 🎯 Next Steps

After successful deployment:

1. **Create demo content**
   - Record demo video
   - Take screenshots
   - Write usage examples

2. **Deploy to production**
   - Deploy frontend to Vercel
   - Deploy agent to Railway
   - Set up monitoring

3. **Submit to buildathon**
   - Prepare submission materials
   - Document unique features
   - Highlight technical achievements
