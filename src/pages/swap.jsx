import React, { useState, useEffect, useMemo } from 'react';
import { LiFiWidget } from '@lifi/widget';
import { useAccount, useConfig } from 'wagmi';
import { configureLiFiProviders } from '../config/lifi';

export default function Swap() {
  const { isConnected } = useAccount();
  const wagmiConfig = useConfig();
  const [mode, setMode] = useState('swap'); // 'swap' or 'bridge'

  // Configure LI.FI SDK providers when component mounts
  useEffect(() => {
    if (wagmiConfig) {
      configureLiFiProviders(wagmiConfig);
    }
  }, [wagmiConfig]);

  // Li.Fi Widget Configuration (v3)
  const widgetConfig = useMemo(() => ({
    // API Key for higher rate limits (optional but recommended)
    apiKey: import.meta.env.VITE_LIFI_API_KEY,
    
    // Widget variant - compact for focused swap experience
    variant: 'compact',
    
    // Subvariant - split for separate Swap/Bridge interfaces
    subvariant: 'split',
    subvariantOptions: {
      split: mode, // 'swap' or 'bridge'
    },
    
    // Hide UI elements that cause errors or are not needed
    hiddenUI: [
      'appearance', // Hide appearance settings (we control this)
      'language',   // Hide language settings (optional)
    ],
    
    // For TESTING on Sepolia testnet
    fromChain: mode === 'swap' ? 11155111 : undefined, // Sepolia for testing
    toChain: mode === 'swap' ? 11155111 : undefined,   // Same chain = swap on Sepolia
    
    // Supported chains (Sepolia, Polygon, Ethereum)
    chains: {
      allow: [11155111, 137, 1], // Sepolia testnet, Polygon Mainnet, Ethereum Mainnet
    },

    // Featured tokens for Sepolia
    tokens: {
      featured: [
        {
          address: '0x0000000000000000000000000000000000000000', // Native ETH on Sepolia
          symbol: 'ETH',
          decimals: 18,
          chainId: 11155111,
          name: 'Sepolia Ether',
          logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
        },
      ],
    },

    // Appearance & Theme - match SettleX design system
    appearance: 'auto', // Auto-detect light/dark mode
    theme: {
      container: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        borderRadius: '16px',
      },
      palette: {
        primary: {
          main: '#00D632', // theme-green
        },
      },
      shape: {
        borderRadius: 12,
        borderRadiusSecondary: 14,
      },
    },

    // SDK Configuration - separate from widget config in v3
    sdkConfig: {
      routeOptions: {
        slippage: 0.005, // 0.5% default slippage
        allowSwitchChain: true,
      },
    },
    
    // Fee configuration (optional - for monetization)
    // fee: 0.003, // 0.3% fee
  }), [mode]);

  return (
    <div className="px-5 py-4 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-baseWhiteDark dark:text-baseWhite mb-2">
          {mode === 'swap' ? 'Swap Tokens' : 'Bridge Assets'}
        </h1>
        <p className="text-sm text-gray500 dark:text-gray500Dark">
          {mode === 'swap' 
            ? 'Trade tokens on the same blockchain with best rates' 
            : 'Transfer assets across different blockchains securely'}
        </p>
      </div>

      {/* Swap/Bridge Toggle */}
      <div className="flex justify-start mb-6">
        <div className="inline-flex rounded-full border border-gray300 dark:border-gray300Dark p-1 bg-gray100 dark:bg-gray100Dark">
          <button
            onClick={() => setMode('swap')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'swap'
                ? 'bg-theme-green text-baseWhite shadow-sm'
                : 'text-gray500 dark:text-gray500Dark hover:text-baseWhiteDark dark:hover:text-baseWhite'
            }`}
          >
            Swap
          </button>
          <button
            onClick={() => setMode('bridge')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'bridge'
                ? 'bg-theme-green text-baseWhite shadow-sm'
                : 'text-gray500 dark:text-gray500Dark hover:text-baseWhiteDark dark:hover:text-baseWhite'
            }`}
          >
            Bridge
          </button>
        </div>
      </div>

      {/* Li.Fi Widget */}
      {isConnected ? (
        <div className="lifi-widget-container max-w-[480px]">
          <LiFiWidget config={widgetConfig} integrator="settlex-otc" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full py-12 text-base font-medium bg-gray100 dark:bg-gray100Dark rounded-2xl text-gray500 dark:text-gray500Dark gap-y-4 border border-gray300 dark:border-gray300Dark max-w-[480px]">
          <svg className="w-16 h-16 text-gray500 dark:text-gray500Dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-center px-6">
            <h3 className="text-lg font-semibold text-baseWhiteDark dark:text-baseWhite mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-sm text-gray500 dark:text-gray500Dark">
              Connect your wallet to start swapping or bridging tokens
            </p>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[900px]">
        <div className="p-4 rounded-[14px] bg-gray100 dark:bg-gray100Dark border border-gray300 dark:border-gray300Dark">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-theme-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-sm font-semibold text-baseWhiteDark dark:text-baseWhite">Best Rates</h4>
          </div>
          <p className="text-xs text-gray500 dark:text-gray500Dark">
            Aggregated from 15+ DEXs and bridges
          </p>
        </div>

        <div className="p-4 rounded-[14px] bg-gray100 dark:bg-gray100Dark border border-gray300 dark:border-gray300Dark">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-theme-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h4 className="text-sm font-semibold text-baseWhiteDark dark:text-baseWhite">Fast & Secure</h4>
          </div>
          <p className="text-xs text-gray500 dark:text-gray500Dark">
            Optimized routes with minimal slippage
          </p>
        </div>

        <div className="p-4 rounded-[14px] bg-gray100 dark:bg-gray100Dark border border-gray300 dark:border-gray300Dark">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-theme-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-sm font-semibold text-baseWhiteDark dark:text-baseWhite">Low Fees</h4>
          </div>
          <p className="text-xs text-gray500 dark:text-gray500Dark">
            Competitive gas and protocol fees
          </p>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6">
        <p className="text-xs text-gray500 dark:text-gray500Dark">
          Powered by{' '}
          <a 
            href="https://li.fi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-theme-green hover:underline font-medium"
          >
            Li.Fi
          </a>
          {' '}• Aggregating liquidity across{' '}
          <span className="font-semibold">15+ DEXs</span> and{' '}
          <span className="font-semibold">20+ bridges</span>
        </p>
      </div>
    </div>
  );
}
