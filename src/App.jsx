import Layout from "./components/layout/layout";
import Dashboard from "./pages/dashboard";
import DealApproval from "./pages/dealApproval";
import Otc from "./pages/otc";
import OtcDetails from "./pages/otcDetails";
import OtcBroker from "./pages/otcBroker";
import SettingAppearance from "./pages/settingAppearance";
import SettingsLayout from "./components/Settings/SettingsLayout";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Premarket from "./pages/premarket";
import Settings from "./pages/settings";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { sepolia, polygon, mainnet, base } from "wagmi/chains";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {
  argentWallet,
  bifrostWallet,
  binanceWallet,
  bitgetWallet,
  bitskiWallet,
  bitverseWallet,
  bloomWallet,
  braveWallet,
  bybitWallet,
  clvWallet,
  coin98Wallet,
  coinbaseWallet,
  compassWallet,
  coreWallet,
  dawnWallet,
  desigWallet,
  enkryptWallet,
  foxWallet,
  frameWallet,
  frontierWallet,
  gateWallet,
  imTokenWallet,
  injectedWallet,
  iopayWallet,
  kaiaWallet,
  kaikasWallet,
  krakenWallet,
  kresusWallet,
  ledgerWallet,
  magicEdenWallet,
  metaMaskWallet,
  mewWallet,
  nestWallet,
  oktoWallet,
  okxWallet,
  omniWallet,
  oneInchWallet,
  oneKeyWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  ramperWallet,
  roninWallet,
  safeWallet,
  safeheronWallet,
  safepalWallet,
  seifWallet,
  subWallet,
  tahoWallet,
  talismanWallet,
  tokenaryWallet,
  tokenPocketWallet,
  trustWallet,
  uniswapWallet,
  valoraWallet,
  walletConnectWallet,
  xdefiWallet,
  zealWallet,
  zerionWallet,
} from "@rainbow-me/rainbowkit/wallets";
import SettingWallet from "./pages/settingWallet";
import Login from "./pages/Login";
import { useEffect } from "react";
import Admin from "./pages/admin";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
// import Equity from "./pages/equity"; // Commented for Li.Fi integration
import Swap from "./pages/swap"; // Li.Fi Swap & Bridge page

// ─── Created OUTSIDE the component so they are never recreated on re-render ───
// Recreating wagmi config on every render causes repeated RPC calls to every chain.

const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet, polygon, base],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        argentWallet,
        bifrostWallet,
        binanceWallet,
        bitgetWallet,
        bitskiWallet,
        bitverseWallet,
        bloomWallet,
        braveWallet,
        bybitWallet,
        clvWallet,
        coin98Wallet,
        coinbaseWallet,
        compassWallet,
        coreWallet,
        dawnWallet,
        desigWallet,
        enkryptWallet,
        foxWallet,
        frameWallet,
        frontierWallet,
        gateWallet,
        imTokenWallet,
        injectedWallet,
        iopayWallet,
        kaiaWallet,
        kaikasWallet,
        krakenWallet,
        kresusWallet,
        ledgerWallet,
        magicEdenWallet,
        metaMaskWallet,
        mewWallet,
        nestWallet,
        oktoWallet,
        okxWallet,
        omniWallet,
        oneInchWallet,
        oneKeyWallet,
        phantomWallet,
        rabbyWallet,
        rainbowWallet,
        ramperWallet,
        roninWallet,
        safeWallet,
        safeheronWallet,
        safepalWallet,
        seifWallet,
        subWallet,
        tahoWallet,
        talismanWallet,
        tokenaryWallet,
        tokenPocketWallet,
        trustWallet,
        uniswapWallet,
        valoraWallet,
        walletConnectWallet,
        xdefiWallet,
        zealWallet,
        zerionWallet,
      ],
    },
  ],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC_URL || 'https://eth.llamarpc.com'),
    [polygon.id]: http(import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon.llamarpc.com'),
    [base.id]: http(import.meta.env.VITE_BASE_RPC_URL || 'https://base.llamarpc.com'),
  },
  // Reduce block polling from default 4s to 30s — prevents RPC call storms
  pollingInterval: 30_000,
});

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [{ index: true, element: <Premarket /> }],
  },
  {
    path: "/otc",
    element: <Layout />,
    children: [
      { index: true, element: <Otc /> },
      { path: "details", element: <OtcDetails /> },
    ],
  },
  {
    path: "/broker",
    element: <Layout />,
    children: [{ index: true, element: <OtcBroker /> }],
  },
  {
    path: "/deal-approval",
    element: <Layout />,
    children: [{ index: true, element: <DealApproval /> }],
  },
  {
    path: "/dashboard",
    element: <Layout />,
    children: [{ index: true, element: <Dashboard /> }],
  },
  {
    path: "/admin",
    element: <Layout />,
    children: [{ index: true, element: <Admin /> }],
  },
  {
    path: "/swap/*",
    element: <Layout />,
    children: [
      { index: true, element: <Swap /> },
      { path: "*", element: <Swap /> },
    ],
  },
  {
    path: "/settings",
    element: <Layout />,
    children: [
      {
        element: <SettingsLayout />,
        children: [
          { index: true, element: <></> },
          { path: "profile", element: <Settings /> },
          { path: "appearance", element: <SettingAppearance /> },
        ],
      },
    ],
  },
]);

// ─────────────────────────────────────────────────────────────────────────────

function App() {

  useEffect(() => {
    if (
      localStorage.getItem("color-theme") === "dark" ||
      (!("color-theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  return (
    <div className="w-screen h-screen overflow-x-hidden bg-page font-openmarket-general-sans">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <RouterProvider router={router} />
            <ToastContainer />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

export default App;
