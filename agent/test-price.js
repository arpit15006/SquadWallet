const axios = require('axios');

// Test CoinMarketCap API directly
async function testCoinMarketCapAPI() {
  const apiKey = '166d78a0-5739-4ffc-b2e0-7ff3966145ae';
  const baseUrl = 'https://pro-api.coinmarketcap.com/v1';
  
  try {
    console.log('🔍 Testing CoinMarketCap API...');
    
    const response = await axios.get(`${baseUrl}/cryptocurrency/quotes/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      },
      params: {
        symbol: 'ETH',
        convert: 'USD'
      }
    });

    const data = response.data.data['ETH'];
    if (data) {
      const quote = data.quote.USD;
      console.log('✅ CoinMarketCap API Working!');
      console.log(`💰 ETH Price: $${quote.price.toFixed(2)}`);
      console.log(`📈 24h Change: ${quote.percent_change_24h.toFixed(2)}%`);
      console.log(`📊 Volume: $${(quote.volume_24h / 1e9).toFixed(2)}B`);
      console.log(`🏆 Market Cap: $${(quote.market_cap / 1e9).toFixed(2)}B`);
      console.log(`⏰ Last Updated: ${data.last_updated}`);
    } else {
      console.log('❌ No data returned from CoinMarketCap');
    }
  } catch (error) {
    console.log('❌ CoinMarketCap API Error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.status?.error_message || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 API Key issue - check if key is valid');
    } else if (error.response?.status === 429) {
      console.log('⏰ Rate limit exceeded');
    }
  }
}

testCoinMarketCapAPI();
