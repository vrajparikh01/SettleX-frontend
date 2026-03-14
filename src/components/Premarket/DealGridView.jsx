import React from "react";
import Button from "../common/Button";
import { ShuffleIcon } from "../../assets/icons";
import LavaLogo from "../../assets/images/LavaLogo.png";
import CircularProgress from "../common/CircularProgress";
import { formatStringToNumber } from "../../utils";
import EnsDisplay from "../common/EnsDisplay";
import EnsReputationBadge from "../common/EnsReputationBadge";

function DealGridView({
  total_token,
  available_token,
  number_of_token_require,
  completion_percentage,
  price_per_token,
  offer_token,
  receive_token,
  start_date,
  end_date,
  tge,
  isBuy,
  receiver_wallet_address,
  onButtonClick = () => {},
}) {
  function convertTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { year: "numeric", month: "short", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
  }
  const currentDate = Math.floor(new Date().getTime() / 1000);

  return (
    <div className="flex flex-col w-full bg-baseWhite dark:bg-black border border-gray300 dark:border-gray300Dark font-openmarket-general-sans rounded-[14px] p-[14px]">
      <div className="flex items-center flex-1 gap-x-2">
        <img
          src={offer_token?.token_image || LavaLogo}
          alt="logo"
          className="w-12 h-12 rounded-full"
        />
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-base leading-[22px] font-semibold text-baseWhiteDark dark:text-baseWhite">
              {formatStringToNumber(total_token)}
            </p>
            <p className="text-xs font-medium leading-4 text-gray500 dark:text-gray500Dark">
              ${price_per_token}/{offer_token?.symbol}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-base leading-[22px] font-semibold text-baseWhiteDark dark:text-baseWhite">
              {formatStringToNumber(number_of_token_require)}
            </p>
            <p className="flex items-center text-xs font-medium leading-4 text-gray500 dark:text-gray500Dark gap-x-1">
              <span className="block w-4 h-4">
                <ShuffleIcon />
              </span>
              {receive_token?.symbol}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-between pt-[10px] mt-[10px] border-t border-gray300 dark:border-gray300Dark gap-y-4">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray500 dark:text-gray500Dark leading-[18px]">
            Settle Starts
          </p>
          <p className="text-sm font-semibold text-theme-green">
            {start_date ? convertTime(start_date) : "TBA"}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-sm font-medium text-gray500 dark:text-gray500Dark leading-[18px]">
            Settle Ends
          </p>
          <p className="text-sm font-semibold text-theme-green">
            {end_date ? convertTime(end_date) : "TBA"}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-[10px] mt-[10px] border-t border-gray300 dark:border-gray300Dark">
        <div className="flex items-center gap-x-2">
          <CircularProgress percentage={completion_percentage} />
          {receiver_wallet_address && (
            <div className="flex flex-col gap-y-[3px]">
              <div className="flex items-center gap-x-[6px]">
                <EnsDisplay
                  address={receiver_wallet_address}
                  showAvatar={true}
                  avatarClassName="w-5 h-5"
                  className="text-xs"
                />
                <EnsReputationBadge address={receiver_wallet_address} compact={true} />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-x-[6px]">
          {/* <p className="text-sm font-medium text-gray500 dark:text-gray500Dark font-openmarket-general-sans flex items-center gap-x-[6px]">
            <span className="block w-4 h-4">
              <EyeGrayIcon />
            </span>
            4349
          </p> */}
          {isBuy ? (
            <Button
              variant="PrimaryButton"
              className="!rounded-full"
              onClick={onButtonClick}
              disabled={
                completion_percentage == 100 || (tge && currentDate > tge)
              }
            >
              Buy
            </Button>
          ) : (
            <Button
              variant="PrimaryButton"
              className="!rounded-full !bg-red-gradient !text-white"
              onClick={onButtonClick}
              disabled={
                completion_percentage == 100 || (tge && currentDate > tge)
              }
            >
              Sell
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DealGridView;
