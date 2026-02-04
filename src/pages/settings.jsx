import React from "react";
import Button from "../components/common/Button";

function Settings() {
  return (
    <div>
      <div>
        <p className="font-semibold text-base text-baseWhiteDark dark:text-baseWhite border-b border-gray300 dark:border-gray300Dark pb-[10px]">
          User Information
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 pt-[10px] gap-x-4 gap-y-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
              Full Name
            </p>
            <input
              type="text"
              className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
              placeholder="Enter Name"
              onChange={(e) => {}}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
              Email Address
            </p>
            <input
              type="text"
              className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
              placeholder="Enter Email"
              onChange={(e) => {}}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
              Website
            </p>
            <input
              type="text"
              className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
              placeholder="Enter Website Url"
              onChange={(e) => {}}
            />
          </div>
        </div>
      </div>
      <div className="mt-[30px] pb-7 border-b border-gray300 dark:border-gray300Dark">
        <p className="font-semibold text-base text-baseWhiteDark dark:text-baseWhite border-b border-gray300 dark:border-gray300Dark pb-[10px]">
          Social Links
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 pt-[10px] gap-x-4 gap-y-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
              Telegram
            </p>
            <input
              type="text"
              className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
              placeholder="Enter Telegram Url"
              onChange={(e) => {}}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
              Twitter
            </p>
            <input
              type="text"
              className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
              placeholder="Enter Twitter Url"
              onChange={(e) => {}}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
              Discord
            </p>
            <input
              type="text"
              className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
              placeholder="Enter Discord Url"
              onChange={(e) => {}}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium mb-[5px] text-gray500 dark:text-gray500Dark">
              Other Links
            </p>
            <input
              type="text"
              className="w-full font-medium text-baseWhiteDark dark:text-baseWhite outline-none placeholder:font-normal py-[10px] px-3 text-sm border rounded-full bg-baseWhite dark:bg-baseWhiteDark border-gray300 dark:border-gray300Dark"
              placeholder="Enter Web Links"
              onChange={(e) => {}}
            />
          </div>
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

export default Settings;
