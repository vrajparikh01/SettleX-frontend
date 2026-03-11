import { sepolia, polygon, base } from "wagmi/chains";
import { createConfig, http } from "@wagmi/core";

const CONTRACTS = {
  otc: {
    11155111: import.meta.env.VITE_OTC_CONTRACT_SEPOLIA, // Sepolia
    137:      import.meta.env.VITE_OTC_CONTRACT_POLYGON,  // Polygon
    8453:     import.meta.env.VITE_OTC_CONTRACT_BASE,     // Base
  },
  premarket: {
    11155111: import.meta.env.VITE_PREMARKET_CONTRACT_SEPOLIA, // Sepolia
    137:      import.meta.env.VITE_PREMARKET_CONTRACT_POLYGON,  // Polygon
    8453:     import.meta.env.VITE_PREMARKET_CONTRACT_BASE,     // Base
  },
};

export const otc_contract = (chainId) => CONTRACTS.otc[chainId];
export const premarket_contract = (chainId) => CONTRACTS.premarket[chainId];

export const getTransactionUrl = (chainId) => {
  if (chainId === 11155111) {
    return "https://sepolia.etherscan.io/tx/"; // Sepolia
  } else if (chainId === 137) {
    return "https://polygonscan.com/tx/";       // Polygon
  } else if (chainId === 8453) {
    return "https://basescan.org/tx/";          // Base
  }
};

export const config = createConfig({
  appName: "OTC App",
  projectId: "OTC_PROJECT_ID",
  chains: import.meta.env.VITE_ENV === "production" ? [polygon, base] : [sepolia],
  transports:
    import.meta.env.VITE_ENV === "production"
      ? {
          [polygon.id]: http(import.meta.env.VITE_POLYGON_RPC_URL),
          [base.id]:    http(import.meta.env.VITE_BASE_RPC_URL),
        }
      : {
          [sepolia.id]: http(import.meta.env.VITE_RPC_URL),
        },
  // chains: [sepolia],
  // transports: {
  //   [sepolia.id]: http(import.meta.env.VITE_RPC_URL),
  // },
});
