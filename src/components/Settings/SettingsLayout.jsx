import React from "react";
import {
  AppearanceIcon,
  ProfileIcon,
  WalletSettingsIcon,
} from "../../assets/icons";
import { NavLink, Outlet, useLocation } from "react-router-dom";

function SettingsLayout() {
  const location = useLocation();
  return (
    <div className="px-5 py-4 md:px-8">
      <div className="w-full bg-gray100 dark:bg-gray100Dark py-[10px] px-[10px] md:py-3 md:px-5 rounded-[14px] border border-gray200 dark:border-gray200Dark text-2xl md:text-[32px] md:leading-[44px] font-semibold text-baseWhiteDark dark:text-baseWhite">
        Settings
      </div>
      <div className="flex mt-[10px] md:mt-6 flex-col md:flex-row md:bg-gray100 dark:bg-gray100Dark md:border md:border-gray200 dark:border-gray200Dark rounded-[14px]">
        <div className="w-full md:w-[20%] p-[10px] md:p-4 bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark md:border-0 md:border-r md:border-gray300 md:dark:border-gray300Dark md:bg-transparent rounded-[14px] md:rounded-none">
          <p className="pb-[10px] border-b border-gray300 dark:border-gray300Dark font-semibold text-base text-baseWhiteDark dark:text-baseWhite">
            My Account
          </p>
          <div className="pt-[10px] flex flex-row md:flex-col gap-y-[10px]">
            {/* <NavLink
              to={"/settings/profile"}
              className={`text-base font-semibold flex items-center gap-x-[5px] md:gap-x-[10px] py-[7px] px-[10px] md:py-0 md:px-0 ${
                location?.pathname?.includes("/settings/profile")
                  ? "text-baseWhiteDark md:dark:text-theme-green md:text-theme-green bg-brand-gradient md:bg-none rounded-3xl md:rounded-none"
                  : "text-gray500 dark:text-gray500Dark"
              }`}
            >
              <span>
                <ProfileIcon
                  isActive={location?.pathname?.includes("/settings/profile")}
                  isDark={window?.innerWidth < 768}
                />
              </span>
              <p>Profile</p>
            </NavLink> */}
            {/* <NavLink
              to={"/settings/wallet"}
              className={`text-base font-semibold flex items-center gap-x-[5px] md:gap-x-[10px] py-[7px] px-[10px] md:py-0 md:px-0 ${
                location?.pathname?.includes("/settings/wallet")
                  ? "text-baseWhiteDark md:dark:text-theme-green md:text-theme-green bg-brand-gradient md:bg-none rounded-3xl md:rounded-none"
                  : "text-gray500 dark:text-gray500Dark"
              }`}
            >
              <span>
                <WalletSettingsIcon
                  isActive={location?.pathname?.includes("/settings/wallet")}
                  isDark={window?.innerWidth < 768}
                />
              </span>
              <p>Wallet</p>
            </NavLink> */}
            <NavLink
              to={"/settings/appearance"}
              className={`text-base font-semibold flex items-center gap-x-[5px] md:gap-x-[10px] py-[7px] px-[10px] md:py-0 md:px-0 ${
                location?.pathname?.includes("/appearance")
                  ? "text-baseWhiteDark md:dark:text-theme-green md:text-theme-green bg-brand-gradient md:bg-none rounded-3xl md:rounded-none"
                  : "text-gray500 dark:text-gray500Dark"
              }`}
            >
              <span>
                <AppearanceIcon
                  isActive={location?.pathname?.includes("/appearance")}
                  isDark={window?.innerWidth < 768}
                />
              </span>
              <p>Appearance</p>
            </NavLink>
          </div>
        </div>
        <div className="p-[10px] pt-[10px] md:p-4 md:pt-7 w-full md:w-[80%] bg-gray100 dark:bg-gray100Dark border border-gray200 dark:border-gray200Dark md:bg-transparent md:border-none mt-[10px] md:mt-[10px] rounded-[14px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default SettingsLayout;
