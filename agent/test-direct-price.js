// Direct test of price functionality
const axios = require('axios');
require('dotenv').config();

class TestPriceService {
  constructor() {
    this.apiKey = process.env.COINMARKETCAP_API_KEY;
    this.baseUrl = 'https://pro-api.coinmarketcap.com/v1';
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute
  }

  async getPrice(symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    
    // Check cache first
    const cached = this.cache.get(normalizedSymbol);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('📦 Using cached data');
      return cached.data;
    }

    try {
      let priceData;

      if (this.apiKey) {
        console.log('🌐 Fetching from CoinMarketCap API...');
        priceData = await this.fetchFromCoinMarketCap(normalizedSymbol);
      } else {
        console.log('⚠️ No API key, using mock data');
        priceData = this.getMockPrice(normalizedSymbol);
      }

      // Cache the result
      this.cache.set(normalizedSymbol, {
        data: priceData,
        timestamp: Date.now()
      });

      return priceData;
    } catch (error) {
      console.error('❌ Failed to fetch price data:', error.message);
      
      // Return mock data as fallback
      return this.getMockPrice(normalizedSymbol);
    }
  }

  async fetchFromCoinMarketCap(symbol) {
    try {
      const response = await axios.get(`${this.baseUrl}/cryptocurrency/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          symbol: symbol,
          convert: 'USD'
        }
      });

      const data = response.data.data[symbol];
      if (!data) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const quote = data.quote.USD;
      
      return {
        symbol,
        price: quote.price,
        change24h: quote.percent_change_24h,
        changePercent24h: quote.percent_change_24h,
        volume24h: quote.volume_24h,
        marketCap: quote.market_cap,
        lastUpdated: data.last_updated
      };
    } catch (error) {
      console.error('CoinMarketCap API error:', error.response?.data || error.message);
      throw error;
    }
  }

  getMockPrice(symbol) {
    const mockPrices = {
      'ETH': {
        symbol: 'ETH',
        price: 2000 + (Math.random() - 0.5) * 100,
        change24h: (Math.random() - 0.5) * 10,
        changePercent24h: (Math.random() - 0.5) * 10
      },
      'BTC': {
        symbol: 'BTC',
        price: 42000 + (Math.random() - 0.5) * 2000,
        change24h: (Math.random() - 0.5) * 8,
        changePercent24h: (Math.random() - 0.5) * 8
      }
    };

    return mockPrices[symbol] || {
      symbol,
      price: 1,
      change24h: 0,
      changePercent24h: 0
    };
  }

  formatLargeNumber(num) {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  }

  formatPriceResponse(priceData) {
    return `💰 **${priceData.symbol} Price Data** (CoinMarketCap)

💵 **Current Price**: $${priceData.price.toFixed(2)}
📈 **24h Change**: ${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%
📊 **24h Volume**: ${priceData.volume24h ? '$' + this.formatLargeNumber(priceData.volume24h) : 'N/A'}
🏆 **Market Cap**: ${priceData.marketCap ? '$' + this.formatLargeNumber(priceData.marketCap) : 'N/A'}
⏰ **Last Updated**: ${priceData.lastUpdated ? new Date(priceData.lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString()}

${priceData.change24h >= 0 ? '🟢' : '🔴'} **Trend**: ${priceData.change24h >= 0 ? 'Bullish' : 'Bearish'}

💡 **Set Price Alert**: \`/alert ${priceData.symbol} <price>\`
🔄 **Refresh**: \`/price ${priceData.symbol}\``;
  }
}

// Test the service
async function testPriceCommand() {
  console.log('🧪 Testing Price Command Implementation...\n');
  
  const priceService = new TestPriceService();
  
  console.log('🔑 API Key Status:', process.env.COINMARKETCAP_API_KEY ? 'Set ✅' : 'Missing ❌');
  console.log('');
  
  // Test ETH price
  console.log('📊 Testing ETH price...');
  const ethPrice = await priceService.getPrice('ETH');
  console.log('Raw data:', ethPrice);
  console.log('');
  console.log('Formatted response:');
  console.log(priceService.formatPriceResponse(ethPrice));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test BTC price
  console.log('📊 Testing BTC price...');
  const btcPrice = await priceService.getPrice('BTC');
  console.log('Formatted response:');
  console.log(priceService.formatPriceResponse(btcPrice));
}

testPriceCommand().catch(console.error);
