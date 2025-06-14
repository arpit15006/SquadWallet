// Test the PriceService directly
require('dotenv').config();

async function testPriceService() {
  try {
    // Import the compiled PriceService
    const { PriceService } = require('./dist/services/price.js');
    
    console.log('🔍 Testing PriceService...');
    console.log('API Key:', process.env.COINMARKETCAP_API_KEY ? 'Set ✅' : 'Missing ❌');
    
    const priceService = new PriceService();
    
    const priceData = await priceService.getPrice('ETH');
    
    console.log('✅ PriceService Working!');
    console.log('📊 Price Data:', {
      symbol: priceData.symbol,
      price: priceData.price,
      change24h: priceData.change24h,
      volume24h: priceData.volume24h,
      marketCap: priceData.marketCap
    });
    
  } catch (error) {
    console.log('❌ PriceService Error:', error.message);
    
    if (error.message.includes('Cannot find module')) {
      console.log('💡 Need to compile TypeScript first. Running: npm run build');
    }
  }
}

testPriceService();
