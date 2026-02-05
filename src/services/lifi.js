/**
 * LI.FI SDK Service
 * 
 * This service provides utility functions for interacting with the LI.FI SDK
 * for swaps, bridges, and cross-chain transfers.
 */

import {
  getQuote,
  getRoutes,
  getContractCallsQuote,
  executeRoute,
  getChains,
  getTokens,
  getToken,
  getTokenBalance,
  getTokenBalances,
  getTools,
  getConnections,
  ChainId,
} from '@lifi/sdk';

/**
 * Request a single best quote for a swap or bridge
 * 
 * @param {Object} params - Quote request parameters
 * @returns {Promise<Quote>} The best available quote
 */
export const requestQuote = async (params) => {
  try {
    const quote = await getQuote({
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      slippage: params.slippage || 0.005, // 0.5% default
      integrator: 'settlex-otc',
      // Optional parameters
      maxPriceImpact: params.maxPriceImpact,
      allowBridges: params.allowBridges,
      denyBridges: params.denyBridges,
      allowExchanges: params.allowExchanges,
      denyExchanges: params.denyExchanges,
    });
    
    return quote;
  } catch (error) {
    console.error('Error requesting quote:', error);
    throw error;
  }
};

/**
 * Request multiple route options for a swap or bridge
 * 
 * @param {Object} params - Routes request parameters
 * @returns {Promise<Array<Route>>} Array of available routes
 */
export const requestRoutes = async (params) => {
  try {
    const result = await getRoutes({
      fromChainId: params.fromChainId,
      toChainId: params.toChainId,
      fromTokenAddress: params.fromTokenAddress,
      toTokenAddress: params.toTokenAddress,
      fromAmount: params.fromAmount,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      options: {
        integrator: 'settlex-otc',
        slippage: params.slippage || 0.005,
        order: params.order || 'RECOMMENDED', // CHEAPEST, FASTEST, RECOMMENDED
        maxPriceImpact: params.maxPriceImpact,
        allowSwitchChain: params.allowSwitchChain !== false,
        bridges: params.bridges,
        exchanges: params.exchanges,
      },
    });
    
    return result.routes;
  } catch (error) {
    console.error('Error requesting routes:', error);
    throw error;
  }
};

/**
 * Execute a route or quote
 * 
 * @param {Object} route - Route or quote to execute
 * @param {Object} callbacks - Execution callbacks
 * @returns {Promise<RouteExtended>} Executed route with status
 */
export const executeSwap = async (route, callbacks = {}) => {
  try {
    const executedRoute = await executeRoute(route, {
      // Update callback for tracking progress
      updateRouteHook: (updatedRoute) => {
        if (callbacks.onUpdate) {
          callbacks.onUpdate(updatedRoute);
        }
      },
      
      // Exchange rate update callback
      acceptExchangeRateUpdateHook: async (toToken, oldAmount, newAmount) => {
        if (callbacks.onExchangeRateUpdate) {
          return await callbacks.onExchangeRateUpdate(toToken, oldAmount, newAmount);
        }
        return true; // Auto-accept by default
      },
      
      // Execute in background if needed
      executeInBackground: callbacks.executeInBackground || false,
    });
    
    return executedRoute;
  } catch (error) {
    console.error('Error executing swap:', error);
    throw error;
  }
};

/**
 * Get all supported chains
 * 
 * @returns {Promise<Array<Chain>>} List of supported chains
 */
export const getSupportedChains = async () => {
  try {
    const chains = await getChains();
    return chains;
  } catch (error) {
    console.error('Error fetching chains:', error);
    throw error;
  }
};

/**
 * Get all supported tokens on specified chains
 * 
 * @param {Array<number>} chainIds - Optional array of chain IDs
 * @returns {Promise<Object>} Tokens organized by chain
 */
export const getSupportedTokens = async (chainIds = null) => {
  try {
    const params = chainIds ? { chains: chainIds } : {};
    const tokensResponse = await getTokens(params);
    return tokensResponse.tokens;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    throw error;
  }
};

/**
 * Get token details
 * 
 * @param {number} chainId - Chain ID
 * @param {string} tokenAddress - Token address
 * @returns {Promise<Token>} Token details
 */
export const getTokenDetails = async (chainId, tokenAddress) => {
  try {
    const token = await getToken(chainId, tokenAddress);
    return token;
  } catch (error) {
    console.error('Error fetching token details:', error);
    throw error;
  }
};

/**
 * Get token balance for a wallet
 * 
 * @param {string} walletAddress - Wallet address
 * @param {Object} token - Token object
 * @returns {Promise<TokenAmount>} Token balance
 */
export const getWalletTokenBalance = async (walletAddress, token) => {
  try {
    const balance = await getTokenBalance(walletAddress, token);
    return balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
};

/**
 * Get balances for multiple tokens
 * 
 * @param {string} walletAddress - Wallet address
 * @param {Array<Token>} tokens - Array of token objects
 * @returns {Promise<Array<TokenAmount>>} Token balances
 */
export const getWalletTokenBalances = async (walletAddress, tokens) => {
  try {
    const balances = await getTokenBalances(walletAddress, tokens);
    return balances;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw error;
  }
};

/**
 * Get available bridges and DEXs
 * 
 * @returns {Promise<Object>} Available tools (bridges and exchanges)
 */
export const getAvailableTools = async () => {
  try {
    const tools = await getTools();
    return tools;
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw error;
  }
};

/**
 * Get possible connections between tokens
 * 
 * @param {Object} params - Connection parameters
 * @returns {Promise<Object>} Available connections
 */
export const getTokenConnections = async (params) => {
  try {
    const connections = await getConnections({
      fromChain: params.fromChain,
      fromToken: params.fromToken,
      toChain: params.toChain,
      toToken: params.toToken,
      allowSwitchChain: params.allowSwitchChain !== false,
    });
    return connections;
  } catch (error) {
    console.error('Error fetching connections:', error);
    throw error;
  }
};

// Export ChainId constants for convenience
export { ChainId };

// Common chain IDs
export const CHAIN_IDS = {
  ETHEREUM: ChainId.ETH,
  POLYGON: ChainId.POL,
  ARBITRUM: ChainId.ARB,
  OPTIMISM: ChainId.OPT,
  BASE: ChainId.BAS,
  SEPOLIA: ChainId.SEP,
};
