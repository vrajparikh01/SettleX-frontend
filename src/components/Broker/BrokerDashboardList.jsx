import React from "react";
import Button from "../common/Button";
import { ShuffleIcon } from "../../assets/icons";
import { formatStringToNumber } from "../../utils";
import { toast } from "react-toastify";
import LavaLogo from "../../assets/images/LavaLogo.png";

function BrokerDashboardList({
  _id = "",
  total_token,
  price_per_token,
  offer_token,
  receive_token,
  broker_fee = 0,
  trade_type,
  is_deal_created,
  onButtonClick = () => {},
}) {
  return (
    <div className="grid items-center w-full grid-cols-7 bg-baseWhite dark:bg-black border border-gray300 dark:border-gray300Dark font-openmarket-general-sans rounded-[20px] py-[14px] px-[14px] cursor-pointer">
      <div className="flex items-center col-span-2 gap-x-3">
        <img
          src={offer_token?.token_image || LavaLogo}
          alt="logo"
          className="w-12 h-12"
        />
        <div className="flex flex-col">
          <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
            {formatStringToNumber(total_token)}
          </p>
          <p className="text-xs font-medium leading-4 text-gray500 dark:text-gray500Dark">
            ${price_per_token}/{offer_token?.symbol}
          </p>
        </div>
      </div>
      <div className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
        <p>
          {formatStringToNumber(
            Number(
              Number(
                (total_token * price_per_token) / receive_token?.price
              ).toFixed(2)
            )
          )}
        </p>
        <p className="flex items-center text-xs font-medium text-gray500 dark:text-gray500Dark gap-x-1">
          <ShuffleIcon /> {receive_token?.symbol}
        </p>
      </div>
      <p className="text-sm font-medium flex gap-x-[6px] items-center text-gray500 dark:text-gray500Dark">
        {broker_fee}%
      </p>
      <p
        className={`text-sm font-semibold flex gap-x-[6px] items-center ${
          trade_type ? "text-theme-green" : "text-theme-red"
        }`}
      >
        {trade_type ? "Buy" : "Sell"}
      </p>
      <p
        className={`text-sm font-medium flex gap-x-[6px] items-center text-gray500 dark:text-gray500Dark`}
      >
        {is_deal_created ? "YES" : "NO"}
        {/* {trade_type ? "Full" : "Partial"} */}
      </p>
      <Button
        variant="TransparentButton"
        className="!rounded-full !justify-self-end"
        onClick={() => {
          navigator.clipboard.writeText(
            window?.location?.origin + "/deal-approval?id=" + _id
          );
          toast.success("Link copied to your clipboard");
        }}
      >
        Copy Link
      </Button>
    </div>
  );
}

export default BrokerDashboardList;
