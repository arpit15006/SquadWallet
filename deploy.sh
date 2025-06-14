#!/bin/bash

# SquadWallet Deployment Script
# This script deploys the complete SquadWallet application

set -e

echo "🚀 Starting SquadWallet Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Check environment variables
check_env() {
    print_status "Checking environment variables..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating template..."
        cat > .env << EOF
# SquadWallet Environment Variables

# XMTP Configuration
XMTP_PRIVATE_KEY=your_xmtp_private_key_here
XMTP_ENV=dev

# Base Network Configuration
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Contract Addresses (will be populated after deployment)
SQUAD_WALLET_CONTRACT=
GAME_MANAGER_CONTRACT=
XP_BADGES_CONTRACT=

# API Keys
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
ONCHAINKIT_API_KEY=your_onchainkit_api_key

# Frontend Configuration
VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_ONCHAINKIT_API_KEY=your_onchainkit_api_key
EOF
        print_warning "Please update the .env file with your actual values before continuing."
        exit 1
    fi
    
    print_success "Environment file found"
}

# Deploy smart contracts
deploy_contracts() {
    print_status "Deploying smart contracts..."
    
    if [ -d "contracts" ]; then
        cd contracts
        
        if [ ! -d "node_modules" ]; then
            print_status "Installing contract dependencies..."
            npm install
        fi
        
        print_status "Compiling contracts..."
        npx hardhat compile
        
        print_status "Deploying to Base Sepolia..."
        npx hardhat run scripts/deploy.js --network base-sepolia
        
        cd ..
        print_success "Smart contracts deployed"
    else
        print_warning "Contracts directory not found, skipping contract deployment"
    fi
}

# Setup and start agent
setup_agent() {
    print_status "Setting up XMTP agent..."
    
    if [ -d "agent" ]; then
        cd agent
        
        if [ ! -d "node_modules" ]; then
            print_status "Installing agent dependencies..."
            npm install
        fi
        
        print_status "Building agent..."
        npm run build
        
        print_status "Starting agent in background..."
        npm start &
        AGENT_PID=$!
        echo $AGENT_PID > ../agent.pid
        
        cd ..
        print_success "XMTP agent started (PID: $AGENT_PID)"
    else
        print_error "Agent directory not found"
        exit 1
    fi
}

# Build and deploy frontend
deploy_frontend() {
    print_status "Building frontend..."
    
    if [ -d "frontend" ]; then
        cd frontend
        
        if [ ! -d "node_modules" ]; then
            print_status "Installing frontend dependencies..."
            npm install
        fi
        
        print_status "Building production bundle..."
        npm run build
        
        print_status "Frontend built successfully"
        print_status "Build output available in frontend/dist/"
        
        # Optional: Deploy to Vercel or Netlify
        if command -v vercel &> /dev/null; then
            print_status "Deploying to Vercel..."
            vercel --prod
            print_success "Frontend deployed to Vercel"
        elif command -v netlify &> /dev/null; then
            print_status "Deploying to Netlify..."
            netlify deploy --prod --dir=dist
            print_success "Frontend deployed to Netlify"
        else
            print_warning "No deployment tool found. You can manually deploy the frontend/dist/ folder"
        fi
        
        cd ..
    else
        print_error "Frontend directory not found"
        exit 1
    fi
}

# Health check
health_check() {
    print_status "Running health checks..."
    
    # Check if agent is running
    if [ -f "agent.pid" ]; then
        AGENT_PID=$(cat agent.pid)
        if ps -p $AGENT_PID > /dev/null; then
            print_success "XMTP agent is running (PID: $AGENT_PID)"
        else
            print_warning "XMTP agent is not running"
        fi
    fi
    
    # Check if frontend build exists
    if [ -d "frontend/dist" ]; then
        print_success "Frontend build is ready"
    else
        print_warning "Frontend build not found"
    fi
    
    print_success "Health check completed"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    
    if [ -f "agent.pid" ]; then
        AGENT_PID=$(cat agent.pid)
        if ps -p $AGENT_PID > /dev/null; then
            print_status "Stopping agent (PID: $AGENT_PID)..."
            kill $AGENT_PID
        fi
        rm agent.pid
    fi
}

# Main deployment flow
main() {
    echo "🎮 SquadWallet - Complete Deployment"
    echo "===================================="
    
    # Parse command line arguments
    SKIP_CONTRACTS=false
    SKIP_AGENT=false
    SKIP_FRONTEND=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-contracts)
                SKIP_CONTRACTS=true
                shift
                ;;
            --skip-agent)
                SKIP_AGENT=true
                shift
                ;;
            --skip-frontend)
                SKIP_FRONTEND=true
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-contracts  Skip smart contract deployment"
                echo "  --skip-agent      Skip XMTP agent setup"
                echo "  --skip-frontend   Skip frontend deployment"
                echo "  --help           Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_dependencies
    check_env
    
    if [ "$SKIP_CONTRACTS" = false ]; then
        deploy_contracts
    else
        print_warning "Skipping contract deployment"
    fi
    
    if [ "$SKIP_AGENT" = false ]; then
        setup_agent
    else
        print_warning "Skipping agent setup"
    fi
    
    if [ "$SKIP_FRONTEND" = false ]; then
        deploy_frontend
    else
        print_warning "Skipping frontend deployment"
    fi
    
    health_check
    
    echo ""
    echo "🎉 SquadWallet Deployment Complete!"
    echo "=================================="
    echo ""
    echo "📱 Frontend: Check your deployment platform for the URL"
    echo "🤖 Agent: Running in background"
    echo "⛓️  Contracts: Deployed to Base Sepolia"
    echo ""
    echo "🚀 Your SquadWallet is ready to use!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with deployed contract addresses"
    echo "2. Test the application with a small transaction"
    echo "3. Share with your community!"
    echo ""
    echo "To stop the agent: kill \$(cat agent.pid)"
}

# Set up signal handlers
trap cleanup EXIT

# Run main function
main "$@"
