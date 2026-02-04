import React from "react";
import Button from "../common/Button";
import { ShuffleIcon } from "../../assets/icons";
import LavaLogo from "../../assets/images/LavaLogo.png";
import CircularProgress from "../common/CircularProgress";
import Loading from "../../assets/icons/loading";
import { formatStringToNumber } from "../../utils";

function PremarketInvestedTableView({
  number_of_token_require,
  trade_info,
  start_date,
  end_date,
  tge,
  loading,
  is_distributed,
  is_claimed,
  handleDistribute = () => {},
  handleCancel = () => {},
}) {
  function convertTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { year: "numeric", month: "short", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
  }
  return (
    <div className="grid items-center w-full grid-cols-10 bg-baseWhite dark:bg-black font-openmarket-general-sans rounded-[14px] py-[14px] border border-gray300 dark:border-gray300Dark px-2">
      <div className="flex items-center col-span-2 gap-x-2">
        {true ? (
          <img
            src={trade_info?.offer_token?.token_image || LavaLogo}
            alt="logo"
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <></>
        )}
        <div className="flex flex-col">
          <p className="text-base font-semibold text-baseWhiteDark dark:text-baseWhite">
            {formatStringToNumber(trade_info?.total_token)}
          </p>
          <p className="text-xs font-medium text-gray500 dark:text-gray500Dark">
            ${trade_info?.price_per_token}/{trade_info?.offer_token?.symbol}
          </p>
        </div>
      </div>
      <div className="flex flex-col col-span-1">
        <p className="text-sm font-semibold text-baseWhiteDark dark:text-baseWhite">
          {formatStringToNumber(number_of_token_require)}
        </p>
        <p className="flex items-center text-xs font-medium text-gray500 dark:text-gray500Dark gap-x-1">
          <ShuffleIcon />
          {trade_info?.receive_token?.symbol}
        </p>
      </div>
      <div className="col-span-2">
        <p className="text-sm font-semibold text-theme-green">
          {start_date ? convertTime(start_date) : "TBA"}
        </p>
      </div>
      <div className="col-span-2">
        <p className="text-sm font-semibold text-theme-green">
          {end_date ? convertTime(end_date) : "TBA"}
        </p>
      </div>
      <div className="col-span-1">
        <CircularProgress percentage={trade_info?.completion_percentage} />
      </div>
      <div className="flex justify-center col-span-2 gap-x-1">
        {!trade_info?.trade_type ? (
          is_claimed ? (
            <p className="text-sm font-semibold">Cancelled</p>
          ) : trade_info?.is_distributed ? (
            <p className="text-sm font-semibold">Settled</p>
          ) : (
            <Button
              variant="PrimaryButton"
              className="!rounded-full !bg-red-gradient !text-white"
              onClick={() => {
                handleCancel(trade_info?.trade_index_from_blockchain);
              }}
              disabled={
                new Date().getTime() / 1000 < tge + 24 * 60 * 60 || loading
              }
            >
              {loading ? <Loading /> : "Claim"}
            </Button>
          )
        ) : !is_distributed ? (
          <Button
            variant="PrimaryButton"
            className="!rounded-full"
            onClick={() => {
              handleDistribute(trade_info?.trade_index_from_blockchain);
            }}
            disabled={
              new Date().getTime() / 1000 < tge ||
              new Date().getTime() / 1000 > tge + 24 * 60 * 60 ||
              loading
            }
          >
            {loading ? <Loading /> : "Distribute"}
          </Button>
        ) : (
          <p className="text-sm font-semibold">Distributed</p>
        )}
      </div>
    </div>
  );
}

export default PremarketInvestedTableView;
