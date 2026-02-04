import React from "react";
import { ShuffleIcon } from "../assets/icons";
import { formatStringToNumber } from "../utils";
import LavaLogo from "../assets/images/LavaLogo.png";

function OtcActivityList({ trade, number_of_token, number_of_token_received }) {
  return (
    <div className="grid items-center w-full grid-cols-6 bg-baseWhite dark:bg-black border border-gray300 dark:border-gray300Dark font-openmarket-general-sans rounded-[20px] py-[14px] px-[14px]">
      <div className="flex items-center col-span-2 gap-x-3">
        <img
          src={trade?.offer_token?.token_image || LavaLogo}
          alt="logo"
          className="w-12 h-12"
        />
        <div className="flex flex-col">
          <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
            {formatStringToNumber(trade?.total_token)}
          </p>
          <p className="text-xs font-medium leading-4 text-gray500 dark:text-gray500Dark">
            ${trade?.price_per_token}/{trade?.offer_token?.symbol}
          </p>
        </div>
      </div>
      <div className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
        <p>
          {trade?.total_receive_token
            ? formatStringToNumber(trade?.total_receive_token?.toFixed(6))
            : "-"}
        </p>
        <p className="flex items-center text-xs font-medium text-gray500 dark:text-gray500Dark gap-x-1">
          <ShuffleIcon /> {trade?.receive_token?.symbol}
        </p>
      </div>
      <p className="text-sm font-medium flex gap-x-[6px] items-center text-gray500 dark:text-gray500Dark">
        {trade?.trade_type
          ? `${formatStringToNumber(Number(number_of_token.toFixed(6)))} ${
              trade?.offer_token?.symbol
            }`
          : `${
              number_of_token_received
                ? formatStringToNumber(
                    Number(number_of_token_received.toFixed(6))
                  )
                : "-"
            } ${trade?.receive_token?.symbol}`}
      </p>
      <p className="text-sm font-medium flex gap-x-[6px] items-center text-gray500 dark:text-gray500Dark">
        {!trade?.trade_type
          ? `${formatStringToNumber(Number(number_of_token.toFixed(2)))} ${
              trade?.offer_token?.symbol
            }`
          : `${
              number_of_token_received
                ? formatStringToNumber(
                    Number(number_of_token_received.toFixed(2))
                  )
                : "-"
            } ${trade?.receive_token?.symbol}`}
      </p>
      <p className="text-base font-semibold justify-self-center text-baseWhiteDark dark:text-baseWhite">
        {!trade?.trade_type ? "Buy" : "Sell"}
      </p>
    </div>
  );
}

export default OtcActivityList;
