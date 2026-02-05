import { createConfig, config, EVM } from '@lifi/sdk';
import { getWalletClient, switchChain } from '@wagmi/core';

/**
 * LI.FI SDK Configuration
 * 
 * This configuration sets up the LI.FI SDK for SettleX platform
 * with proper EVM provider integration using Wagmi.
 */

// Create LI.FI SDK configuration
createConfig({
  // API Key for higher rate limits and production use
  apiKey: import.meta.env.VITE_LIFI_API_KEY,
  
  // Integrator name (required for fee collection)
  integrator: 'settlex-otc',
  
  // Route options applied globally to all requests
  routeOptions: {
    // Slippage tolerance (0.5% = 0.005)
    slippage: 0.005,
    
    // Allow routes that require chain switching
    allowSwitchChain: true,
    
    // Allow destination contract calls
    allowDestinationCall: true,
    
    // Fee configuration (optional - requires integrator verification)
    // fee: 0.003, // 0.3% fee
  },
  
  // Disable automatic chain preloading (we'll load chains dynamically)
  preloadChains: false,
});

/**
 * Configure EVM Provider
 * This should be called after Wagmi is initialized
 * 
 * @param {Config} wagmiConfig - Wagmi configuration object
 */
export const configureLiFiProviders = (wagmiConfig) => {
  config.setProviders([
    EVM({
      // Get wallet client from Wagmi
      getWalletClient: () => getWalletClient(wagmiConfig),
      
      // Switch chain using Wagmi
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, { chainId });
        return getWalletClient(wagmiConfig, { chainId: chain.id });
      },
    }),
  ]);
};

// Export the config object for direct access
export { config };
export default config;
