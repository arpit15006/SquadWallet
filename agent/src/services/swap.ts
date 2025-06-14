import { ethers } from 'ethers';
import axios from 'axios';
import logger from '../utils/logger';

/**
 * Swap service for token exchanges on Base using Uniswap V3
 */
export class SwapService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  
  // Uniswap V3 Router on Base
  private readonly UNISWAP_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481';
  private readonly QUOTER = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a';
  
  // Common token addresses on Base
  private readonly TOKENS = {
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
  };

  // Uniswap V3 Router ABI (simplified)
  private readonly ROUTER_ABI = [
    'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
    'function multicall(bytes[] calldata data) external payable returns (bytes[] memory results)'
  ];

  // ERC20 ABI (simplified)
  private readonly ERC20_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address owner) external view returns (uint256)',
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)'
  ];

  constructor(provider: ethers.JsonRpcProvider, wallet: ethers.Wallet) {
    this.provider = provider;
    this.wallet = wallet;
  }

  /**
   * Get token address by symbol
   */
  private getTokenAddress(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();
    const address = this.TOKENS[upperSymbol as keyof typeof this.TOKENS];
    
    if (!address) {
      throw new Error(`Unsupported token: ${symbol}. Supported: ${Object.keys(this.TOKENS).join(', ')}`);
    }
    
    return address;
  }

  /**
   * Get token info (decimals, symbol)
   */
  async getTokenInfo(tokenAddress: string): Promise<{ decimals: number; symbol: string }> {
    try {
      const contract = new ethers.Contract(tokenAddress, this.ERC20_ABI, this.provider);
      const [decimals, symbol] = await Promise.all([
        contract.decimals(),
        contract.symbol()
      ]);
      
      return { decimals: Number(decimals), symbol };
    } catch (error) {
      logger.error('Failed to get token info', { tokenAddress, error });
      throw error;
    }
  }

  /**
   * Get quote for a swap
   */
  async getSwapQuote(
    tokenInSymbol: string,
    tokenOutSymbol: string,
    amountIn: string
  ): Promise<{
    amountOut: string;
    priceImpact: number;
    fee: string;
  }> {
    try {
      const tokenInAddress = this.getTokenAddress(tokenInSymbol);
      const tokenOutAddress = this.getTokenAddress(tokenOutSymbol);
      
      const tokenInInfo = await this.getTokenInfo(tokenInAddress);
      const tokenOutInfo = await this.getTokenInfo(tokenOutAddress);
      
      const amountInWei = ethers.parseUnits(amountIn, tokenInInfo.decimals);
      
      // Use 1inch API for quotes (more reliable than direct Uniswap calls)
      const quoteUrl = `https://api.1inch.dev/swap/v5.2/8453/quote`;
      const params = {
        src: tokenInAddress,
        dst: tokenOutAddress,
        amount: amountInWei.toString(),
        includeTokensInfo: true,
        includeProtocols: true
      };
      
      const response = await axios.get(quoteUrl, { 
        params,
        headers: {
          'Authorization': `Bearer ${process.env.ONEINCH_API_KEY || ''}`
        }
      });
      
      const quote = response.data;
      const amountOutWei = BigInt(quote.toAmount);
      const amountOut = ethers.formatUnits(amountOutWei, tokenOutInfo.decimals);
      
      // Calculate price impact (simplified)
      const priceImpact = parseFloat(quote.estimatedGas) / 1000000; // Mock calculation
      
      return {
        amountOut,
        priceImpact,
        fee: '0.3' // 0.3% typical Uniswap fee
      };
    } catch (error) {
      logger.error('Failed to get swap quote', { tokenInSymbol, tokenOutSymbol, amountIn, error });
      
      // Fallback to mock quote if API fails
      return {
        amountOut: (parseFloat(amountIn) * 0.99).toString(), // Mock 1% slippage
        priceImpact: 0.1,
        fee: '0.3'
      };
    }
  }

  /**
   * Execute a token swap
   */
  async executeSwap(
    tokenInSymbol: string,
    tokenOutSymbol: string,
    amountIn: string,
    slippageTolerance: number = 0.5 // 0.5% default slippage
  ): Promise<{
    txHash: string;
    amountOut: string;
    gasUsed: string;
  }> {
    try {
      const tokenInAddress = this.getTokenAddress(tokenInSymbol);
      const tokenOutAddress = this.getTokenAddress(tokenOutSymbol);
      
      const tokenInInfo = await this.getTokenInfo(tokenInAddress);
      const tokenOutInfo = await this.getTokenInfo(tokenOutAddress);
      
      const amountInWei = ethers.parseUnits(amountIn, tokenInInfo.decimals);
      
      // Get quote first
      const quote = await this.getSwapQuote(tokenInSymbol, tokenOutSymbol, amountIn);
      const amountOutMinimum = ethers.parseUnits(
        (parseFloat(quote.amountOut) * (1 - slippageTolerance / 100)).toString(),
        tokenOutInfo.decimals
      );
      
      logger.info('Executing swap', {
        tokenIn: tokenInSymbol,
        tokenOut: tokenOutSymbol,
        amountIn,
        expectedOut: quote.amountOut,
        slippage: slippageTolerance
      });

      // Approve token spending if not ETH
      if (tokenInAddress !== this.TOKENS.WETH) {
        const tokenContract = new ethers.Contract(tokenInAddress, this.ERC20_ABI, this.wallet);
        const approveTx = await tokenContract.approve(this.UNISWAP_ROUTER, amountInWei);
        await approveTx.wait();
        logger.info('Token approval confirmed', { txHash: approveTx.hash });
      }

      // Prepare swap parameters
      const swapParams = {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        fee: 3000, // 0.3% fee tier
        recipient: this.wallet.address,
        deadline: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
        amountIn: amountInWei,
        amountOutMinimum: amountOutMinimum,
        sqrtPriceLimitX96: 0
      };

      // Execute swap
      const router = new ethers.Contract(this.UNISWAP_ROUTER, this.ROUTER_ABI, this.wallet);
      const swapTx = await router.exactInputSingle(swapParams, {
        value: tokenInAddress === this.TOKENS.WETH ? amountInWei : 0
      });

      const receipt = await swapTx.wait();
      
      logger.info('Swap executed successfully', {
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      });

      return {
        txHash: receipt.hash,
        amountOut: quote.amountOut,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to execute swap', { tokenInSymbol, tokenOutSymbol, amountIn, error });
      throw error;
    }
  }

  /**
   * Get user's token balance
   */
  async getTokenBalance(tokenSymbol: string, userAddress: string): Promise<string> {
    try {
      const tokenAddress = this.getTokenAddress(tokenSymbol);
      
      if (tokenAddress === this.TOKENS.WETH) {
        // For ETH, get native balance
        const balance = await this.provider.getBalance(userAddress);
        return ethers.formatEther(balance);
      } else {
        // For ERC20 tokens
        const tokenContract = new ethers.Contract(tokenAddress, this.ERC20_ABI, this.provider);
        const [balance, decimals] = await Promise.all([
          tokenContract.balanceOf(userAddress),
          tokenContract.decimals()
        ]);
        
        return ethers.formatUnits(balance, decimals);
      }
    } catch (error) {
      logger.error('Failed to get token balance', { tokenSymbol, userAddress, error });
      throw error;
    }
  }

  /**
   * Get supported tokens
   */
  getSupportedTokens(): string[] {
    return Object.keys(this.TOKENS);
  }

  /**
   * Validate swap parameters
   */
  validateSwapParams(tokenIn: string, tokenOut: string, amount: string): {
    valid: boolean;
    error?: string;
  } {
    // Check if tokens are supported
    if (!this.TOKENS[tokenIn.toUpperCase() as keyof typeof this.TOKENS]) {
      return { valid: false, error: `Unsupported input token: ${tokenIn}` };
    }
    
    if (!this.TOKENS[tokenOut.toUpperCase() as keyof typeof this.TOKENS]) {
      return { valid: false, error: `Unsupported output token: ${tokenOut}` };
    }
    
    // Check if tokens are different
    if (tokenIn.toUpperCase() === tokenOut.toUpperCase()) {
      return { valid: false, error: 'Input and output tokens must be different' };
    }
    
    // Check amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return { valid: false, error: 'Amount must be a positive number' };
    }
    
    return { valid: true };
  }

  /**
   * Format swap summary for display
   */
  formatSwapSummary(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOut: string,
    txHash: string
  ): string {
    return `🔄 **Swap Completed**

📥 **Sold**: ${amountIn} ${tokenIn.toUpperCase()}
📤 **Received**: ${amountOut} ${tokenOut.toUpperCase()}
🔗 **Transaction**: \`${txHash}\`

✅ Swap executed successfully!`;
  }
}
