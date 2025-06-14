import axios from 'axios';
import { PriceData } from '../types';
import logger from '../utils/logger';

/**
 * Price service for fetching cryptocurrency prices
 */
export class PriceService {
  private apiKey: string;
  private baseUrl = 'https://pro-api.coinmarketcap.com/v1';
  private cache: Map<string, { data: PriceData; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute cache

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.COINMARKETCAP_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('No CoinMarketCap API key provided, using mock data');
    }
  }

  /**
   * Get price data for a token
   */
  async getPrice(symbol: string): Promise<PriceData> {
    const normalizedSymbol = symbol.toUpperCase();
    
    // Check cache first
    const cached = this.cache.get(normalizedSymbol);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      let priceData: PriceData;

      if (this.apiKey) {
        priceData = await this.fetchFromCoinMarketCap(normalizedSymbol);
      } else {
        priceData = this.getMockPrice(normalizedSymbol);
      }

      // Cache the result
      this.cache.set(normalizedSymbol, {
        data: priceData,
        timestamp: Date.now()
      });

      return priceData;
    } catch (error) {
      logger.error('Failed to fetch price data', { symbol, error });
      
      // Return mock data as fallback
      return this.getMockPrice(normalizedSymbol);
    }
  }

  /**
   * Fetch price from CoinMarketCap API
   */
  private async fetchFromCoinMarketCap(symbol: string): Promise<PriceData> {
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
      logger.error('CoinMarketCap API error', { symbol, error });
      throw error;
    }
  }

  /**
   * Get mock price data (fallback when no API key)
   */
  private getMockPrice(symbol: string): PriceData {
    const mockPrices: Record<string, PriceData> = {
      'ETH': {
        symbol: 'ETH',
        price: 2000 + (Math.random() - 0.5) * 100, // Random price around $2000
        change24h: (Math.random() - 0.5) * 10, // Random change ±5%
        changePercent24h: (Math.random() - 0.5) * 10
      },
      'BTC': {
        symbol: 'BTC',
        price: 42000 + (Math.random() - 0.5) * 2000,
        change24h: (Math.random() - 0.5) * 8,
        changePercent24h: (Math.random() - 0.5) * 8
      },
      'USDC': {
        symbol: 'USDC',
        price: 1.00 + (Math.random() - 0.5) * 0.01,
        change24h: (Math.random() - 0.5) * 0.5,
        changePercent24h: (Math.random() - 0.5) * 0.5
      },
      'USDT': {
        symbol: 'USDT',
        price: 1.00 + (Math.random() - 0.5) * 0.01,
        change24h: (Math.random() - 0.5) * 0.5,
        changePercent24h: (Math.random() - 0.5) * 0.5
      },
      'DAI': {
        symbol: 'DAI',
        price: 1.00 + (Math.random() - 0.5) * 0.02,
        change24h: (Math.random() - 0.5) * 0.8,
        changePercent24h: (Math.random() - 0.5) * 0.8
      }
    };

    return mockPrices[symbol] || {
      symbol,
      price: 1,
      change24h: 0,
      changePercent24h: 0
    };
  }

  /**
   * Get multiple prices at once
   */
  async getMultiplePrices(symbols: string[]): Promise<PriceData[]> {
    const promises = symbols.map(symbol => this.getPrice(symbol));
    return Promise.all(promises);
  }

  /**
   * Format price data for display
   */
  formatPriceData(priceData: PriceData): string {
    const { symbol, price, changePercent24h } = priceData;
    const changeEmoji = changePercent24h >= 0 ? '📈' : '📉';
    const changeColor = changePercent24h >= 0 ? '+' : '';
    
    return `${changeEmoji} **${symbol}**: $${price.toFixed(2)} (${changeColor}${changePercent24h.toFixed(2)}%)`;
  }

  /**
   * Get price alert message
   */
  async getPriceAlert(symbol: string, targetPrice: number, isAbove: boolean): Promise<string | null> {
    try {
      const priceData = await this.getPrice(symbol);
      const currentPrice = priceData.price;
      
      const conditionMet = isAbove ? currentPrice >= targetPrice : currentPrice <= targetPrice;
      
      if (conditionMet) {
        const direction = isAbove ? 'above' : 'below';
        return `🚨 **Price Alert**: ${symbol} is now ${direction} $${targetPrice}! Current price: $${currentPrice.toFixed(2)}`;
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to check price alert', { symbol, targetPrice, error });
      return null;
    }
  }

  /**
   * Calculate portfolio value
   */
  async calculatePortfolioValue(holdings: Array<{ symbol: string; amount: number }>): Promise<number> {
    try {
      let totalValue = 0;
      
      for (const holding of holdings) {
        const priceData = await this.getPrice(holding.symbol);
        totalValue += priceData.price * holding.amount;
      }
      
      return totalValue;
    } catch (error) {
      logger.error('Failed to calculate portfolio value', { holdings, error });
      return 0;
    }
  }

  /**
   * Get trending tokens (mock implementation)
   */
  async getTrendingTokens(): Promise<PriceData[]> {
    const trendingSymbols = ['ETH', 'BTC', 'USDC', 'DAI'];
    return this.getMultiplePrices(trendingSymbols);
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Price cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}
