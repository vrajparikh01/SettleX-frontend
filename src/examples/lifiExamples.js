/**
 * LI.FI SDK Usage Examples
 * 
 * These examples show how to use the LI.FI SDK service
 * for building custom swap/bridge functionality.
 */

import {
  requestQuote,
  requestRoutes,
  executeSwap,
  getSupportedChains,
  getSupportedTokens,
  getWalletTokenBalance,
  CHAIN_IDS,
} from '../services/lifi';

// ============================================
// Example 1: Simple Swap on Same Chain
// ============================================
export async function exampleSameChainSwap(userAddress) {
  try {
    // Swap 10 USDC to WETH on Ethereum
    const quote = await requestQuote({
      fromChain: CHAIN_IDS.ETHEREUM,
      toChain: CHAIN_IDS.ETHEREUM,
      fromToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      toToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',   // WETH
      fromAmount: '10000000', // 10 USDC (6 decimals)
      fromAddress: userAddress,
    });

    console.log('Quote received:', {
      fromAmount: quote.action.fromAmount,
      toAmount: quote.estimate.toAmount,
      executionTime: quote.estimate.executionDuration,
      gasCosts: quote.estimate.gasCosts,
    });

    return quote;
  } catch (error) {
    console.error('Swap failed:', error);
    throw error;
  }
}

// ============================================
// Example 2: Cross-Chain Bridge
// ============================================
export async function exampleCrossChainBridge(userAddress) {
  try {
    // Bridge 100 USDC from Ethereum to Polygon
    const quote = await requestQuote({
      fromChain: CHAIN_IDS.ETHEREUM,
      toChain: CHAIN_IDS.POLYGON,
      fromToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on Ethereum
      toToken: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',   // USDC on Polygon
      fromAmount: '100000000', // 100 USDC
      fromAddress: userAddress,
      slippage: 0.005, // 0.5%
    });

    console.log('Bridge quote:', {
      fromChain: quote.action.fromChainId,
      toChain: quote.action.toChainId,
      estimatedTime: `${quote.estimate.executionDuration}s`,
      bridgeUsed: quote.toolDetails.name,
    });

    return quote;
  } catch (error) {
    console.error('Bridge failed:', error);
    throw error;
  }
}

// ============================================
// Example 3: Get Multiple Route Options
// ============================================
export async function exampleGetRouteOptions(userAddress) {
  try {
    const routes = await requestRoutes({
      fromChainId: CHAIN_IDS.ETHEREUM,
      toChainId: CHAIN_IDS.ARBITRUM,
      fromTokenAddress: '0x0000000000000000000000000000000000000000', // ETH
      toTokenAddress: '0x0000000000000000000000000000000000000000',   // ETH on Arbitrum
      fromAmount: '1000000000000000000', // 1 ETH
      fromAddress: userAddress,
      order: 'RECOMMENDED', // or 'CHEAPEST', 'FASTEST'
    });

    // Display all route options
    routes.forEach((route, index) => {
      console.log(`Route ${index + 1}:`, {
        fromAmount: route.fromAmount,
        toAmount: route.toAmount,
        steps: route.steps.length,
        executionTime: route.steps.reduce((sum, step) => sum + step.estimate.executionDuration, 0),
        totalGas: route.gasCostUSD,
      });
    });

    return routes;
  } catch (error) {
    console.error('Failed to get routes:', error);
    throw error;
  }
}

// ============================================
// Example 4: Execute Swap with Progress Tracking
// ============================================
export async function exampleExecuteWithTracking(quote, onProgress) {
  try {
    const executedRoute = await executeSwap(quote, {
      // Track execution progress
      onUpdate: (route) => {
        // Extract current status
        const status = {
          routeId: route.id,
          status: route.status,
          steps: route.steps.map(step => ({
            type: step.type,
            status: step.execution?.status,
            txHash: step.execution?.process?.[0]?.txHash,
            explorerLink: step.execution?.process?.[0]?.explorerLink,
          })),
        };

        // Call progress callback
        if (onProgress) {
          onProgress(status);
        }

        console.log('Swap progress:', status);
      },

      // Handle exchange rate changes
      onExchangeRateUpdate: async (token, oldAmount, newAmount) => {
        const oldValue = parseFloat(oldAmount) / Math.pow(10, token.decimals);
        const newValue = parseFloat(newAmount) / Math.pow(10, token.decimals);
        const change = ((newValue - oldValue) / oldValue) * 100;

        console.log(`Exchange rate changed by ${change.toFixed(2)}%`);
        console.log(`Old: ${oldValue} ${token.symbol}, New: ${newValue} ${token.symbol}`);

        // Ask user to confirm
        return window.confirm(
          `Exchange rate changed by ${change.toFixed(2)}%. Continue?`
        );
      },
    });

    console.log('Swap completed:', executedRoute);
    return executedRoute;
  } catch (error) {
    console.error('Execution failed:', error);
    throw error;
  }
}

// ============================================
// Example 5: Check Token Balance
// ============================================
export async function exampleCheckBalance(userAddress) {
  try {
    // Get all Polygon tokens
    const tokensResponse = await getSupportedTokens([CHAIN_IDS.POLYGON]);
    const polygonTokens = tokensResponse[CHAIN_IDS.POLYGON];

    // Find USDC
    const usdc = polygonTokens.find(
      token => token.symbol === 'USDC'
    );

    if (!usdc) {
      throw new Error('USDC not found on Polygon');
    }

    // Get balance
    const balance = await getWalletTokenBalance(userAddress, usdc);

    console.log('USDC Balance:', {
      amount: balance.amount,
      formatted: `${parseFloat(balance.amount) / Math.pow(10, usdc.decimals)} USDC`,
      usdValue: balance.amount * parseFloat(usdc.priceUSD),
    });

    return balance;
  } catch (error) {
    console.error('Failed to get balance:', error);
    throw error;
  }
}

// ============================================
// Example 6: Load Supported Chains
// ============================================
export async function exampleLoadChains() {
  try {
    const chains = await getSupportedChains();

    console.log('Supported chains:', chains.map(chain => ({
      id: chain.id,
      name: chain.name,
      nativeCurrency: chain.nativeCurrency.symbol,
    })));

    return chains;
  } catch (error) {
    console.error('Failed to load chains:', error);
    throw error;
  }
}

// ============================================
// Example 7: Complete Swap Flow
// ============================================
export async function exampleCompleteSwapFlow(
  fromChain,
  toChain,
  fromToken,
  toToken,
  amount,
  userAddress,
  callbacks
) {
  try {
    // Step 1: Request quote
    console.log('Step 1: Requesting quote...');
    const quote = await requestQuote({
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount: amount,
      fromAddress: userAddress,
    });

    if (callbacks.onQuoteReceived) {
      callbacks.onQuoteReceived(quote);
    }

    // Step 2: Show quote to user
    console.log('Quote details:', {
      fromAmount: quote.action.fromAmount,
      toAmount: quote.estimate.toAmount,
      rate: parseFloat(quote.estimate.toAmount) / parseFloat(quote.action.fromAmount),
      fees: quote.estimate.feeCosts,
      time: `${quote.estimate.executionDuration}s`,
    });

    // Step 3: User confirms
    const confirmed = callbacks.onConfirmRequired
      ? await callbacks.onConfirmRequired(quote)
      : true;

    if (!confirmed) {
      console.log('User cancelled swap');
      return null;
    }

    // Step 4: Execute swap
    console.log('Step 2: Executing swap...');
    const result = await executeSwap(quote, {
      onUpdate: callbacks.onProgress,
      onExchangeRateUpdate: callbacks.onExchangeRateUpdate,
    });

    // Step 5: Complete
    console.log('Swap completed successfully!');
    if (callbacks.onComplete) {
      callbacks.onComplete(result);
    }

    return result;
  } catch (error) {
    console.error('Swap flow failed:', error);
    if (callbacks.onError) {
      callbacks.onError(error);
    }
    throw error;
  }
}

// ============================================
// Example 8: React Component Integration
// ============================================
export const useSwapExample = () => {
  const [quote, setQuote] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(null);

  const executeCompleteSwap = async (params) => {
    setLoading(true);
    try {
      const result = await exampleCompleteSwapFlow(
        params.fromChain,
        params.toChain,
        params.fromToken,
        params.toToken,
        params.amount,
        params.userAddress,
        {
          onQuoteReceived: (q) => setQuote(q),
          onProgress: (p) => setProgress(p),
          onConfirmRequired: async (q) => {
            return window.confirm('Confirm swap?');
          },
          onComplete: (result) => {
            console.log('Swap completed:', result);
            setLoading(false);
          },
          onError: (error) => {
            console.error('Swap error:', error);
            setLoading(false);
          },
        }
      );
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    quote,
    loading,
    progress,
    executeCompleteSwap,
  };
};

export default {
  exampleSameChainSwap,
  exampleCrossChainBridge,
  exampleGetRouteOptions,
  exampleExecuteWithTracking,
  exampleCheckBalance,
  exampleLoadChains,
  exampleCompleteSwapFlow,
};
