# 🚀 SquadWallet Quick Start

Deploy SquadWallet to Base Sepolia in 5 minutes!

## Prerequisites

1. **Node.js 18+** installed
2. **Wallet with Sepolia ETH** (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))
3. **BaseScan API Key** (free from [BaseScan](https://basescan.org/apis))
4. **WalletConnect Project ID** (free from [WalletConnect Cloud](https://cloud.walletconnect.com/))

## Step 1: Get Your Keys

### 1.1 Private Key
- Export private key from MetaMask: Account Details > Export Private Key
- **⚠️ Use a test wallet, not your main wallet!**

### 1.2 Get Sepolia ETH
- Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- Enter your wallet address
- Get free testnet ETH

### 1.3 API Keys
- **BaseScan**: [basescan.org/apis](https://basescan.org/apis) (for contract verification)
- **WalletConnect**: [cloud.walletconnect.com](https://cloud.walletconnect.com/) (for frontend)

## Step 2: Configure Environment

Edit the `.env` file:

```bash
# Required for deployment
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY

# Required for frontend
VITE_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID

# Optional (for agent)
COINMARKETCAP_API_KEY=YOUR_CMC_API_KEY
```

## Step 3: Deploy Everything

Run the quick deployment script:

```bash
./scripts/quick-deploy.sh
```

This will:
- ✅ Install all dependencies
- ✅ Compile smart contracts
- ✅ Deploy to Base Sepolia
- ✅ Update .env with contract addresses
- ✅ Setup frontend and agent

## Step 4: Test the Frontend

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 and:
1. Connect your wallet
2. Create a squad wallet
3. Deposit some ETH
4. Try the games!

## Step 5: Verify Contracts (Optional)

```bash
cd contracts
npm run verify
```

## 🎯 Deploy to Base Mainnet

Once everything works on Sepolia:

1. **Update .env for mainnet:**
   ```bash
   BASE_RPC_URL=https://mainnet.base.org
   VITE_BASE_RPC_URL=https://mainnet.base.org
   ```

2. **Get mainnet ETH** (~0.01 ETH needed)

3. **Deploy to mainnet:**
   ```bash
   cd contracts
   npm run deploy:mainnet
   ```

## 🔧 Troubleshooting

**"Insufficient funds for gas"**
- Get more Sepolia ETH from the faucet

**"Invalid private key"**
- Make sure it starts with 0x and is 64 characters

**"Contract verification failed"**
- Check your BaseScan API key
- Wait a few minutes and try again

**Frontend can't connect**
- Make sure contract addresses are in .env
- Check you're on Sepolia network in MetaMask

## 📋 What You Get

After deployment:
- ✅ **Smart Contracts** on Base Sepolia
- ✅ **Frontend** with wallet integration
- ✅ **Agent** ready for XMTP (needs keys)
- ✅ **Games** with mock randomness
- ✅ **XP & Badge System**

## 🎮 Features to Test

1. **Wallet Management**
   - Create squad wallets
   - Add members
   - Deposit/withdraw ETH

2. **Mini Games**
   - Dice roll games
   - Coin flip games
   - Win/lose mechanics

3. **XP System**
   - Earn XP for activities
   - View leaderboards
   - Collect badges

4. **Agent Chat** (with XMTP keys)
   - `/create-wallet MySquad`
   - `/deposit 0.01`
   - `/play dice 0.001`
   - `/price ETH`

## 🚀 Production Deployment

For the buildathon submission:

1. **Deploy to Base mainnet** (follow steps above)
2. **Deploy frontend** to Vercel/Netlify
3. **Deploy agent** to Railway/Fly.io
4. **Create demo video**
5. **Submit to buildathon**

## 📞 Need Help?

Check the full documentation:
- `SETUP_GUIDE.md` - Detailed setup instructions
- `DEPLOYMENT.md` - Production deployment guide
- `README.md` - Project overview

## 🎯 Ready for Buildathon! 🏆

Your SquadWallet is now ready for the Base Batches Messaging Buildathon submission!
