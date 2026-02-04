import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletDark, DropdownArrow } from "../../assets/icons";

function ConnectWalletButton({ fullVariant = false }) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    className={`py-2 px-5 bg-brand-gradient font-semibold whitespace-nowrap text-baseWhiteDark dark:text-baseWhite rounded-full ${
                      fullVariant ? "w-full" : "w-fit"
                    }`}
                    onClick={openConnectModal}
                    type="button"
                  >
                    <p>{fullVariant ? "Connect Wallet" : "Connect"}</p>
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }

              return (
                <button
                  className="flex items-center gap-x-[10px] py-2 px-5 bg-brand-gradient rounded-full text-sm tracking-tight font-medium text-baseWhiteDark"
                  onClick={openAccountModal}
                >
                  <p className="whitespace-nowrap">{account.displayName}</p>
                  <DropdownArrow stroke={"stroke-baseWhiteDark"} />
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export default ConnectWalletButton;
