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
import { sepolia, polygon } from "wagmi/chains";
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
import Equity from "./pages/equity";

function App() {
  const config = getDefaultConfig({
    appName: "RainbowKit demo",
    projectId: "YOUR_PROJECT_ID",
    chains: import.meta.env.VITE_ENV === "production" ? [polygon] : [sepolia],
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
    transports:
      import.meta.env.VITE_ENV === "production"
        ? {
            [polygon.id]: http(import.meta.env.VITE_POLYGON_RPC_URL),
          }
        : {
            [sepolia.id]: http(import.meta.env.VITE_RPC_URL),
          },
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
      // errorElement: <ErrorPage />,
      children: [{ index: true, element: <Premarket /> }],
    },
    {
      path: "/otc",
      element: <Layout />,
      // errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Otc /> },
        {
          path: "details",
          element: <OtcDetails />,
        },
      ],
    },
    {
      path: "/broker",
      element: <Layout />,
      // errorElement: <ErrorPage />,
      children: [{ index: true, element: <OtcBroker /> }],
    },
    {
      path: "/deal-approval",
      element: <Layout />,
      // errorElement: <ErrorPage />,
      children: [{ index: true, element: <DealApproval /> }],
    },
    {
      path: "/dashboard",
      element: <Layout />,
      // errorElement: <ErrorPage />,
      children: [{ index: true, element: <Dashboard /> }],
    },
    {
      path: "/admin",
      element: <Layout />,
      // errorElement: <ErrorPage />,
      children: [{ index: true, element: <Admin /> }],
    },
    {
      path: "/equity",
      element: <Layout />,
      // errorElement: <ErrorPage />,
      children: [{ index: true, element: <Equity /> }],
    },
    {
      path: "/settings",
      element: <Layout />,
      // errorElement: <ErrorPage />, // Uncomment if you have an ErrorPage component
      children: [
        {
          element: <SettingsLayout />,
          children: [
            { index: true, element: <></> },
            { path: "profile", element: <Settings /> },
            // {
            //   path: "wallet",
            //   element: <SettingWallet />,
            // },
            {
              path: "appearance",
              element: <SettingAppearance />,
            },
          ],
        },
      ],
    },
  ]);

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
