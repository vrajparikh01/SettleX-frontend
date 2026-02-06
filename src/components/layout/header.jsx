import React, { useEffect, useState } from "react";
import {
  BrokerIcon,
  BrokersDarkIcon,
  CrossIcon,
  Dashboard,
  DashboardDarkIcon,
  Logo,
  MenuIcon,
  OTCDarkIcon,
  OTCLogo,
  Portfolio,
  PortfolioDarkIcon,
  PreMarket,
  PremarketDarkIcon,
  SettingsDarkIcon,
} from "../../assets/icons";
import { NavLink, useLocation } from "react-router-dom";
import ConnectWalletButton from "../common/ConnectWalletButton";
import { useAccount } from "wagmi";
import { loginUser } from "../../services/auth";

function Header() {
  const account = useAccount();
  const location = useLocation();
  const [openHam, setOpenHam] = useState({
    isOpen: false,
    isAnimating: false,
  });
  const handleHamburgerClick = (event) => {
    const element = document.getElementById("layout");
    if (openHam.isAnimating) {
      event.preventDefault();
    } else {
      if (openHam.isOpen) {
        setOpenHam((prev) => ({ ...prev, isAnimating: true }));
        const hamburgerMenu =
          document.getElementsByClassName("expand_animation")[0];
        hamburgerMenu.classList.remove("expand_animation");
        hamburgerMenu.classList.add("shrink_animation");
        const animationTimeout = setTimeout(() => {
          setOpenHam((prev) => ({
            isAnimating: false,
            isOpen: !prev.isOpen,
          }));
          clearTimeout(animationTimeout);
        }, 200);
      } else {
        setOpenHam((prev) => ({ ...prev, isOpen: !prev.isOpen }));
      }
      if (!openHam.isOpen) {
        element.classList.add("!overflow-y-hidden");
      } else {
        element.classList.remove("!overflow-y-hidden");
      }
    }
  };

  async function handleLogin() {
    const { address, chainId } = account;
    const res = await loginUser({ wallet_address: address, chainId: chainId });
  }
  useEffect(() => {
    if (account?.isConnected) {
      handleLogin();
    }
  }, [account?.isConnected, account?.address, account?.chainId]);
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 md:px-8 md:py-6 border-b font-openmarket-general-sans border-gray300 dark:border-gray300Dark bg-baseWhite dark:bg-black relative ${
        openHam?.isOpen ? "bg-brand-gradient" : ""
      }`}
    >
      {openHam?.isOpen ? (
        <div className="h-screen w-screen bg-black/50 fixed z-[10] top-[77px] left-0 backdrop-blur-[10px] overflow-y-hidden"></div>
      ) : (
        <></>
      )}
      <div className="flex flex-1 items-center gap-x-[30px] justify-between md:justify-normal">
        <Logo isDark={openHam?.isOpen} />
        <div className="items-center justify-between flex-1 hidden text-base font-medium md:flex text-gray500 dark:text-gray500Dark">
          <div className="flex items-center">
            <NavLink
              to={"/"}
              className={({ isActive }) =>
                isActive
                  ? "text-baseWhiteDark dark:text-baseWhite font-semibold flex items-center gap-x-2 px-3 py-[6px]"
                  : "flex items-center gap-x-2 px-3 py-[6px]"
              }
            >
              <span>
                <PreMarket isActive={location?.pathname == "/"} />
              </span>
              Premarket
            </NavLink>
            <NavLink
              to={"/otc"}
              className={({ isActive }) =>
                isActive
                  ? "text-baseWhiteDark dark:text-baseWhite font-semibold flex items-center gap-x-2 px-3 py-[6px]"
                  : "flex items-center gap-x-2 px-3 py-[6px]"
              }
            >
              <OTCLogo isActive={location?.pathname.includes("/otc")} />
              OTC
            </NavLink>
            <NavLink
              to={"/broker"}
              className={({ isActive }) =>
                isActive
                  ? "text-baseWhiteDark dark:text-baseWhite font-semibold flex items-center gap-x-2 px-3 py-[6px]"
                  : "flex items-center gap-x-2 px-3 py-[6px]"
              }
            >
              <BrokerIcon isActive={location?.pathname.includes("/broker")} />
              Broker
            </NavLink>
            {/* Equity NavLink commented out for Li.Fi integration */}
            {/* <NavLink
              to={"/equity"}
              className={({ isActive }) =>
                isActive
                  ? "text-baseWhiteDark dark:text-baseWhite font-semibold flex items-center gap-x-2 px-3 py-[6px]"
                  : "flex items-center gap-x-2 px-3 py-[6px]"
              }
            >
              <span>
                <Portfolio isActive={location?.pathname == "/equity"} />
              </span>
              Equity
            </NavLink> */}
            <NavLink
              to={"/swap"}
              className={({ isActive }) =>
                isActive
                  ? "text-baseWhiteDark dark:text-baseWhite font-semibold flex items-center gap-x-2 px-3 py-[6px]"
                  : "flex items-center gap-x-2 px-3 py-[6px]"
              }
            >
              <span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </span>
              Swap/Bridge
            </NavLink>
            <NavLink
              to={"/dashboard"}
              className={({ isActive }) =>
                isActive
                  ? "text-baseWhiteDark dark:text-baseWhite font-semibold flex items-center gap-x-2 px-3 py-[6px]"
                  : "flex items-center gap-x-2 px-3 py-[6px]"
              }
            >
              <span>
                <Dashboard isActive={location?.pathname == "/dashboard"} />
              </span>
              Dashboard
            </NavLink>
          </div>
          <div className="flex items-center gap-x-4">
            <NavLink
              to={"/settings/appearance"}
              className={({ isActive }) => `p-2 w-fit rounded-full
              ${
                location?.pathname?.includes("/settings")
                  ? "bg-brand-gradient"
                  : "bg-light-gradient dark:bg-light-gradientDark"
              }
              `}
            >
              <SettingsDarkIcon
                isActive={location?.pathname.includes("/settings")}
              />
            </NavLink>
            <ConnectWalletButton />
          </div>
        </div>
        <button
          className="flex md:hidden p-[10px] rounded-full bg-primary100 dark:bg-primary100Dark outline-none"
          onClick={handleHamburgerClick}
        >
          {!openHam?.isOpen ? <MenuIcon /> : <CrossIcon />}
        </button>
        {openHam?.isOpen ? (
          <div className="z-50 backdrop-blur-[20px] absolute left-0 w-full origin-top bg-baseWhite dark:bg-black top-full md:hidden expand_animation">
            <div className="flex flex-col gap-y-[10px] px-5 py-4">
              <NavLink
                to={"/"}
                className={({ isActive }) =>
                  isActive
                    ? "text-baseWhiteDark font-semibold flex items-center py-4 bg-brand-gradient rounded-[14px] gap-x-2 justify-center"
                    : "flex items-center justify-center gap-x-2 py-4 font-medium text-baseWhiteDark dark:text-baseWhite"
                }
                onClick={handleHamburgerClick}
              >
                <span>
                  <PremarketDarkIcon isActive={location?.pathname == "/"} />
                </span>
                Premarket
              </NavLink>
              <NavLink
                to={"/otc"}
                className={({ isActive }) =>
                  isActive
                    ? "text-baseWhiteDark font-semibold flex items-center py-4 bg-brand-gradient rounded-[14px] gap-x-2 justify-center"
                    : "flex items-center justify-center gap-x-2 py-4 font-medium text-baseWhiteDark dark:text-baseWhite"
                }
                onClick={handleHamburgerClick}
              >
                <OTCDarkIcon isActive={location?.pathname.includes("/otc")} />
                OTC
              </NavLink>
              <NavLink
                to={"/broker"}
                className={({ isActive }) =>
                  isActive
                    ? "text-baseWhiteDark font-semibold flex items-center py-4 bg-brand-gradient rounded-[14px] gap-x-2 justify-center"
                    : "flex items-center justify-center gap-x-2 py-4 font-medium text-baseWhiteDark dark:text-baseWhite"
                }
                onClick={handleHamburgerClick}
              >
                <BrokersDarkIcon
                  isActive={location?.pathname.includes("/broker")}
                />
                Broker
              </NavLink>
              {/* Equity NavLink commented out for Li.Fi integration */}
              {/* <NavLink
                to={"/equity"}
                className={({ isActive}) =>
                  isActive
                    ? "text-baseWhiteDark font-semibold flex items-center py-4 bg-brand-gradient rounded-[14px] gap-x-2 justify-center"
                    : "flex items-center justify-center gap-x-2 py-4 font-medium text-baseWhiteDark dark:text-baseWhite"
                }
                onClick={handleHamburgerClick}
              >
                <span>
                  <PortfolioDarkIcon
                    isActive={location?.pathname == "/equity"}
                  />
                </span>
                Equity
              </NavLink> */}
              <NavLink
                to={"/swap"}
                className={({ isActive }) =>
                  isActive
                    ? "text-baseWhiteDark font-semibold flex items-center py-4 bg-brand-gradient rounded-[14px] gap-x-2 justify-center"
                    : "flex items-center justify-center gap-x-2 py-4 font-medium text-baseWhiteDark dark:text-baseWhite"
                }
                onClick={handleHamburgerClick}
              >
                <span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </span>
                Swap
              </NavLink>
              <NavLink
                to={"/dashboard"}
                className={({ isActive }) =>
                  isActive
                    ? "text-baseWhiteDark font-semibold flex items-center py-4 bg-brand-gradient rounded-[14px] gap-x-2 justify-center"
                    : "flex items-center justify-center gap-x-2 py-4 font-medium text-baseWhiteDark dark:text-baseWhite"
                }
                onClick={handleHamburgerClick}
              >
                <span>
                  <PremarketDarkIcon
                    isActive={location?.pathname == "/dashboard"}
                  />
                </span>
                Dashboard
              </NavLink>
            </div>
            <div className="flex items-center justify-between p-5 bg-light-gradient">
              <NavLink
                to={"/settings/appearance"}
                className={`p-2 w-fit rounded-full
              ${
                location?.pathname?.includes("/settings")
                  ? "bg-brand-gradient"
                  : "bg-brand-gradient"
              }
              `}
                onClick={handleHamburgerClick}
              >
                <SettingsDarkIcon />
              </NavLink>
              <ConnectWalletButton />
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default Header;
