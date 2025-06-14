// Test agent startup to see what's failing
require('dotenv').config();

console.log('🔍 Testing Agent Startup...\n');

// Check environment variables
console.log('📋 Environment Variables:');
const requiredEnvVars = [
  'XMTP_PRIVATE_KEY',
  'CDP_API_KEY_NAME', 
  'CDP_API_KEY_PRIVATE_KEY',
  'BASE_RPC_URL',
  'SQUAD_WALLET_FACTORY',
  'GAME_MANAGER_CONTRACT',
  'XP_BADGES_CONTRACT',
  'COINMARKETCAP_API_KEY'
];

let missingVars = [];
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${envVar.includes('KEY') ? value.substring(0, 10) + '...' : value}`);
  } else {
    console.log(`❌ ${envVar}: Missing`);
    missingVars.push(envVar);
  }
});

if (missingVars.length > 0) {
  console.log('\n⚠️ Missing environment variables:', missingVars);
  console.log('The agent will fail to start without these.');
} else {
  console.log('\n✅ All required environment variables are set!');
}

// Test imports
console.log('\n📦 Testing Imports...');
try {
  console.log('Testing ethers...');
  const { ethers } = require('ethers');
  console.log('✅ ethers imported successfully');
  
  console.log('Testing axios...');
  const axios = require('axios');
  console.log('✅ axios imported successfully');
  
  console.log('Testing dotenv...');
  require('dotenv');
  console.log('✅ dotenv imported successfully');
  
} catch (error) {
  console.log('❌ Import error:', error.message);
}

// Test basic functionality
console.log('\n🧪 Testing Basic Functionality...');

// Test RPC connection
async function testRPCConnection() {
  try {
    console.log('Testing RPC connection...');
    const { ethers } = require('ethers');
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    console.log('✅ RPC connection successful, block number:', blockNumber);
  } catch (error) {
    console.log('❌ RPC connection failed:', error.message);
  }
}

// Test CoinMarketCap API
async function testCoinMarketCapAPI() {
  try {
    console.log('Testing CoinMarketCap API...');
    const axios = require('axios');
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        symbol: 'ETH',
        convert: 'USD'
      }
    });
    
    const ethPrice = response.data.data.ETH.quote.USD.price;
    console.log('✅ CoinMarketCap API working, ETH price:', `$${ethPrice.toFixed(2)}`);
  } catch (error) {
    console.log('❌ CoinMarketCap API failed:', error.response?.data?.status?.error_message || error.message);
  }
}

// Run tests
async function runTests() {
  await testRPCConnection();
  await testCoinMarketCapAPI();
  
  console.log('\n🎯 Summary:');
  console.log('If all tests pass, the agent should be able to start.');
  console.log('If any tests fail, those are the issues to fix.');
}

runTests().catch(console.error);
