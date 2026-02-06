import React, { useState } from "react";
import Button from "../components/common/Button";
import { DeleteIcon } from "../assets/icons";

function SettingWallet() {
  const [walletList, setWalletList] = useState([
    {
      name: "Account 1",
      wallet: "0xFKWHdYgE4A91cLE54iJl1uconwXg0Jna",
    },
    {
      name: "Account 2",
      wallet: "0xAFqkMFMvWfqqDbppJcGwbyUsmc9nOTdY",
    },
  ]);

  return (
    <div>
      <div>
        <p className="font-semibold text-base text-baseWhiteDark dark:text-baseWhite border-b border-gray300 dark:border-gray300Dark pb-[10px]">
          Wallet Settings
        </p>
        <div className="flex flex-col mt-[10px] gap-y-[10px]">
          <div>
            <p className="font-semibold text-base text-baseWhiteDark dark:text-baseWhite">
              Login Wallet
            </p>
            <p className="font-medium text-sm text-gray500 dark:text-gray500Dark mt-1">
              Wallet whitelisted for SettleX login
            </p>
          </div>
          <input
            type="text"
            className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-black border-gray300 dark:border-gray300Dark"
            value={"0xXyJVwUpdbNcnnePBMZjSmUI9pX7ek0dy"}
            disabled
          />
        </div>
        <div className="flex flex-col mt-[10px] md:mt-[30px] gap-y-[10px] pb-[10px] md:pb-11 border-b border-gray300 dark:border-gray300Dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-base text-baseWhiteDark dark:text-baseWhite">
                Allocation Wallet
              </p>
              <p className="hidden md:block font-medium text-sm text-gray500 dark:text-gray500Dark mt-1">
                Wallets where you will receive your tokens
              </p>
            </div>
            <button className="font-semibold text-sm text-baseWhiteDark dark:text-baseWhite py-[6px] px-5 bg-baseWhite dark:bg-black rounded-full border border-theme-green">
              Add New Wallet
            </button>
          </div>
          {walletList.map((item, index) => {
            return (
              <div
                key={index}
                className="flex rounded-full bg-baseWhite dark:bg-black border border-gray300 dark:border-gray300Dark overflow-hidden"
              >
                <p className="text-sm font-medium text-baseWhiteDark dark:text-baseWhite whitespace-nowrap bg-gray200 dark:bg-gray200Dark px-3 py-[10px]">
                  Account 1:
                </p>
                <div className="flex-1 flex items-center justify-between pl-[10px] pr-4">
                  <input
                    className="text-sm font-medium text-baseWhiteDark dark:text-baseWhite w-full outline-none bg-transparent"
                    type="text"
                    value={"0xFKWHdYgE4A91cLE54iJl1uconwXg0Jna"}
                    onChange={(e) => {}}
                  />
                  <button className="text-sm font-medium text-error flex items-center gap-x-1 whitespace-nowrap">
                    <span>
                      <DeleteIcon />
                    </span>
                    <p className="hidden md:block">Remove Wallet</p>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col-reverse md:flex-row w-full md:w-1/2 mt-[10px] md:mt-4 gap-x-4 gap-y-4">
        <Button
          variant="PrimaryButton"
          className="!rounded-full whitespace-nowrap py-3 flex-1 justify-center w-full md:w-fit"
        >
          Save Changes
        </Button>
        <Button
          variant="PrimaryButton"
          className="!rounded-full whitespace-nowrap py-3 bg-none !bg-gray200 dark:!bg-gray200Dark !text-gray500 dark:text-gray500Dark flex-1 justify-center w-full md:w-fit"
        >
          Discard Changes
        </Button>
      </div>
    </div>
  );
}

export default SettingWallet;
