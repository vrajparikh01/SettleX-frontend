import { sepolia, polygon } from "wagmi/chains";
import { createConfig, http } from "@wagmi/core";

export const otc_contract = (chainId) => {
  if (chainId === 11155111) {
    return "0x7BD0579b0F43CA1de80B71DBC9413a794D196Bb7"; //Sepolia
  } else if (chainId === 137) {
    return "0xCbB24e844ce78D774AbF2dcBAb90C6c921F5CD0d"; //Polygon
  }
};
export const premarket_contract = (chainId) => {
  if (chainId === 11155111) {
    return "0x13EB77f7bec26f2B4A2db1f28835A3f0eb1d2C8d"; //Sepolia
  } else if (chainId === 137) {
    return "0x6a362735848873Bac7323c17652015cb9Cc8d5A4"; //Polygon
  }
};

export const getTransactionUrl = (chainId) => {
  if (chainId === 11155111) {
    return "https://sepolia.etherscan.io/tx/"; //Sepolia
  } else if (chainId === 137) {
    return "https://polygonscan.com/tx/"; //Polygon
  }
};

export const config = createConfig({
  appName: "OTC App",
  projectId: "OTC_PROJECT_ID",
  chains: import.meta.env.VITE_ENV === "production" ? [polygon] : [sepolia],
  transports:
    import.meta.env.VITE_ENV === "production"
      ? {
          [polygon.id]: http(import.meta.env.VITE_POLYGON_RPC_URL),
        }
      : {
          [sepolia.id]: http(import.meta.env.VITE_RPC_URL),
        },
  // chains: [sepolia],
  // transports: {
  //   [sepolia.id]: http(import.meta.env.VITE_RPC_URL),
  // },
});
