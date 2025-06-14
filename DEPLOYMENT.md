# SquadWallet Deployment Guide

This guide covers deploying SquadWallet to production environments.

## Prerequisites

- Node.js 18+
- Git repository
- Base mainnet RPC access
- Deployment accounts for:
  - Railway/Fly.io (Agent)
  - Vercel/Netlify (Frontend)
  - BaseScan API key (Contract verification)

## 1. Smart Contract Deployment

### Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Fill in required values:
# - PRIVATE_KEY (deployment wallet)
# - BASE_RPC_URL
# - BASESCAN_API_KEY
# - Chainlink VRF configuration
```

### Deploy Contracts

```bash
# Install dependencies
cd contracts
npm install

# Compile contracts
npm run build

# Deploy to Base mainnet
npm run deploy

# Verify contracts on BaseScan
npm run verify
```

### Post-Deployment

1. Save contract addresses from `deployment-info.json`
2. Fund the GameManager with LINK tokens for VRF
3. Create Chainlink VRF subscription
4. Add GameManager as VRF consumer

## 2. Agent Deployment

### Railway Deployment

1. **Create Railway Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and create project
   railway login
   railway init
   ```

2. **Configure Environment Variables**
   ```bash
   # Set in Railway dashboard or CLI
   railway variables set XMTP_PRIVATE_KEY=your_key
   railway variables set CDP_API_KEY_NAME=your_key
   railway variables set CDP_API_KEY_PRIVATE_KEY=your_key
   railway variables set BASE_RPC_URL=https://mainnet.base.org
   railway variables set SQUAD_WALLET_FACTORY=0x...
   railway variables set GAME_MANAGER_CONTRACT=0x...
   railway variables set XP_BADGES_CONTRACT=0x...
   ```

3. **Deploy**
   ```bash
   cd agent
   railway deploy
   ```

### Fly.io Deployment

1. **Create Fly App**
   ```bash
   # Install Fly CLI
   curl -L https://fly.io/install.sh | sh
   
   # Create app
   cd agent
   fly launch
   ```

2. **Configure Secrets**
   ```bash
   fly secrets set XMTP_PRIVATE_KEY=your_key
   fly secrets set CDP_API_KEY_NAME=your_key
   fly secrets set CDP_API_KEY_PRIVATE_KEY=your_key
   # ... other environment variables
   ```

3. **Deploy**
   ```bash
   fly deploy
   ```

### Docker Deployment

```dockerfile
# agent/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 3. Frontend Deployment

### Vercel Deployment

1. **Connect Repository**
   - Go to Vercel dashboard
   - Import your GitHub repository
   - Select the `frontend` directory as root

2. **Configure Environment Variables**
   ```env
   VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
   VITE_BASE_RPC_URL=https://mainnet.base.org
   VITE_SQUAD_WALLET_FACTORY=0x...
   VITE_GAME_MANAGER_CONTRACT=0x...
   VITE_XP_BADGES_CONTRACT=0x...
   VITE_AGENT_URL=https://your-agent.railway.app
   ```

3. **Deploy**
   - Vercel will automatically deploy on push to main branch

### Netlify Deployment

1. **Build Locally**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

3. **Configure Environment Variables**
   - Set in Netlify dashboard under Site Settings > Environment Variables

## 4. Post-Deployment Setup

### Contract Configuration

1. **Authorize Agent**
   ```bash
   # Call setAgentAuthorization on XPBadges contract
   # Authorize SquadWalletFactory and GameManager
   ```

2. **Fund Contracts**
   ```bash
   # Send ETH to agent wallet for gas fees
   # Fund GameManager with LINK for VRF
   ```

### Testing

1. **Contract Verification**
   - Verify all contracts on BaseScan
   - Test basic functions (create wallet, deposit, etc.)

2. **Agent Testing**
   - Test XMTP message handling
   - Verify command processing
   - Check transaction signing

3. **Frontend Testing**
   - Test wallet connection
   - Verify contract interactions
   - Check responsive design

### Monitoring

1. **Agent Monitoring**
   - Set up logging aggregation
   - Configure error tracking (Sentry)
   - Monitor uptime and performance

2. **Contract Monitoring**
   - Set up event monitoring
   - Track gas usage
   - Monitor contract balances

## 5. Domain and SSL

### Custom Domain

1. **Purchase Domain**
   - Buy domain from registrar
   - Configure DNS records

2. **Configure SSL**
   - Vercel/Netlify handle SSL automatically
   - For custom deployments, use Let's Encrypt

### DNS Configuration

```
# DNS Records
A     @           your-server-ip
CNAME www         your-app.vercel.app
CNAME agent       your-agent.railway.app
```

## 6. Maintenance

### Updates

1. **Smart Contracts**
   - Deploy new versions if needed
   - Update frontend contract addresses
   - Migrate data if necessary

2. **Agent Updates**
   - Deploy through Railway/Fly.io
   - Monitor for issues
   - Rollback if needed

3. **Frontend Updates**
   - Deploy through Vercel/Netlify
   - Test thoroughly
   - Monitor user feedback

### Backup

1. **Environment Variables**
   - Keep secure backup of all environment variables
   - Document all configuration

2. **Database**
   - If using database, set up regular backups
   - Test restore procedures

### Security

1. **Key Management**
   - Rotate keys regularly
   - Use secure key storage
   - Monitor for unauthorized access

2. **Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Apply patches promptly

## Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   - Check gas limits
   - Verify network configuration
   - Ensure sufficient ETH balance

2. **Agent Not Responding**
   - Check environment variables
   - Verify XMTP connection
   - Check logs for errors

3. **Frontend Connection Issues**
   - Verify contract addresses
   - Check RPC endpoint
   - Test wallet connection

### Support

- Check GitHub issues
- Review documentation
- Contact team for critical issues

## Security Checklist

- [ ] Private keys stored securely
- [ ] Environment variables configured
- [ ] Contracts verified on BaseScan
- [ ] Agent monitoring enabled
- [ ] SSL certificates configured
- [ ] DNS security configured
- [ ] Backup procedures tested
- [ ] Update procedures documented
